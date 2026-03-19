from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, TIMESTAMP, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from app.db.base import Base



class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "schedule_id",
            name="cn_attendance"
        ),
    )
    id = Column(Integer, primary_key = True, index = True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable = False)
    schedule_id = Column(Integer, ForeignKey("schedule.id"), nullable = False)
    attendance_status = Column(Boolean,nullable = False)
    
    student = relationship("Student", back_populates = "attendance")
    schedule = relationship("Schedule", back_populates = "attendance")
    
class Achievement(Base):
    __tablename__ = "achievement"

    id = Column(Integer, primary_key=True, index=True)
    achievement_description = Column(String(100), nullable=False)

    achievement_score = Column(Integer, nullable=False)

    student_achievements = relationship(
        "StudentAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan"
    )


class StudentAchievement(Base):
    __tablename__ = "student_achievement"
    
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "achievement_id",
            "course_id",
            name="cn_student_achievement"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievement.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    awarded_at = Column(TIMESTAMP)

    student = relationship("Students", back_populates="student_achievements")
    achievement = relationship("Achievement", back_populates="student_achievements")
    course = relationship("Course", back_populates="student_achievements")


class StudentCertificate(Base):
    __tablename__ = "student_certificate"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("staff.id"))
    issued_at = Column(TIMESTAMP)
    certificate_url = Column(Text)

    certificate_status = Column(
        Enum("In progress", "Issued", name="certificate_statuses"),nullable=False)

    student = relationship("Students", back_populates="student_certificates")
    course = relationship("Course", back_populates="student_certificates")
    staff = relationship("Staff", back_populates="issued_student_certificates")