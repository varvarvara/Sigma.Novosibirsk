from sqlalchemy.orm import Session
from typing import Optional, List

from app.modules.course_feedback.models import Review


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, review: Review) -> Review:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_by_id(self, review_id: int) -> Optional[Review]:
        return self.db.query(Review).filter(Review.id == review_id).first()

    def get_by_course(self, course_id: int) -> List[Review]:
        return self.db.query(Review).filter(Review.course_id == course_id).all()

    def get_by_student_and_course(self, student_id: int, course_id: int) -> Optional[Review]:
        return (
            self.db.query(Review)
            .filter(Review.student_id == student_id, Review.course_id == course_id)
            .first()
        )

    def update(self, review: Review, update_data: dict) -> Review:
        for field, value in update_data.items():
            setattr(review, field, value)
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review: Review) -> None:
        self.db.delete(review)
        self.db.commit()

    def get_all_reviews(
        self,
        course_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Review]:
        query = self.db.query(Review)
        
        if course_id:
            query = query.filter(Review.course_id == course_id)
        
        return query.offset(skip).limit(limit).all()