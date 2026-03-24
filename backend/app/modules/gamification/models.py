from sqlalchemy import Column, Integer, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base

class Gamification(Base):
    __tablename__ = "gamification"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    attendance_score = Column(Integer, default=0)
    achievement_score = Column(Integer, default=0)
    extracurricular_score = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    level = Column(Integer, default=0)

    student = relationship("Student", back_populates="gamification")

class GamificationLevel(Base):
    __tablename__ = "gamification_level"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gamification_level = Column(Integer, nullable=False)
    gamification_level_score = Column(Integer, nullable=False) 


class ExtracurricularActivity(Base):
    __tablename__ = "extracurricular_activity"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ex_course_name = Column(String(100), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    ex_course_score = Column(Integer, nullable=False)

    staff = relationship("Staff", back_populates="extracurricular_activities")
    extracurricular_scores = relationship("ExtracurricularScore", back_populates="ex_course")


class ExtracurricularTeam(Base):
    __tablename__ = "extracurricular_team"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ex_team_number = Column(Integer, unique=True, nullable=False)  # Уникальный номер команды
    ex_team_name = Column(String, nullable=False)

    members = relationship("ExtracurricularTeamMember", back_populates="team")
    scores = relationship("ExtracurricularScore", back_populates="team")
    
    
class ExtracurricularTeamMember(Base): #добавить мб опциональное название команды??
    __tablename__ = "extracurricular_team_members"
    
    __table_args__ = (UniqueConstraint("team_id", "student_id"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("extracurricular_team.id"), nullable=False)  # Идентификатор команды
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)  # Идентификатор студента

    # Связь с моделью ExtracurricularTeam
    team = relationship("ExtracurricularTeam", back_populates="members")
    
    # Связь с моделью Student
    student = relationship("Student", back_populates="team_members")
    
    
class ExtracurricularScore(Base):
    __tablename__ = "extracurricular_score"
    
    __table_args__ = (UniqueConstraint("team_id", "ex_course_id"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("extracurricular_team.id"), nullable=False)
    ex_course_id = Column(Integer, ForeignKey("extracurricular_activity.id"), nullable=False)
    ex_team_score = Column(Integer, default=0)
    
    team = relationship("ExtracurricularTeam", back_populates="scores")
    ex_course = relationship("ExtracurricularActivity", back_populates="extracurricular_scores")
    
