from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base
from enums import CertificateStatuses

class Achievement(Base):
    __tablename__ = "achievement"

    id = Column(Integer, primary_key=True, index=True)
    achievement_description = Column(String(100), nullable=False)

    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)

    achievement_score = Column(Integer, nullable=False)

    # relationships
    course = relationship("Course", back_populates="achievements")

    student_achievements = relationship(
        "StudentAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan"
    )


class StudentAchievement(Base):
    __tablename__ = "student_achievement"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievement.id"), nullable=False)
    awarded_at = Column(TIMESTAMP)

    student = relationship("Students", back_populates="student_achievements")
    achievement = relationship("Achievement", back_populates="student_achievements")


class StudentCertificate(Base):
    __tablename__ = "student_certificate"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("staff.id"))
    issued_at = Column(TIMESTAMP)
    certificate_url = Column(Text)

    certificate_status = Column(
        Enum(cer"in_progress", "issued", name="certificate_statuses"),
        nullable=False
    )

    student = relationship("Students", back_populates="student_certificates")
    course = relationship("Course", back_populates="student_certificates")
    staff = relationship("Staff", back_populates="issued_student_certificates")