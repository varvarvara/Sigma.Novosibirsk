import csv
import io
import re
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.scheduling.repository import SchedulingRepository
from app.modules.scheduling.schedule import generate_schedule_from_teacher_slots, required_lessons_for_course
from app.modules.scheduling.schemas import (
    GlobalCourseBuildResult,
    GlobalScheduleGenerateIn,
    GlobalScheduleGenerateOut,
    TimetableItemOut,
)


class SchedulingService:
    def __init__(self, db: Session):
        self.repository = SchedulingRepository(db=db)

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

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
        return safe.strip("_") or "teacher"

    def _get_teacher_rows_with_access(self, staff_id: int, current_user: dict):
        is_admin = self._is_admin(current_user)
        is_teacher = self._is_teacher(current_user)

        if not is_admin and not is_teacher:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

        if is_teacher and current_user["user"].id != staff_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        staff = self.repository.get_staff_by_id(staff_id=staff_id)
        if staff is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

        rows = self.repository.list_timetable_rows_by_staff(staff_id=staff_id)
        return staff, rows

    def generate_global_schedule(self, data: GlobalScheduleGenerateIn, current_user: dict) -> GlobalScheduleGenerateOut:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

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
                # Fallback pass: allow subject overlap only for still-incomplete courses.
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

    def get_timetable(self, current_user: dict) -> list[TimetableItemOut]:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        rows = self.repository.list_timetable_rows()
        return [self._to_timetable_item(row) for row in rows]

    def get_teacher_timetable(self, staff_id: int, current_user: dict) -> list[TimetableItemOut]:
        _, rows = self._get_teacher_rows_with_access(staff_id=staff_id, current_user=current_user)
        return [self._to_timetable_item(row) for row in rows]

    def export_teacher_timetable_ics(self, staff_id: int, current_user: dict) -> tuple[str, str]:
        staff, rows = self._get_teacher_rows_with_access(staff_id=staff_id, current_user=current_user)

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
            end_dt = start_dt + timedelta(hours=1)
            summary = self._escape_ics_text(f"{course.title} - Lesson {course_class.class_number}")
            description = self._escape_ics_text(
                f"Teacher: {teacher_name}\nCourse: {course.title}\nClass: {course_class.class_number}"
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
        staff, rows = self._get_teacher_rows_with_access(staff_id=staff_id, current_user=current_user)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "schedule_id",
                "course_id",
                "course_title",
                "class_number",
                "teacher_id",
                "teacher_name",
                "lesson_date",
                "lesson_time",
                "slot_id",
            ]
        )

        teacher_name = f"{staff.first_name} {staff.last_name}".strip()
        for schedule, course_class, course, _ in rows:
            writer.writerow(
                [
                    schedule.id,
                    course.id,
                    course.title,
                    course_class.class_number,
                    staff.id,
                    teacher_name,
                    schedule.lesson_date.isoformat(),
                    schedule.lesson_time.strftime("%H:%M:%S"),
                    schedule.slot_id or "",
                ]
            )

        filename = f"{self._safe_filename(teacher_name)}_schedule.csv"
        return output.getvalue(), filename
