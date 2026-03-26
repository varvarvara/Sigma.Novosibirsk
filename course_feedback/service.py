from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.course_feedback.repository import ReviewRepository
from app.modules.course_feedback.models import Review
from app.modules.course_feedback.schemas import (
    ReviewCreate, ReviewUpdate, ReviewOutput, ReviewModerationOutput
)
from app.modules.enrollment.service import EnrollmentService
from app.modules.users.models import Student
from app.modules.courses.models import Course


class ReviewService:
    def __init__(self, db: Session):
        self.repository = ReviewRepository(db=db)
        self.enrollment_service = EnrollmentService(db=db)

    @staticmethod
    def _ensure_student(current_user: dict) -> None:
        if current_user["user_type"] != "student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can create reviews"
            )

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    def _to_output(self, review: Review) -> ReviewOutput:
        return ReviewOutput.model_validate(review)

    def _to_moderation_output(self, review: Review) -> ReviewModerationOutput:
        student = self.repository.db.query(Student).filter(Student.id == review.student_id).first()
        student_name = f"{student.first_name} {student.last_name}".strip() if student else None
        
        course = self.repository.db.query(Course).filter(Course.id == review.course_id).first()
        course_title = course.title if course else None
        
        return ReviewModerationOutput(
            id=review.id,
            course_id=review.course_id,
            student_id=review.student_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            updated_at=review.updated_at,
            student_name=student_name,
            course_title=course_title
        )

    def create_review(self, data: ReviewCreate, current_user: dict) -> ReviewOutput:
        self._ensure_student(current_user)
        
        student_id = current_user["user"].id
        course_id = data.course_id

        enrollments = self.enrollment_service.get_my_enrollments(current_user)
        is_enrolled = any(enr.course_id == course_id for enr in enrollments)
        
        if not is_enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only review courses you are enrolled in"
            )

        existing = self.repository.get_by_student_and_course(student_id, course_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already reviewed this course"
            )

        review = Review(
            course_id=course_id,
            student_id=student_id,
            rating=data.rating,
            comment=data.comment
        )
        created = self.repository.create(review)
        return self._to_output(created)

    def get_course_reviews(self, course_id: int) -> List[ReviewOutput]:
        reviews = self.repository.get_by_course(course_id)
        return [self._to_output(r) for r in reviews]

    def get_review_by_id(self, review_id: int) -> ReviewOutput:
        review = self.repository.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        return self._to_output(review)

    def update_review(self, review_id: int, data: ReviewUpdate, current_user: dict) -> ReviewOutput:
        review = self.repository.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        is_author = review.student_id == current_user["user"].id
        is_admin = self._is_admin(current_user)
        
        if not is_author and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to update this review")

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        updated = self.repository.update(review, update_data)
        return self._to_output(updated)

    def delete_review(self, review_id: int, current_user: dict) -> dict:
        review = self.repository.get_by_id(review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        is_author = review.student_id == current_user["user"].id
        is_admin = self._is_admin(current_user)
        
        if not is_author and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this review")

        self.repository.delete(review)
        return {"message": "Review deleted"}

    def get_all_reviews_for_moderation(
        self, 
        current_user: dict,
        course_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ReviewModerationOutput]:
        if not self._is_admin(current_user):
            raise HTTPException(status_code=403, detail="Admin access required")

        reviews = self.repository.get_all_reviews(
            course_id=course_id,
            skip=skip,
            limit=limit
        )
        return [self._to_moderation_output(r) for r in reviews]