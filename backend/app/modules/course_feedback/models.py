from sqlalchemy import Boolean, CheckConstraint, Column, Float, ForeignKey, Integer, Text, TIMESTAMP
from app.db.base import Base


class Feedback(Base):
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


class FeedbackControl(Base):
    __tablename__ = "feedback_control"

    id = Column(Integer, primary_key=True, default=1)
    feedback_open = Column(Boolean, nullable=False, default=False)
    opened_at = Column(TIMESTAMP, nullable=True)
    opened_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
    closed_at = Column(TIMESTAMP, nullable=True)
    closed_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
