from sqlalchemy import Column, Date, ForeignKey, Integer, Time, UniqueConstraint,  String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_class_id = Column(Integer, ForeignKey("course_class.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=True)
    lesson_date = Column(Date, nullable=False)
    lesson_time = Column(Time, nullable=False)
    classroom = Column(String(20), nullable=True)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    staff = relationship("Staff", back_populates="schedules")
    course_class = relationship("CourseClass", back_populates="schedules")
    slot = relationship("Slot", back_populates="schedules")
    attendances = relationship("Attendance", back_populates="schedule")
    season = relationship("Season", back_populates="schedules")

    __table_args__ = (
        UniqueConstraint("staff_id", "lesson_date", "lesson_time", name="uq_schedule_staff_datetime"),
        UniqueConstraint("lesson_date", "lesson_time", "classroom", name="uq_schedule_classroom_datetime"),
    )


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    slot_date = Column(Date, nullable=False)
    slot_time = Column(Time, nullable=False)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    staff = relationship("Staff", back_populates="slots")
    schedules = relationship("Schedule", back_populates="slot")
    season = relationship("Season", back_populates="slots")

    __table_args__ = (
        UniqueConstraint("staff_id", "slot_date", "slot_time", name="uq_slots_staff_datetime"),
    )

class ScheduleGeneration(Base):
    __tablename__ = "schedule_generation"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)
    status = Column(String(30), nullable=False, default="Draft")
    solver_status = Column(String(30), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    approved_at = Column(TIMESTAMP(timezone=True), nullable=True)

    items = relationship(
        "ScheduleGenerationItem",
        back_populates="generation",
        cascade="all, delete-orphan"
    )


class ScheduleGenerationItem(Base):
    __tablename__ = "schedule_generation_item"

    id = Column(Integer, primary_key=True, index=True)
    generation_id = Column(Integer, ForeignKey("schedule_generation.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    course_class_id = Column(Integer, ForeignKey("course_class.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=True)
    lesson_date = Column(Date, nullable=False)
    lesson_time = Column(Time, nullable=False)
    classroom = Column(String(20), nullable=True)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    generation = relationship("ScheduleGeneration", back_populates="items")
    slot = relationship("Slot")
    course_class = relationship("CourseClass")
    staff = relationship("Staff")

    __table_args__ = (
        UniqueConstraint(
            "generation_id",
            "staff_id",
            "lesson_date",
            "lesson_time",
            name="uq_schedule_generation_staff_datetime"
        ),
    )
