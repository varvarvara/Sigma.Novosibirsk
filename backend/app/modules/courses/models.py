from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship

from app.db.base import Base


class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    descriptions = Column(String(200))
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_status = Column(Enum("Draft", "Archived", "Published", name="course_statuses"), nullable=False)
    course_duration = Column(Enum("ThreeDays", "SixDays", name="course_types"), nullable=False, default="ThreeDays")
    course_type = Column(Enum("Olympiad", "Author", name="teacher_course_types"), nullable=False, default="Author")
    syllabus_url = Column(Text)
    capacity = Column(Integer, nullable=True)  # NULL means unlimited seats
    created_at = Column(TIMESTAMP, default="now()")
    updated_at = Column(TIMESTAMP, default="now()")
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    staff = relationship("Staff", back_populates="courses")
    course_classes = relationship("CourseClass", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    teacher_certificates = relationship("TeacherCertificate", back_populates="course")
    achievements = relationship("Achievement", back_populates="course")
    student_certificates = relationship("StudentCertificate", back_populates="course")
    season = relationship("Season", back_populates="courses")


class CourseClass(Base):
    __tablename__ = "course_class"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    class_number = Column(Integer, nullable=False)
    class_description = Column(String(200), nullable=False)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    course = relationship("Course", back_populates="course_classes")
    schedules = relationship("Schedule", back_populates="course_class")
    season = relationship("Season", back_populates="course_classes")
