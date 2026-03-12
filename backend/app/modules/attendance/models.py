from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("schedule.id"), nullable=False)
    attendance_status = Column(Boolean, nullable=False)

    student = relationship("Student", back_populates="attendances")  # Связь с моделью Student
    schedule = relationship("Schedule", back_populates="attendances")  # Связь с моделью Schedule
    
## ачивки, баллы за посещаемость

class Achievement(Base):
    __tablename__ = "achievement"

    id = Column(Integer, primary_key=True, index=True)
    achievement_description = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False) 
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    achievement_score = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="achievements")  # Связь с курсом (если есть)
    student = relationship("Student", back_populates="achievements")  # Связь со студентом
    
    
class StudentCertificate(Base):
    __tablename__ = "student_certificate"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False) 
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False) 
    issued_by = Column(Integer, ForeignKey("staff.id"), nullable=False)  
    issued_at = Column(TIMESTAMP, default="now()") 
    certificate_url = Column(String(200), nullable=False)  
    certificate_status = Column(String(50))  # УТОЧНИТЬ МБ ЕНАМ СДЕЛАТЬ

    student = relationship("Student", back_populates="certificates")
    course = relationship("Course", back_populates="student_certificates")
    issuer = relationship("Staff", foreign_keys=[issued_by], back_populates="issued_student_certificates")