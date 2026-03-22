from sqlalchemy import Column, Date, ForeignKey, Integer, Time, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import Base


class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_class_id = Column(Integer, ForeignKey("course_class.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=True)
    lesson_date = Column(Date, nullable=False)
    lesson_time = Column(Time, nullable=False)

    staff = relationship("Staff", back_populates="schedules")
    course_class = relationship("CourseClass", back_populates="schedules")
    slot = relationship("Slot", back_populates="schedules")
    attendances = relationship("Attendance", back_populates="schedule")

    __table_args__ = (
        UniqueConstraint("staff_id", "lesson_date", "lesson_time", name="uq_schedule_staff_datetime"),
    )


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    slot_date = Column(Date, nullable=False)
    slot_time = Column(Time, nullable=False)

    staff = relationship("Staff", back_populates="slots")
    schedules = relationship("Schedule", back_populates="slot")

    __table_args__ = (
        UniqueConstraint("staff_id", "slot_date", "slot_time", name="uq_slots_staff_datetime"),
    )
