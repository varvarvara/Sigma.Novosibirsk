from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, TIMESTAMP, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("schedule.id"), nullable=False)
    attendance_status = Column(Boolean, nullable=False)

    student = relationship("Student", back_populates="attendance")
    schedule = relationship("Schedule", back_populates="attendances")


class Achievement(Base):
    __tablename__ = "achievement"

    id = Column(Integer, primary_key=True, index=True)
    achievement_description = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    achievement_score = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="achievements")
    student_achievements = relationship(
        "StudentAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
    )


class StudentAchievement(Base):
    __tablename__ = "student_achievement"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievement.id"), nullable=False)
    awarded_at = Column(TIMESTAMP, default="now()")

    student = relationship("Student", back_populates="student_achievements")
    achievement = relationship("Achievement", back_populates="student_achievements")


class StudentCertificate(Base):
    __tablename__ = "student_certificate"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
    issued_at = Column(TIMESTAMP, default="now()")
    certificate_url = Column(Text)
    certificate_status = Column(
        Enum("In progress", "Issued", name="certificate_statuses"),
        nullable=False,
        default="In progress",
    )

    student = relationship("Student", back_populates="student_certificates")
    course = relationship("Course", back_populates="student_certificates")
    staff = relationship("Staff", back_populates="issued_student_certificates")
