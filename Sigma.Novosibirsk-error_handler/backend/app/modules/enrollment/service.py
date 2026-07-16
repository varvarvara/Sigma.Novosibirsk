from collections import Counter

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.enrollment.repository import EnrollmentRepository
from app.modules.media.service import get_media_service
from app.modules.enrollment.schemas import (
    ALLOWED_SLOT_HOURS,
    SCHEDULE_HOUR_TO_ENROLLMENT_SLOT,
    EnrollmentInUpdateStatus,
    EnrollmentOutput,
    EnrollmentSelectionIn,
    EnrollmentSlotOptionsOut,
    EnrollmentStatus,
    EnrollmentSubmitIn,
    EnrollmentSubmitOut,
    SlotCourseOption,
    SlotOptionsItem,
)


class EnrollmentService:
    def __init__(self, db: Session):
        self.repository = EnrollmentRepository(db=db)

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

    @staticmethod
    def _ensure_student(current_user: dict) -> None:
        if current_user["user_type"] != "student":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")

    @staticmethod
    def _required_slot_hours() -> list[int]:
        return sorted(ALLOWED_SLOT_HOURS)

    @staticmethod
    def _schedule_hour_to_slot_hour(schedule_hour: int) -> int | None:
        return SCHEDULE_HOUR_TO_ENROLLMENT_SLOT.get(schedule_hour)

    def _course_matches_enrollment_slot(self, course_id: int, slot_hour: int) -> bool:
        schedule_hours = self.repository.list_course_slot_hours(course_id=course_id)
        if not schedule_hours:
            return False

        for schedule_hour in schedule_hours:
            mapped = self._schedule_hour_to_slot_hour(schedule_hour)
            if mapped == slot_hour or schedule_hour == slot_hour:
                return True

        return False

    def _stable_enrollment_slot_hour(self, course_id: int, schedule_hours: list[int]) -> int | None:
        required_hours = self._required_slot_hours()
        if not schedule_hours:
            return None

        if len(schedule_hours) == 1:
            mapped = self._schedule_hour_to_slot_hour(schedule_hours[0])
            if mapped is not None:
                return mapped
            return schedule_hours[0] if schedule_hours[0] in required_hours else None

        return required_hours[(course_id - 2) % len(required_hours)]

    def _to_output(self, enrollment) -> EnrollmentOutput:
        course = self.repository.get_course_by_id(enrollment.course_id)

        teacher_id = None
        teacher_name = None
        course_title = None
        course_description = None
        course_status = None
        course_duration = None
        course_type = None

        if course is not None:
            teacher_id = course.staff_id
            course_title = course.title
            course_description = course.descriptions
            course_status = course.course_status
            course_duration = course.course_duration
            course_type = course.course_type

            staff = self.repository.get_staff_by_id(course.staff_id)
            if staff is not None:
                teacher_name = f"{staff.first_name} {staff.last_name}".strip()

        return EnrollmentOutput(
            id=enrollment.id,
            student_id=enrollment.student_id,
            course_id=enrollment.course_id,
            enrolled_at=enrollment.enrolled_at,
            enrollment_status=enrollment.enrollment_status,
            course_title=course_title,
            course_description=course_description,
            course_status=course_status,
            course_duration=course_duration,
            course_type=course_type,
            teacher_id=teacher_id,
            teacher_name=teacher_name,
        )

    def _validate_full_selection(self, selections: list[EnrollmentSelectionIn]) -> dict[int, int]:
        required_hours = set(self._required_slot_hours())
        selected_hours = [item.slot_hour for item in selections]
        selected_set = set(selected_hours)

        hour_counter = Counter(selected_hours)
        duplicate_hours = sorted([hour for hour, count in hour_counter.items() if count > 1])
        missing_hours = sorted(required_hours - selected_set)
        extra_hours = sorted(selected_set - required_hours)

        if missing_hours or duplicate_hours or extra_hours:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Choose exactly one course in each lesson slot (9, 10, 11)",
                    "missing_hours": missing_hours,
                    "duplicate_hours": duplicate_hours,
                    "extra_hours": extra_hours,
                },
            )

        course_ids = [item.course_id for item in selections]
        course_counter = Counter(course_ids)
        duplicate_courses = sorted([course_id for course_id, count in course_counter.items() if count > 1])
        if duplicate_courses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "The same course cannot be selected in multiple slots",
                    "duplicate_course_ids": duplicate_courses,
                },
            )

        return {item.slot_hour: item.course_id for item in selections}

    def _validate_no_schedule_overlap(self, course_ids: list[int]) -> None:
        seen_slots: set[tuple] = set()
        for course_id in course_ids:
            course_slots = set(self.repository.list_course_schedule_slots(course_id=course_id))
            if not course_slots:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Course {course_id} schedule is not published yet",
                )
            if seen_slots.intersection(course_slots):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Selected courses contain overlapping lesson slots",
                )
            seen_slots.update(course_slots)

    def get_slot_options(self, current_user: dict) -> EnrollmentSlotOptionsOut:
        self._ensure_student(current_user=current_user)

        media = get_media_service()
        required_hours = self._required_slot_hours()
        by_hour: dict[int, list[SlotCourseOption]] = {hour: [] for hour in required_hours}

        courses = self.repository.list_published_courses_with_schedule()
        for course in courses:
            slot_hours = self.repository.list_course_slot_hours(course_id=course.id)
            stable_hour = self._stable_enrollment_slot_hour(course_id=course.id, schedule_hours=slot_hours)
            if stable_hour is None:
                continue

            teacher = self.repository.get_staff_by_id(course.staff_id)
            teacher_name = None
            if teacher is not None:
                teacher_name = f"{teacher.first_name} {teacher.last_name}".strip()

            enrolled_count = self.repository.count_active_enrollments(course_id=course.id)
            seats_left = None if course.capacity is None else max(course.capacity - enrolled_count, 0)
            option = SlotCourseOption(
                course_id=course.id,
                title=course.title,
                description=course.descriptions,
                syllabus_url=course.syllabus_url,
                course_type=course.course_type,
                teacher_name=teacher_name,
                cover_image_url=media.resolve_url(course.cover_image_key),
                capacity=course.capacity,
                enrolled_count=enrolled_count,
                seats_left=seats_left,
            )

            if stable_hour in by_hour:
                by_hour[stable_hour].append(option)

        slots = []
        for hour in required_hours:
            courses = sorted(by_hour[hour], key=lambda item: item.course_id)
            preview_cover_url = next(
                (course.cover_image_url for course in courses if course.cover_image_url),
                None,
            )
            slots.append(
                SlotOptionsItem(
                    slot_hour=hour,
                    courses=courses,
                    preview_cover_url=preview_cover_url,
                )
            )

        return EnrollmentSlotOptionsOut(required_slot_hours=required_hours, slots=slots)

    def submit_slot_selection(self, data: EnrollmentSubmitIn, current_user: dict) -> EnrollmentSubmitOut:
        self._ensure_student(current_user=current_user)

        if self.repository.is_intake_closed():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Registration is closed by admin",
            )

        student_id = current_user["user"].id
        student = self.repository.get_student_by_id(student_id=student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        if student.student_status == "Blocked":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student is blocked")

        if self.repository.list_student_active_enrollments(student_id=student_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student already has active enrollments. Drop current selection before resubmitting.",
            )

        selection_by_hour = self._validate_full_selection(selections=data.selections)
        selected_course_ids = [selection_by_hour[hour] for hour in self._required_slot_hours()]

        for slot_hour, course_id in selection_by_hour.items():
            course = self.repository.get_course_by_id(course_id=course_id)
            if course is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course {course_id} not found")

            if course.course_status != "Published":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Course {course_id} is not published",
                )

            if not self._course_matches_enrollment_slot(course_id=course_id, slot_hour=slot_hour):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Course {course_id} is not available in lesson slot {slot_hour}",
                )

            active_count = self.repository.count_active_enrollments(course_id=course_id)
            if course.capacity is not None and active_count >= course.capacity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Course {course_id} capacity exceeded",
                )

        self._validate_no_schedule_overlap(course_ids=selected_course_ids)

        created_items = []
        for course_id in selected_course_ids:
            existing = self.repository.get_enrollment_by_student_and_course(
                student_id=student_id,
                course_id=course_id,
            )
            if existing is not None:
                enrollment = self.repository.update_enrollment_status(
                    enrollment=existing,
                    new_status=EnrollmentStatus.ACTIVE.value,
                )
            else:
                enrollment = self.repository.create_enrollment(
                    student_id=student_id,
                    course_id=course_id,
                )
            created_items.append(self._to_output(enrollment))

        if student.student_status == "Registered":
            self.repository.update_student_status(student=student, status_value="Enrolled")

        return EnrollmentSubmitOut(
            message="Selection saved: one course per slot hour",
            total_selected=len(created_items),
            items=created_items,
        )

    def get_my_enrollments(self, current_user: dict, offset: int = 0, limit: int = 20) -> list[EnrollmentOutput]:
        self._ensure_student(current_user=current_user)

        student_id = current_user["user"].id
        rows = self.repository.list_enrollments_by_student(student_id=student_id, offset=offset, limit=limit)
        return [self._to_output(row) for row in rows]

    def drop_my_enrollment(self, enrollment_id: int, current_user: dict) -> EnrollmentOutput:
        self._ensure_student(current_user=current_user)

        enrollment = self.repository.get_enrollment_by_id(enrollment_id=enrollment_id)
        if enrollment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

        if enrollment.student_id != current_user["user"].id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if enrollment.enrollment_status != EnrollmentStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only active enrollment can be dropped",
            )

        updated = self.repository.update_enrollment_status(
            enrollment=enrollment,
            new_status=EnrollmentStatus.DROPPED.value,
        )
        return self._to_output(updated)

    def get_course_enrollments(
        self,
        course_id: int,
        current_user: dict,
        offset: int = 0,
        limit: int = 20,
    ) -> list[EnrollmentOutput]:
        course = self.repository.get_course_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if self._is_teacher(current_user):
            if course.staff_id != current_user["user"].id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        elif not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

        rows = self.repository.list_enrollments_by_course(course_id=course_id, offset=offset, limit=limit)
        return [self._to_output(row) for row in rows]

    def get_student_enrollments(
        self,
        student_id: int,
        current_user: dict,
        offset: int = 0,
        limit: int = 20,
    ) -> list[EnrollmentOutput]:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        student = self.repository.get_student_by_id(student_id=student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        rows = self.repository.list_enrollments_by_student(student_id=student_id, offset=offset, limit=limit)
        return [self._to_output(row) for row in rows]

    def set_enrollment_status(
        self,
        enrollment_id: int,
        data: EnrollmentInUpdateStatus,
        current_user: dict,
    ) -> EnrollmentOutput:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        enrollment = self.repository.get_enrollment_by_id(enrollment_id=enrollment_id)
        if enrollment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

        updated = self.repository.update_enrollment_status(
            enrollment=enrollment,
            new_status=data.enrollment_status.value,
        )
        return self._to_output(updated)
