from datetime import date, datetime, time

from sqlalchemy.orm import Session, joinedload

from app.modules.courses.models import Course, CourseClass
from app.modules.scheduling.models import Schedule, Slot
from app.modules.users.models import IntakeControl, Staff


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_course_by_season(self, season_id: int) -> list[Course]:
        return self.db.query(Course).filter(Course.season_id == season_id).all()
    
    def get_course_classes(self):
        return (self.db.query(CourseClass).options(joinedload(CourseClass.course)).all())

    def get_by_id(self, course_id: int) -> Course | None:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def get_all(self, offset: int = 0, limit: int = 20) -> list[Course]:
        return self.db.query(Course).order_by(Course.id.desc()).offset(offset).limit(limit).all()

    def get_all_published(self, offset: int = 0, limit: int = 20) -> list[Course]:
        return (
            self.db.query(Course)
            .filter(Course.course_status == "Published")
            .order_by(Course.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_all_by_staff(self, staff_id: int, offset: int = 0, limit: int = 20) -> list[Course]:
        return (
            self.db.query(Course)
            .filter(Course.staff_id == staff_id)
            .order_by(Course.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_staff_by_id(self, staff_id: int) -> Staff | None:
        return self.db.query(Staff).filter(Staff.id == staff_id).first()

    def create_course(
        self,
        title: str,
        description: str,
        staff_id: int,
        course_status: str,
        course_duration: str,
        course_type: str,
        syllabus_url: str,
        capacity: int | None,
        season_id: int,
    ) -> Course:
        db_course = Course(
            title=title,
            descriptions=description,
            staff_id=staff_id,
            course_status=course_status,
            course_duration=course_duration,
            course_type=course_type,
            syllabus_url=syllabus_url,
            capacity=capacity,
            season_id=season_id,
        )
        self.db.add(db_course)
        self.db.commit()
        self.db.refresh(db_course)
        return db_course

    def set_cover_image_key(self, course_id: int, cover_image_key: str | None) -> Course | None:
        course = self.get_by_id(course_id=course_id)
        if course is None:
            return None
        course.cover_image_key = cover_image_key
        self.db.commit()
        self.db.refresh(course)
        return course

    def update_course(self, course: Course, **fields) -> Course:
        for key, value in fields.items():
            setattr(course, key, value)

        self.db.commit()
        self.db.refresh(course)
        return course

    def delete_course(self, course: Course) -> None:
        self.db.delete(course)
        self.db.commit()

    def get_slot_by_id(self, slot_id: int) -> Slot | None:
        return self.db.query(Slot).filter(Slot.id == slot_id).first()

    def get_slot(self, staff_id: int, slot_date: date, slot_time: time) -> Slot | None:
        return (
            self.db.query(Slot)
            .filter(
                Slot.staff_id == staff_id,
                Slot.slot_date == slot_date,
                Slot.slot_time == slot_time,
            )
            .first()
        )

    def create_slot_if_not_exists(self, staff_id: int, slot_date: date, slot_time: time, season_id: int) -> tuple[Slot, bool]:
        existing = self.get_slot(staff_id=staff_id, slot_date=slot_date, slot_time=slot_time)
        if existing is not None:
            return existing, False

        slot = Slot(staff_id=staff_id, slot_date=slot_date, slot_time=slot_time, season_id=season_id)
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        return slot, True

    def list_course_slots(self, course_id: int, start_date: date | None = None) -> list[tuple[Slot, bool]]:
        course = self.get_by_id(course_id=course_id)
        if course is None:
            return []

        query = (
            self.db.query(Slot, Schedule.id)
            .outerjoin(Schedule, Schedule.slot_id == Slot.id)
            .filter(Slot.staff_id == course.staff_id)
        )

        if start_date is not None:
            query = query.filter(Slot.slot_date >= start_date)

        rows = query.order_by(Slot.slot_date.asc(), Slot.slot_time.asc()).all()
        return [(slot, schedule_id is not None) for slot, schedule_id in rows]

    def slot_has_schedule(self, slot_id: int) -> bool:
        return self.db.query(Schedule.id).filter(Schedule.slot_id == slot_id).first() is not None

    def delete_slot(self, slot: Slot) -> None:
        self.db.delete(slot)
        self.db.commit()

    def get_or_create_intake_control(self) -> IntakeControl:
        control = self.db.query(IntakeControl).filter(IntakeControl.id == 1).first()
        if control is None:
            control = IntakeControl(id=1, intake_closed=False, closed_at=None, closed_by=None)
            self.db.add(control)
            self.db.commit()
            self.db.refresh(control)
        return control

    def is_intake_closed(self) -> bool:
        return self.get_or_create_intake_control().intake_closed

    def set_intake_closed(self, value: bool, closed_by: int | None) -> IntakeControl:
        control = self.get_or_create_intake_control()
        control.intake_closed = value
        if value:
            control.closed_by = closed_by
            control.closed_at = datetime.utcnow()
        else:
            control.closed_by = None
            control.closed_at = None
        self.db.commit()
        self.db.refresh(control)
        return control
