from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.course_feedback.models import Feedback, FeedbackControl
from app.modules.courses.models import Course
from app.modules.enrollment.models import Enrollment
from app.modules.users.models import Student


class CourseFeedbackRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_course_feedback_by_season(self, season_id: int) -> list[Feedback]:
        return self.db.query(Feedback).filter(Feedback.season_id == season_id).all()
    
    def get_or_create_feedback_control(self) -> FeedbackControl:
        control = self.db.query(FeedbackControl).filter(FeedbackControl.id == 1).first()
        if control is not None:
            return control

        control = FeedbackControl(id=1, feedback_open=False)
        self.db.add(control)
        self.db.commit()
        self.db.refresh(control)
        return control

    def set_feedback_open(self, value: bool, admin_id: int) -> FeedbackControl:
        control = self.get_or_create_feedback_control()
        now = datetime.utcnow()

        control.feedback_open = value
        if value:
            control.opened_at = now
            control.opened_by = admin_id
        else:
            control.closed_at = now
            control.closed_by = admin_id

        self.db.commit()
        self.db.refresh(control)
        return control

    def is_feedback_open(self) -> bool:
        control = self.get_or_create_feedback_control()
        return bool(control.feedback_open)

    def get_course_by_id(self, course_id: int) -> Optional[Course]:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def student_has_enrollment(self, student_id: int, course_id: int) -> bool:
        row = (
            self.db.query(Enrollment.id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.course_id == course_id,
                Enrollment.enrollment_status != "Dropped",
            )
            .first()
        )
        return row is not None

    def get_feedback_by_student_and_course(self, student_id: int, course_id: int) -> Optional[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.student_id == student_id, Feedback.course_id == course_id)
            .first()
        )

    def create_feedback(self, course_id: int, student_id: int, rating: float, comment: str, season_id: int) -> Feedback:
        feedback = Feedback(
            course_id=course_id,
            student_id=student_id,
            rating=rating,
            comment=comment,
            season_id=season_id,
        )
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback

    def list_feedback_by_student(self, student_id: int) -> list[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.student_id == student_id)
            .order_by(Feedback.created_at.desc(), Feedback.id.desc())
            .all()
        )

    def is_teacher_course_owner(self, course_id: int, teacher_id: int) -> bool:
        row = (
            self.db.query(Course.id)
            .filter(Course.id == course_id, Course.staff_id == teacher_id)
            .first()
        )
        return row is not None

    def list_feedback_for_course_with_author(self, course_id: int) -> list[tuple[Feedback, Student, Course]]:
        return (
            self.db.query(Feedback, Student, Course)
            .join(Student, Student.id == Feedback.student_id)
            .join(Course, Course.id == Feedback.course_id)
            .filter(Feedback.course_id == course_id)
            .order_by(Feedback.created_at.desc(), Feedback.id.desc())
            .all()
        )

    def list_feedback_for_teacher(self, teacher_id: int) -> list[tuple[Feedback, Student, Course]]:
        return (
            self.db.query(Feedback, Student, Course)
            .join(Student, Student.id == Feedback.student_id)
            .join(Course, Course.id == Feedback.course_id)
            .filter(Course.staff_id == teacher_id)
            .order_by(Feedback.created_at.desc(), Feedback.id.desc())
            .all()
        )

    def list_feedback_for_admin(self, course_id: int | None = None) -> list[tuple[Feedback, Student, Course]]:
        query = (
            self.db.query(Feedback, Student, Course)
            .join(Student, Student.id == Feedback.student_id)
            .join(Course, Course.id == Feedback.course_id)
        )

        if course_id is not None:
            query = query.filter(Feedback.course_id == course_id)

        return query.order_by(Feedback.created_at.desc(), Feedback.id.desc()).all()
