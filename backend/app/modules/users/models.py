from sqlalchemy import Boolean, Column, Date, Enum, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship

from app.db.base import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    partonymic = Column(String(50))
    email = Column(String(254), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    staff_role = Column(Enum("Teacher", "Admin", name="staff_roles"), nullable=False)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)
    birth_date = Column(Date, nullable=True)
    university = Column(String(150), nullable=True)
    study_direction = Column(String(150), nullable=True)
    study_year = Column(Integer, nullable=True)
    avatar_image_key = Column(String(512))

    courses = relationship("Course", back_populates="staff")
    slots = relationship("Slot", back_populates="staff")
    schedules = relationship("Schedule", back_populates="staff")
    extracurricular_activities = relationship("ExtracurricularActivity", back_populates="staff")

    teacher_certificates = relationship(
        "TeacherCertificate",
        foreign_keys="TeacherCertificate.user_id",
        back_populates="user",
    )
    issued_certificates = relationship(
        "TeacherCertificate",
        foreign_keys="TeacherCertificate.issued_by",
        back_populates="issuer",
    )
    issued_student_certificates = relationship("StudentCertificate", back_populates="staff")
    season = relationship("Season", back_populates="staff_members")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    partonymic = Column(String(50))
    email = Column(String(254), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    tg_nickname = Column(String(50))
    birth_date = Column(Date, nullable=True)
    year_of_study = Column(Integer, nullable=False)
    city = Column(String(30))
    school = Column(String(100))
    parent_name = Column(String(150), nullable=False)
    parent_phone = Column(String(20), nullable=False)
    student_status = Column(
        Enum("Registered", "Enrolled", "Blocked", name="student_statuses"),
        nullable=False,
    )
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)
    avatar_image_key = Column(String(512))

    enrollments = relationship("Enrollment", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    gamification = relationship("Gamification", back_populates="student", uselist=False)

    student_achievements = relationship("StudentAchievement", back_populates="student")
    student_certificates = relationship("StudentCertificate", back_populates="student")
    team_members = relationship("ExtracurricularTeamMember", back_populates="student")
    season = relationship("Season", back_populates="students")


class PreRegistration(Base):
    __tablename__ = "pre_registration"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    partonymic = Column(String(50))
    pre_registration_status = Column(
        Enum("PendingApproval", "Approved", name="pre_registration_statuses"),
        nullable=False,
    )
    phone = Column(String(20), nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    tg_nickname = Column(String(50))
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)
    birth_date = Column(Date, nullable=False)
    university = Column(String(150), nullable=False)
    study_direction = Column(String(150), nullable=False)
    study_year = Column(Integer, nullable=False)
    proposed_course_title = Column(String(150), nullable=False)
    proposed_course_type = Column(Enum("Olympiad", "Author", name="teacher_course_types"), nullable=False)
    proposed_course_description = Column(String(500), nullable=False)
    
    season = relationship("Season", back_populates="pre_registrations")


class IntakeControl(Base):
    __tablename__ = "intake_control"

    id = Column(Integer, primary_key=True, default=1)
    intake_closed = Column(Boolean, nullable=False, default=False)
    closed_at = Column(TIMESTAMP, nullable=True)
    closed_by = Column(Integer, ForeignKey("staff.id"), nullable=True)


class TeacherCertificate(Base):
    __tablename__ = "teacher_certificate"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    issued_by = Column(Integer, ForeignKey("staff.id"), nullable=True)
    issued_at = Column(TIMESTAMP, default="now()")
    certificate_url = Column(String(200), nullable=False)
    certificate_status = Column(
        Enum("In progress", "Issued", name="certificate_statuses"),
        nullable=False,
        default="In progress",
    )
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)
    
    user = relationship("Staff", foreign_keys=[user_id], back_populates="teacher_certificates")
    course = relationship("Course", back_populates="teacher_certificates")
    issuer = relationship("Staff", foreign_keys=[issued_by], back_populates="issued_certificates")
    season = relationship("Season", back_populates="teacher_certificates")
