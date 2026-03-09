from sqlalchemy import Column, Integer, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from ..db.base import Base

class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_class_id = Column(Integer, ForeignKey("course_class.id"), nullable=False)
    lesson_date = Column(Date, nullable=False)
    lesson_time = Column(Time, nullable=False)

    staff = relationship("Staff", back_populates="slots")
    attendances = relationship("Attendance", back_populates="schedule")

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    slot_date = Column(Date, nullable=False)
    slot_time = Column(Time, nullable=False)

    staff = relationship("Staff", back_populates="slots")