import csv
import io
import re
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.courses.repository import CourseRepository
from app.modules.enrollment.repository import EnrollmentRepository
from app.modules.scheduling.models import Slot
from app.modules.scheduling.repository import SchedulingRepository
from app.modules.scheduling.schedule import (
    generate_schedule_from_teacher_slots,
    required_lessons_for_course,
)
from app.modules.scheduling.schemas import (
    GlobalCourseBuildResult,
    GlobalScheduleGenerateIn,
    GlobalScheduleGenerateOut,
    TimetableItemOut,
)
from app.modules.solver.algorithm import generate_schedule


class SchedulingService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = SchedulingRepository(db=db)

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

    @staticmethod
    def _is_student(current_user: dict) -> bool:
        return current_user.get("user_type") == "student"

    @staticmethod
    def _to_timetable_item(row) -> TimetableItemOut:
        schedule, course_class, course, staff = row
        teacher_name = f"{staff.first_name} {staff.last_name}".strip()
        return TimetableItemOut(
            schedule_id=schedule.id,
            course_id=course.id,
            course_title=course.title,
            class_number=course_class.class_number,
            staff_id=staff.id,
            teacher_name=teacher_name,
            lesson_date=schedule.lesson_date,
            lesson_time=schedule.lesson_time,
            slot_id=schedule.slot_id,
        )

    @staticmethod
    def _escape_ics_text(value: str) -> str:
        return (
            value.replace("\\", "\\\\")
            .replace("\n", "\\n")
            .replace(",", "\\,")
            .replace(";", "\\;")
        )

    @staticmethod
    def _safe_filename(value: str) -> str:
        safe = re.sub(r"[^a-zA-Z0-9_-]+", "_", value.strip())
        return safe.strip("_") or "schedule"

    @staticmethod
    def _format_schedule_by_courses(raw_schedule, course_classes, courses, slots):
        cc_map = {cc.id: cc for cc in course_classes}
        course_map = {course.id: course for course in courses}
        slot_map = {slot.id: slot for slot in slots}

        result = defaultdict(lambda: {
            "course_id": None,
            "course": "",
            "teacher_id": None,
            "teacher": "",
            "lessons": [],
        })

        for item in raw_schedule:
            cc = cc_map.get(item["course_class_id"])
            slot = slot_map.get(item["slot_id"])

            if cc is None or slot is None:
                continue

            course = course_map.get(cc.course_id)

            if course is None:
                continue

            teacher = getattr(course, "staff", None)
            teacher_name = (
                f"{teacher.first_name} {teacher.last_name}".strip()
                if teacher else "Unknown"
            )

            start_dt = datetime.combine(slot.slot_date, slot.slot_time)
            end_dt = start_dt + timedelta(minutes=60)

            entry = result[course.id]
            entry["course_id"] = course.id
            entry["course"] = course.title
            entry["teacher_id"] = course.staff_id
            entry["teacher"] = teacher_name

            entry["lessons"].append({
                "course_class_id": cc.id,
                "class_number": cc.class_number,
                "slot_id": slot.id,
                "date": str(slot.slot_date),
                "start_time": slot.slot_time.strftime("%H:%M:%S"),
                "end_time": end_dt.time().strftime("%H:%M:%S"),
            })

        for course_id in result:
            result[course_id]["lessons"].sort(
                key=lambda lesson: lesson["class_number"]
            )

        return list(result.values())
    
    @staticmethod
    def _event_from_row(row):
        schedule, course_class, course, staff = row

        start_dt = datetime.combine(schedule.lesson_date, schedule.lesson_time)
        end_dt = start_dt + timedelta(minutes=60)
        teacher_name = f"{staff.first_name} {staff.last_name}".strip()

        return {
            "id": f"schedule_{schedule.id}",
            "title": f"{course.title} — занятие {course_class.class_number}",
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "extendedProps": {
                "schedule_id": schedule.id,
                "course_id": course.id,
                "course_title": course.title,
                "course_class_id": course_class.id,
                "class_number": course_class.class_number,
                "teacher_id": staff.id,
                "teacher_name": teacher_name,
                "slot_id": schedule.slot_id,
                "lesson_date": str(schedule.lesson_date),
                "lesson_time": str(schedule.lesson_time),
            },
        }

    def _get_teacher_rows_with_access(self, staff_id: int, current_user: dict):
        is_admin = self._is_admin(current_user)
        is_teacher = self._is_teacher(current_user)

        if not is_admin and not is_teacher:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Teacher/Admin access required",
            )

        if is_teacher and current_user["user"].id != staff_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

        staff = self.repository.get_staff_by_id(staff_id=staff_id)

        if staff is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found",
            )

        rows = self.repository.list_timetable_rows_by_staff(staff_id=staff_id)
        return staff, rows

    @staticmethod
    def _resolve_calendar_access(
        current_user: dict,
        teacher_id: int | None,
        student_id: int | None,
    ):
        user_type = current_user.get("user_type")
        staff_role = current_user.get("staff_role")

        current_user_id = current_user.get("id")
        current_staff_id = current_user.get("staff_id") or current_user_id
        current_student_id = current_user.get("student_id") or current_user_id

        if user_type == "staff" and staff_role == "Admin":
            return teacher_id, student_id

        if user_type == "staff" and staff_role == "Teacher":
            if student_id is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Teacher cannot access student calendar",
                )

            if teacher_id is not None and teacher_id != current_staff_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Teacher can access only own calendar",
                )

            return current_staff_id, None

        if user_type == "student":
            if teacher_id is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Student cannot access teacher calendar",
                )

            if student_id is not None and student_id != current_student_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Student can access only own calendar",
                )

            return None, current_student_id

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Calendar access denied",
        )

    def generate_global_schedule(
        self,
        data: GlobalScheduleGenerateIn,
        current_user: dict,
    ) -> GlobalScheduleGenerateOut:
        if not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        if not self.repository.is_intake_closed():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Intake is not closed. Close intake before global schedule generation.",
            )

        start_date = data.start_date or date.today()
        courses = self.repository.list_courses_for_global()

        results: list[GlobalCourseBuildResult] = []
        generated_lessons_total = 0
        courses_with_conflict_overrides = 0

        for course in courses:
            required_lessons = required_lessons_for_course(course.course_type)
            existing_schedules = self.repository.list_schedule_by_course(course.id)
            existing_lessons = len(existing_schedules)

            if existing_lessons >= required_lessons:
                results.append(
                    GlobalCourseBuildResult(
                        course_id=course.id,
                        course_title=course.title,
                        staff_id=course.staff_id,
                        required_lessons=required_lessons,
                        existing_lessons=existing_lessons,
                        generated_lessons=0,
                        conflict_overrides=0,
                        total_lessons=existing_lessons,
                        status="already_complete",
                        message="Schedule already complete",
                    )
                )
                continue

            generated_strict = generate_schedule_from_teacher_slots(
                repository=self.repository,
                course=course,
                course_id=course.id,
                start_date=start_date,
                required_lessons=required_lessons,
                existing_schedules=existing_schedules,
                strict=False,
                allow_subject_conflicts=False,
            )

            existing_after_strict = self.repository.list_schedule_by_course(course.id)
            generated_fallback = []

            if len(existing_after_strict) < required_lessons:
                generated_fallback = generate_schedule_from_teacher_slots(
                    repository=self.repository,
                    course=course,
                    course_id=course.id,
                    start_date=start_date,
                    required_lessons=required_lessons,
                    existing_schedules=existing_after_strict,
                    strict=False,
                    allow_subject_conflicts=True,
                )

            generated_count = len(generated_strict) + len(generated_fallback)
            conflict_overrides = len(generated_fallback)
            total_lessons = existing_lessons + generated_count
            generated_lessons_total += generated_count

            if conflict_overrides > 0:
                courses_with_conflict_overrides += 1

            if total_lessons >= required_lessons and conflict_overrides > 0:
                status_value = "generated_with_conflicts"
                message = "Scheduled with fallback conflicts"
            elif total_lessons >= required_lessons:
                status_value = "generated"
                message = "Course scheduled successfully"
            elif generated_count > 0 and conflict_overrides > 0:
                status_value = "partial_with_conflicts"
                message = "Partially scheduled with fallback conflicts"
            elif generated_count > 0:
                status_value = "partial"
                message = "Partially scheduled: not enough free slots"
            else:
                status_value = "no_slots"
                message = "No suitable free slots"

            results.append(
                GlobalCourseBuildResult(
                    course_id=course.id,
                    course_title=course.title,
                    staff_id=course.staff_id,
                    required_lessons=required_lessons,
                    existing_lessons=existing_lessons,
                    generated_lessons=generated_count,
                    conflict_overrides=conflict_overrides,
                    total_lessons=total_lessons,
                    status=status_value,
                    message=message,
                )
            )

        return GlobalScheduleGenerateOut(
            start_date=start_date,
            total_courses=len(courses),
            generated_lessons_total=generated_lessons_total,
            courses_with_conflict_overrides=courses_with_conflict_overrides,
            courses=results,
        )

    def generate_preview(self, season_id: int, current_user: dict):
        if not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        course_repo = CourseRepository(self.db)
        enrollment_repo = EnrollmentRepository(self.db)

        courses = course_repo.get_all()
        course_classes = course_repo.get_course_classes()
        enrollments = enrollment_repo.get_enrollment_by_season(season_id=season_id)
        slots = self.db.query(Slot).filter(Slot.season_id == season_id).all()

        solver_result = generate_schedule(
            courses=courses,
            course_classes=course_classes,
            slots=slots,
            enrollments=enrollments,
        )

        if solver_result["status"] not in ["OPTIMAL", "FEASIBLE"]:
            return solver_result

        slot_map = {slot.id: slot for slot in slots}

        generation = self.repository.create_schedule_generation(
            season_id=season_id,
            solver_status=solver_result["status"],
        )

        for item in solver_result["schedule"]:
            slot = slot_map.get(item["slot_id"])

            if slot is None:
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Slot {item['slot_id']} not found",
                )

            self.repository.create_schedule_generation_item(
                generation_id=generation.id,
                staff_id=slot.staff_id,
                course_class_id=item["course_class_id"],
                slot_id=slot.id,
                lesson_date=slot.slot_date,
                lesson_time=slot.slot_time,
                season_id=season_id,
            )

        self.db.commit()
        self.db.refresh(generation)

        formatted = self._format_schedule_by_courses(
            raw_schedule=solver_result["schedule"],
            course_classes=course_classes,
            courses=courses,
            slots=slots,
        )

        return {
            "generation_id": generation.id,
            "status": generation.status,
            "solver_status": generation.solver_status,
            "schedule_by_courses": formatted,
        }

    def get_preview(self, generation_id: int, current_user: dict):
        if not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        generation = self.repository.get_schedule_generation(generation_id)

        if generation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preview not found",
            )

        items = self.repository.list_schedule_generation_items(generation_id)

        raw_schedule = [
            {
                "course_class_id": item.course_class_id,
                "slot_id": item.slot_id,
                "date": str(item.lesson_date),
                "time": str(item.lesson_time),
            }
            for item in items
        ]

        course_repo = CourseRepository(self.db)
        courses = course_repo.get_all()
        course_classes = course_repo.get_course_classes()

        slot_ids = [item.slot_id for item in items if item.slot_id is not None]
        slots = self.db.query(Slot).filter(Slot.id.in_(slot_ids)).all()

        formatted = self._format_schedule_by_courses(
            raw_schedule=raw_schedule,
            course_classes=course_classes,
            courses=courses,
            slots=slots,
        )

        return {
            "generation_id": generation.id,
            "season_id": generation.season_id,
            "status": generation.status,
            "solver_status": generation.solver_status,
            "created_at": generation.created_at,
            "approved_at": generation.approved_at,
            "schedule_by_courses": formatted,
        }

    def approve_preview(self, generation_id: int, current_user: dict):
        if not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        generation = self.repository.get_schedule_generation(generation_id)

        if generation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preview not found",
            )

        if generation.status == "Approved":
            return {
                "status": "ALREADY_APPROVED",
                "message": "This schedule preview is already approved",
                "generation_id": generation.id,
            }

        items = self.repository.list_schedule_generation_items(generation_id)

        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Preview has no schedule items",
            )

        try:
            self.repository.clear_schedule_by_season(generation.season_id)

            for item in items:
                self.repository.create_approved_schedule_from_generation_item(item)

            generation.status = "Approved"
            generation.approved_at = datetime.now(timezone.utc)

            self.db.commit()

        except Exception:
            self.db.rollback()
            raise

        return {
            "status": "APPROVED",
            "message": "Schedule saved to database",
            "generation_id": generation.id,
            "season_id": generation.season_id,
        }

    def get_timetable(self, current_user: dict) -> list[TimetableItemOut]:
        if not self._is_admin(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        rows = self.repository.list_timetable_rows()
        return [self._to_timetable_item(row) for row in rows]

    def get_teacher_timetable(self, staff_id: int, current_user: dict) -> list[TimetableItemOut]:
        _, rows = self._get_teacher_rows_with_access(
            staff_id=staff_id,
            current_user=current_user,
        )
        return [self._to_timetable_item(row) for row in rows]

    def get_events(
        self,
        season_id: int,
        teacher_id: int | None,
        course_id: int | None,
        student_id: int | None,
        current_user: dict,
    ):
        teacher_id, student_id = self._resolve_calendar_access(
            current_user=current_user,
            teacher_id=teacher_id,
            student_id=student_id,
        )

        rows = self.repository.list_schedule_events(
            season_id=season_id,
            teacher_id=teacher_id,
            course_id=course_id,
            student_id=student_id,
        )

        return {
            "season_id": season_id,
            "filters": {
                "teacher_id": teacher_id,
                "course_id": course_id,
                "student_id": student_id,
            },
            "events": [self._event_from_row(row) for row in rows],
        }

    def export_events_ics(
        self,
        season_id: int,
        teacher_id: int | None,
        course_id: int | None,
        student_id: int | None,
        current_user: dict,
    ) -> tuple[str, str]:
        teacher_id, student_id = self._resolve_calendar_access(
            current_user=current_user,
            teacher_id=teacher_id,
            student_id=student_id,
        )

        rows = self.repository.list_schedule_events(
            season_id=season_id,
            teacher_id=teacher_id,
            course_id=course_id,
            student_id=student_id,
        )

        now_utc = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

        lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Sigma Summer School//Schedule//RU",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-TIMEZONE:Asia/Novosibirsk",
        ]

        for schedule, course_class, course, staff in rows:
            start_dt = datetime.combine(schedule.lesson_date, schedule.lesson_time)
            end_dt = start_dt + timedelta(minutes=60)

            teacher_name = f"{staff.first_name} {staff.last_name}".strip()

            summary = self._escape_ics_text(
                f"{course.title} — занятие {course_class.class_number}"
            )
            description = self._escape_ics_text(
                f"Преподаватель: {teacher_name}\n"
                f"Курс: {course.title}\n"
                f"Занятие: {course_class.class_number}"
            )

            lines.extend(
                [
                    "BEGIN:VEVENT",
                    f"UID:sigma-schedule-{schedule.id}@sigma.local",
                    f"DTSTAMP:{now_utc}",
                    f"DTSTART;TZID=Asia/Novosibirsk:{start_dt.strftime('%Y%m%dT%H%M%S')}",
                    f"DTEND;TZID=Asia/Novosibirsk:{end_dt.strftime('%Y%m%dT%H%M%S')}",
                    f"SUMMARY:{summary}",
                    f"DESCRIPTION:{description}",
                    "END:VEVENT",
                ]
            )

        lines.append("END:VCALENDAR")

        filename_parts = ["schedule", f"season_{season_id}"]

        if teacher_id is not None:
            filename_parts.append(f"teacher_{teacher_id}")
        if course_id is not None:
            filename_parts.append(f"course_{course_id}")
        if student_id is not None:
            filename_parts.append(f"student_{student_id}")

        filename = "_".join(filename_parts) + ".ics"

        return "\r\n".join(lines) + "\r\n", filename

    def export_teacher_timetable_ics(self, staff_id: int, current_user: dict) -> tuple[str, str]:
        staff, rows = self._get_teacher_rows_with_access(
            staff_id=staff_id,
            current_user=current_user,
        )

        teacher_name = f"{staff.first_name} {staff.last_name}".strip()
        now_utc = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

        lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Sigma//Teacher Schedule//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            f"X-WR-CALNAME:{self._escape_ics_text(teacher_name + ' Schedule')}",
            "X-WR-TIMEZONE:Asia/Novosibirsk",
        ]

        for schedule, course_class, course, _ in rows:
            start_dt = datetime.combine(schedule.lesson_date, schedule.lesson_time)
            end_dt = start_dt + timedelta(minutes=60)

            summary = self._escape_ics_text(f"{course.title} - Lesson {course_class.class_number}")
            description = self._escape_ics_text(
                f"Teacher: {teacher_name}\n"
                f"Course: {course.title}\n"
                f"Class: {course_class.class_number}"
            )

            lines.extend(
                [
                    "BEGIN:VEVENT",
                    f"UID:sigma-schedule-{schedule.id}@sigma.local",
                    f"DTSTAMP:{now_utc}",
                    f"DTSTART;TZID=Asia/Novosibirsk:{start_dt.strftime('%Y%m%dT%H%M%S')}",
                    f"DTEND;TZID=Asia/Novosibirsk:{end_dt.strftime('%Y%m%dT%H%M%S')}",
                    f"SUMMARY:{summary}",
                    f"DESCRIPTION:{description}",
                    "END:VEVENT",
                ]
            )

        lines.append("END:VCALENDAR")
        content = "\r\n".join(lines) + "\r\n"
        filename = f"{self._safe_filename(teacher_name)}_schedule.ics"

        return content, filename

    def export_teacher_timetable_csv(self, staff_id: int, current_user: dict) -> tuple[str, str]:
        staff, rows = self._get_teacher_rows_with_access(
            staff_id=staff_id,
            current_user=current_user,
        )

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "schedule_id",
            "course_id",
            "course_title",
            "class_number",
            "teacher_id",
            "teacher_name",
            "lesson_date",
            "lesson_time",
            "slot_id",
        ])

        teacher_name = f"{staff.first_name} {staff.last_name}".strip()

        for schedule, course_class, course, _ in rows:
            writer.writerow([
                schedule.id,
                course.id,
                course.title,
                course_class.class_number,
                staff.id,
                teacher_name,
                schedule.lesson_date.isoformat(),
                schedule.lesson_time.strftime("%H:%M:%S"),
                schedule.slot_id or "",
            ])

        filename = f"{self._safe_filename(teacher_name)}_schedule.csv"
        return output.getvalue(), filename