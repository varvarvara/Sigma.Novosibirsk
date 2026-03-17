from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.courses.repository import CourseRepository
from app.modules.courses.schemas import CourseCreate, CourseOutput, CourseUpdate
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
            staff_id=course.staff_id,
            teacher_name=teacher_name,
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

        if self._is_teacher(current_user):
            staff_id = current_user["user"].id
        else:
            # admin can assign any teacher; fallback to admin id if not provided
            staff_id = data.staff_id or current_user["user"].id

        staff = self.repository.get_staff_by_id(staff_id=staff_id)
        if staff is None:
            raise HTTPException(status_code=404, detail="Staff not found")

        course = self.repository.create_course(
            title=data.title,
            description=data.description,
            staff_id=staff_id,
            course_status=data.course_status.value,
            syllabus_url=str(data.syllabus_url),
        )

        return self._to_output(course)

    def update_course(self, course_id: int, data: CourseUpdate, current_user: dict) -> CourseOutput:
        course = self.repository.get_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        is_admin = self._is_admin(current_user)
        is_owner_teacher = self._is_teacher(current_user) and course.staff_id == current_user["user"].id

        if not (is_admin or is_owner_teacher):
            raise HTTPException(status_code=403, detail="Access denied")

        update_fields = {}
        if data.title is not None:
            update_fields["title"] = data.title
        if data.description is not None:
            update_fields["descriptions"] = data.description
        if data.syllabus_url is not None:
            update_fields["syllabus_url"] = str(data.syllabus_url)
        if data.course_status is not None:
            update_fields["course_status"] = data.course_status.value

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