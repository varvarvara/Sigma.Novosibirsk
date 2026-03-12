from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base

class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    descriptions = Column(String(200))
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_status = Column(Enum('Draft', 'Archived', 'Published', name="course_statuses"))
    syllabus_url = Column(Text)
    created_at = Column(TIMESTAMP, default="now()")
    updated_at = Column(TIMESTAMP, default="now()")

    staff = relationship("Staff", back_populates="courses")
    course_classes = relationship("CourseClass", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    teacher_certificates = relationship("TeacherCertificate", back_populates="course")
    achievements = relationship("Achievement", back_populates="course")
    student_certificates = relationship("StudentCertificate", back_populates="course")

## не понятно, пока куда таблицу courseclass
class CourseClass(Base):
    __tablename__ = "course_class"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    class_number = Column(Integer, nullable=False)
    class_description = Column(String(200), nullable=False)

    course = relationship("Course", back_populates="course_classes")
    
