from sqlalchemy import Column, Date, String, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base

class Season(Base):
    __tablename__= "season"

    id = Column(Integer, primary_key=True, index=True)
    season_year = Column(Integer, nullable=False)
    season_description = Column(String(100), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    staff_members = relationship("Staff", back_populates="season")
    students = relationship("Student", back_populates="season")
    pre_registrations = relationship("PreRegistration", back_populates="season")
    teacher_certificates = relationship("TeacherCertificate", back_populates="season")
    courses = relationship("Course", back_populates="season")
    course_classes = relationship("CourseClass", back_populates="season")
    attendances = relationship("Attendance", back_populates="season")
    achievements = relationship("Achievement", back_populates="season")
    student_achievements = relationship("StudentAchievement", back_populates="season")
    student_certificates = relationship("StudentCertificate", back_populates="season")
    course_feedbacks = relationship("Feedback", back_populates="season")
    schedules = relationship("Schedule", back_populates="season")
    slots = relationship("Slot", back_populates="season")
    gamification = relationship("Gamification", back_populates="season")
    gamification_levels = relationship("GamificationLevel", back_populates="season")
    extracurricular_activities = relationship("ExtracurricularActivity", back_populates="season")
    extracurricular_teams = relationship("ExtracurricularTeam", back_populates="season")
    extracurricular_team_members = relationship("ExtracurricularTeamMember", back_populates="season")
    extracurricular_scores = relationship("ExtracurricularScore", back_populates="season")
    enrollments = relationship("Enrollment", back_populates="season")
    
    