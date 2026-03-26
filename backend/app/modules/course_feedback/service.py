from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.course_feedback.repository import CourseFeedbackRepository
from app.modules.course_feedback.schemas import (
    CourseFeedbackCreateIn,
    CourseFeedbackOut,
    CourseFeedbackWithAuthorOut,
    FeedbackWindowActionOut,
    FeedbackWindowStatusOut,
)


class CourseFeedbackService:
    def __init__(self, db: Session):
        self.repository = CourseFeedbackRepository(db=db)

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

    def _to_feedback_output(self, feedback) -> CourseFeedbackOut:
        return CourseFeedbackOut.model_validate(feedback)

    @staticmethod
    def _to_feedback_with_author_output(row: tuple) -> CourseFeedbackWithAuthorOut:
        feedback, student, course = row
        return CourseFeedbackWithAuthorOut(
            id=feedback.id,
            course_id=feedback.course_id,
            student_id=feedback.student_id,
            rating=feedback.rating,
            comment=feedback.comment,
            created_at=feedback.created_at,
            updated_at=feedback.updated_at,
            student_first_name=student.first_name,
            student_last_name=student.last_name,
            student_email=student.email,
            course_title=course.title,
        )

    @staticmethod
    def _to_window_status(control) -> FeedbackWindowStatusOut:
        return FeedbackWindowStatusOut(
            feedback_open=control.feedback_open,
            opened_at=control.opened_at,
            opened_by=control.opened_by,
            closed_at=control.closed_at,
            closed_by=control.closed_by,
        )

    def get_window_status(self) -> FeedbackWindowStatusOut:
        control = self.repository.get_or_create_feedback_control()
        return self._to_window_status(control=control)

    def open_window(self, current_user: dict) -> FeedbackWindowActionOut:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        control = self.repository.set_feedback_open(value=True, admin_id=current_user["user"].id)
        return FeedbackWindowActionOut(
            message="Feedback window opened",
            status=self._to_window_status(control=control),
        )

    def close_window(self, current_user: dict) -> FeedbackWindowActionOut:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        control = self.repository.set_feedback_open(value=False, admin_id=current_user["user"].id)
        return FeedbackWindowActionOut(
            message="Feedback window closed",
            status=self._to_window_status(control=control),
        )

    def create_feedback(self, data: CourseFeedbackCreateIn, current_user: dict) -> CourseFeedbackOut:
        self._ensure_student(current_user=current_user)

        if not self.repository.is_feedback_open():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feedback window is closed by admin",
            )

        student_id = current_user["user"].id
        course = self.repository.get_course_by_id(course_id=data.course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if not self.repository.student_has_enrollment(student_id=student_id, course_id=data.course_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Student can leave feedback only for enrolled courses",
            )

        existing = self.repository.get_feedback_by_student_and_course(
            student_id=student_id,
            course_id=data.course_id,
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feedback for this course was already created by this student",
            )

        created = self.repository.create_feedback(
            course_id=data.course_id,
            student_id=student_id,
            rating=data.rating,
            comment=data.comment,
        )
        return self._to_feedback_output(feedback=created)

    def get_my_feedback(self, current_user: dict) -> list[CourseFeedbackOut]:
        self._ensure_student(current_user=current_user)
        rows = self.repository.list_feedback_by_student(student_id=current_user["user"].id)
        return [self._to_feedback_output(feedback=item) for item in rows]

    def get_feedback_for_course(self, course_id: int, current_user: dict) -> list[CourseFeedbackWithAuthorOut]:
        course = self.repository.get_course_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if self._is_teacher(current_user):
            if not self.repository.is_teacher_course_owner(course_id=course_id, teacher_id=current_user["user"].id):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        elif not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

        rows = self.repository.list_feedback_for_course_with_author(course_id=course_id)
        return [self._to_feedback_with_author_output(row=item) for item in rows]

    def get_feedback_for_teacher(self, current_user: dict) -> list[CourseFeedbackWithAuthorOut]:
        if not self._is_teacher(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")

        rows = self.repository.list_feedback_for_teacher(teacher_id=current_user["user"].id)
        return [self._to_feedback_with_author_output(row=item) for item in rows]

    def get_feedback_for_admin(
        self,
        current_user: dict,
        course_id: int | None = None,
    ) -> list[CourseFeedbackWithAuthorOut]:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

        rows = self.repository.list_feedback_for_admin(course_id=course_id)
        return [self._to_feedback_with_author_output(row=item) for item in rows]
