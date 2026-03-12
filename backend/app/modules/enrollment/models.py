from sqlalchemy import Column, Integer, ForeignKey, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base

class Enrollment(Base):
    __tablename__ = "enrollment"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    enrolled_at = Column(TIMESTAMP, default="now()")
    enrollment_status = Column(Enum('Active', 'Dropped', 'Completed', name="enrollment_statuses"))

    student = relationship("Student", back_populates="enrollments")  # Связь с моделью Student
    course = relationship("Course", back_populates="enrollments")  # Связь с моделью Course