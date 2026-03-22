from datetime import date, time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.courses.repository import CourseRepository
from app.modules.courses.schemas import (
    CourseCreate,
    CourseOutput,
    CourseSlotOut,
    CourseSlotsSetIn,
    CourseSlotsSetOut,
    CourseUpdate,
)


class CourseService:
    def __init__(self, db: Session):
        self.repository = CourseRepository(db=db)

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

    @staticmethod
    def _ensure_staff(current_user: dict) -> None:
        if current_user["user_type"] != "staff":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")

    def _ensure_teacher_write_allowed(self, current_user: dict) -> None:
        if self._is_teacher(current_user) and self.repository.is_intake_closed():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Intake is closed: teachers cannot modify courses or slots",
            )

    def _ensure_course_owner_or_admin(self, course, current_user: dict) -> None:
        if self._is_admin(current_user):
            return

        is_owner_teacher = self._is_teacher(current_user) and course.staff_id == current_user["user"].id
        if not is_owner_teacher:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    def _ensure_course_write_access(self, course, current_user: dict) -> None:
        self._ensure_course_owner_or_admin(course=course, current_user=current_user)
        self._ensure_teacher_write_allowed(current_user=current_user)

    def _to_output(self, course) -> CourseOutput:
        staff = self.repository.get_staff_by_id(course.staff_id)
        teacher_name = None
        if staff is not None:
            teacher_name = f"{staff.first_name} {staff.last_name}".strip()

        return CourseOutput(
            id=course.id,
            title=course.title,
            description=course.descriptions,
            syllabus_url=course.syllabus_url,
            course_status=course.course_status,
            course_type=course.course_type,
            staff_id=course.staff_id,
            teacher_name=teacher_name,
            capacity=course.capacity,
        )

    @staticmethod
    def _to_slot_output(item: tuple) -> CourseSlotOut:
        slot, is_booked = item
        return CourseSlotOut(
            slot_id=slot.id,
            slot_date=slot.slot_date,
            slot_time=slot.slot_time,
            is_booked=is_booked,
        )

    def list_courses(self, current_user: dict) -> list[CourseOutput]:
        if self._is_admin(current_user):
            courses = self.repository.get_all()
        elif self._is_teacher(current_user):
            courses = self.repository.get_all_by_staff(staff_id=current_user["user"].id)
        else:
            courses = self.repository.get_all_published()

        return [self._to_output(course) for course in courses]

    def list_my_courses(self, current_user: dict) -> list[CourseOutput]:
        if not self._is_teacher(current_user):
            raise HTTPException(status_code=403, detail="Teacher access required")

        courses = self.repository.get_all_by_staff(staff_id=current_user["user"].id)
        return [self._to_output(course) for course in courses]

    def list_all_courses_admin(self, current_user: dict) -> list[CourseOutput]:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=403, detail="Admin access required")

        courses = self.repository.get_all()
        return [self._to_output(course) for course in courses]

    def get_course(self, course_id: int, current_user: dict) -> CourseOutput:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        if self._is_admin(current_user):
            return self._to_output(course)

        if self._is_teacher(current_user):
            if course.staff_id != current_user["user"].id:
                raise HTTPException(status_code=403, detail="Access denied")
            return self._to_output(course)

        if course.course_status != "Published":
            raise HTTPException(status_code=403, detail="Only published courses are visible")

        return self._to_output(course)

    def create_course(self, data: CourseCreate, current_user: dict) -> CourseOutput:
        self._ensure_staff(current_user)
        self._ensure_teacher_write_allowed(current_user=current_user)

        if self._is_teacher(current_user):
            staff_id = current_user["user"].id
        else:
            staff_id = data.staff_id or current_user["user"].id

        staff = self.repository.get_staff_by_id(staff_id=staff_id)
        if staff is None:
            raise HTTPException(status_code=404, detail="Staff not found")

        course = self.repository.create_course(
            title=data.title,
            description=data.description,
            staff_id=staff_id,
            course_status=data.course_status.value,
            course_type=data.course_type.value,
            syllabus_url=str(data.syllabus_url),
            capacity=data.capacity,
        )

        return self._to_output(course)

    def update_course(self, course_id: int, data: CourseUpdate, current_user: dict) -> CourseOutput:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        self._ensure_course_write_access(course=course, current_user=current_user)

        update_fields = {}
        if data.title is not None:
            update_fields["title"] = data.title
        if data.description is not None:
            update_fields["descriptions"] = data.description
        if data.syllabus_url is not None:
            update_fields["syllabus_url"] = str(data.syllabus_url)
        if data.course_status is not None:
            update_fields["course_status"] = data.course_status.value
        if data.course_type is not None:
            update_fields["course_type"] = data.course_type.value
        if "capacity" in data.model_fields_set:
            update_fields["capacity"] = data.capacity

        updated = self.repository.update_course(course=course, **update_fields)
        return self._to_output(updated)

    def delete_course(self, course_id: int, current_user: dict) -> dict:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=403, detail="Admin access required")

        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        self.repository.delete_course(course=course)
        return {"message": f"Course {course_id} deleted"}

    def set_course_slots(self, course_id: int, data: CourseSlotsSetIn, current_user: dict) -> CourseSlotsSetOut:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        self._ensure_course_write_access(course=course, current_user=current_user)

        created = 0
        today = date.today()

        for item in data.slots:
            if item.slot_date < today:
                continue

            _, is_created = self.repository.create_slot_if_not_exists(
                staff_id=course.staff_id,
                slot_date=item.slot_date,
                slot_time=time(hour=item.slot_hour, minute=0),
            )
            if is_created:
                created += 1

        if created == 0 and all(item.slot_date < today for item in data.slots):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="All slots are in the past",
            )

        items = self.repository.list_course_slots(course_id=course_id, start_date=today)

        return CourseSlotsSetOut(
            course_id=course.id,
            staff_id=course.staff_id,
            created=created,
            total_slots=len(items),
            items=[self._to_slot_output(item) for item in items],
        )

    def get_course_slots(self, course_id: int, current_user: dict) -> list[CourseSlotOut]:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        self._ensure_course_owner_or_admin(course=course, current_user=current_user)

        items = self.repository.list_course_slots(course_id=course_id, start_date=date.today())
        return [self._to_slot_output(item) for item in items]

    def delete_course_slot(self, course_id: int, slot_id: int, current_user: dict) -> dict:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        self._ensure_course_write_access(course=course, current_user=current_user)

        slot = self.repository.get_slot_by_id(slot_id=slot_id)
        if slot is None or slot.staff_id != course.staff_id:
            raise HTTPException(status_code=404, detail="Slot not found for this course")

        if self.repository.slot_has_schedule(slot_id=slot_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete slot: it is already used in schedule",
            )

        self.repository.delete_slot(slot=slot)
        return {"message": f"Slot {slot_id} deleted"}
