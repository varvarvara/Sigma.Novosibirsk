from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, TIMESTAMP, CheckConstraint
from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        CheckConstraint("rating >= 1.0 AND rating <= 10.0", name="check_rating_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default="now()")
    updated_at = Column(TIMESTAMP, server_default="now()", onupdate="now()")