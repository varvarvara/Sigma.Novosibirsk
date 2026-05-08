from datetime import date, time
import re

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.scheduling.models import ScheduleGeneration
from app.modules.courses.models import Course, CourseClass
from app.modules.scheduling.models import Schedule, Slot
from app.modules.users.models import IntakeControl, Staff


class SchedulingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_schedule_by_season(self, season_id: int) -> list[Schedule]:
        return self.db.query(Schedule).filter(Schedule.season_id == season_id).all()

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

    def get_course_by_id(self, course_id: int) -> Course | None:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def list_courses_for_global(self) -> list[Course]:
        return (
            self.db.query(Course)
            .filter(Course.course_status != "Archived")
            .order_by(Course.id.asc())
            .all()
        )

    def count_schedule_items(self, course_id: int) -> int:
        return (
            self.db.query(Schedule)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .filter(CourseClass.course_id == course_id)
            .count()
        )

    def list_schedule_by_course(self, course_id: int) -> list[Schedule]:
        return (
            self.db.query(Schedule)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .filter(CourseClass.course_id == course_id)
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc())
            .all()
        )

    def list_timetable_rows(self):
        return (
            self.db.query(Schedule, CourseClass, Course, Staff)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Staff, Schedule.staff_id == Staff.id)
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc(), Course.id.asc())
            .all()
        )

    def list_timetable_rows_by_staff(self, staff_id: int):
        return (
            self.db.query(Schedule, CourseClass, Course, Staff)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Staff, Schedule.staff_id == Staff.id)
            .filter(Schedule.staff_id == staff_id)
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc(), Course.id.asc())
            .all()
        )

    def get_staff_by_id(self, staff_id: int) -> Staff | None:
        return self.db.query(Staff).filter(Staff.id == staff_id).first()

    def has_teacher_conflict(self, staff_id: int, lesson_date: date, lesson_time: time) -> bool:
        return (
            self.db.query(Schedule.id)
            .filter(
                Schedule.staff_id == staff_id,
                Schedule.lesson_date == lesson_date,
                Schedule.lesson_time == lesson_time,
            )
            .first()
            is not None
        )

    def count_lessons_in_timeslot(self, lesson_date: date, lesson_time: time) -> int:
        count = (
            self.db.query(func.count(Schedule.id))
            .filter(
                Schedule.lesson_date == lesson_date,
                Schedule.lesson_time == lesson_time,
            )
            .scalar()
        )
        return int(count or 0)

    def count_lessons_on_date(self, lesson_date: date, season_id: int | None = None) -> int:
        query = self.db.query(func.count(Schedule.id)).filter(
            Schedule.lesson_date == lesson_date,
        )
        if season_id is not None:
            query = query.filter(Schedule.season_id == season_id)
        count = query.scalar()
        return int(count or 0)

    def has_course_title_conflict(
        self,
        course_title: str,
        lesson_date: date,
        lesson_time: time,
        exclude_course_id: int | None = None,
    ) -> bool:
        query = (
            self.db.query(Schedule.id)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .filter(
                Course.title == course_title,
                Schedule.lesson_date == lesson_date,
                Schedule.lesson_time == lesson_time,
            )
        )

        if exclude_course_id is not None:
            query = query.filter(Course.id != exclude_course_id)

        return query.first() is not None

    @staticmethod
    def _subject_key(title: str) -> str:
        # Heuristic: first meaningful token in title is treated as subject key.
        # Example: "Biology Advanced" and "Biology Basic" => "biology"
        if not title:
            return ""

        tokens = [token for token in re.split(r"[\s\-:|/()[\],.]+", title.strip().lower()) if token]
        if not tokens:
            return title.strip().lower()

        stopwords = {"course", "курс", "subject", "предмет"}
        for token in tokens:
            if token not in stopwords and not token.isdigit():
                return token
        return tokens[0]

    def has_subject_conflict(
        self,
        course_title: str,
        lesson_date: date,
        lesson_time: time,
        exclude_course_id: int | None = None,
    ) -> bool:
        target_key = self._subject_key(course_title)
        if not target_key:
            return False

        query = (
            self.db.query(Course.id, Course.title)
            .join(CourseClass, CourseClass.course_id == Course.id)
            .join(Schedule, Schedule.course_class_id == CourseClass.id)
            .filter(
                Schedule.lesson_date == lesson_date,
                Schedule.lesson_time == lesson_time,
            )
        )

        if exclude_course_id is not None:
            query = query.filter(Course.id != exclude_course_id)

        for _, title in query.all():
            if self._subject_key(title) == target_key:
                return True

        return False

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

    def create_slot(self, staff_id: int, slot_date: date, slot_time: time) -> Slot:
        slot = Slot(staff_id=staff_id, slot_date=slot_date, slot_time=slot_time)
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        return slot

    def get_or_create_slot(self, staff_id: int, slot_date: date, slot_time: time) -> Slot:
        existing = self.get_slot(staff_id=staff_id, slot_date=slot_date, slot_time=slot_time)
        if existing is not None:
            return existing
        return self.create_slot(staff_id=staff_id, slot_date=slot_date, slot_time=slot_time)

    def list_free_staff_slots(self, staff_id: int, start_date: date | None = None) -> list[Slot]:
        query = (
            self.db.query(Slot)
            .outerjoin(Schedule, Schedule.slot_id == Slot.id)
            .filter(Slot.staff_id == staff_id, Schedule.id.is_(None))
        )
        if start_date is not None:
            query = query.filter(Slot.slot_date >= start_date)
        return query.order_by(Slot.slot_date.asc(), Slot.slot_time.asc()).all()

    def next_course_class_number(self, course_id: int) -> int:
        current_max = self.db.query(func.max(CourseClass.class_number)).filter(CourseClass.course_id == course_id).scalar()
        return (current_max or 0) + 1

    def create_course_class(
        self,
        course_id: int,
        class_number: int,
        class_description: str,
        season_id: int,
    ) -> CourseClass:
        course_class = CourseClass(
            course_id=course_id,
            class_number=class_number,
            class_description=class_description,
            season_id=season_id,
        )
        self.db.add(course_class)
        self.db.commit()
        self.db.refresh(course_class)
        return course_class

    def create_schedule(
        self,
        staff_id: int,
        course_class_id: int,
        slot_id: int | None,
        lesson_date: date,
        lesson_time: time,
        season_id: int | None = None,
    ) -> Schedule:
        if season_id is None and slot_id is not None:
            slot = self.db.query(Slot).filter(Slot.id == slot_id).first()
            if slot is not None:
                season_id = slot.season_id

        if season_id is None:
            raise ValueError("season_id is required to create schedule")

        schedule = Schedule(
            staff_id=staff_id,
            course_class_id=course_class_id,
            slot_id=slot_id,
            lesson_date=lesson_date,
            lesson_time=lesson_time,
            season_id=season_id,
        )
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def create_schedule_generation(self, season_id: int, solver_status: str):
        from app.modules.scheduling.models import ScheduleGeneration

        generation = ScheduleGeneration(
            season_id=season_id,
            status="Draft",
            solver_status=solver_status,
        )
        self.db.add(generation)
        self.db.flush()
        return generation

    def create_schedule_generation_item(
        self,
        generation_id: int,
        staff_id: int,
        course_class_id: int,
        slot_id: int | None,
        lesson_date,
        lesson_time,
        season_id: int,
    ):
        from app.modules.scheduling.models import ScheduleGenerationItem

        item = ScheduleGenerationItem(
            generation_id=generation_id,
            staff_id=staff_id,
            course_class_id=course_class_id,
            slot_id=slot_id,
            lesson_date=lesson_date,
            lesson_time=lesson_time,
            season_id=season_id,
        )
        self.db.add(item)
        return item

    def get_schedule_generation(self, generation_id: int):
        from app.modules.scheduling.models import ScheduleGeneration

        return (
            self.db.query(ScheduleGeneration)
            .filter(ScheduleGeneration.id == generation_id)
            .first()
        )

    def list_schedule_generation_items(self, generation_id: int):
        from app.modules.scheduling.models import ScheduleGenerationItem

        return (
            self.db.query(ScheduleGenerationItem)
            .filter(ScheduleGenerationItem.generation_id == generation_id)
            .order_by(
                ScheduleGenerationItem.lesson_date.asc(),
                ScheduleGenerationItem.lesson_time.asc(),
            )
            .all()
        )

    def clear_schedule_by_season(self, season_id: int) -> None:
        self.db.query(Schedule).filter(Schedule.season_id == season_id).delete()

    def create_approved_schedule_from_generation_item(self, item):
        schedule = Schedule(
            staff_id=item.staff_id,
            course_class_id=item.course_class_id,
            slot_id=item.slot_id,
            lesson_date=item.lesson_date,
            lesson_time=item.lesson_time,
            season_id=item.season_id,
        )
        self.db.add(schedule)
        return schedule

    def list_schedule_events(
        self,
        season_id: int,
        teacher_id: int | None = None,
        course_id: int | None = None,
        student_id: int | None = None,
    ):
        from app.modules.enrollment.models import Enrollment

        query = (
            self.db.query(Schedule, CourseClass, Course, Staff)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Staff, Schedule.staff_id == Staff.id)
            .filter(Schedule.season_id == season_id)
        )

        if teacher_id is not None:
            query = query.filter(Schedule.staff_id == teacher_id)

        if course_id is not None:
            query = query.filter(Course.id == course_id)

        if student_id is not None:
            student_course_rows = (
                self.db.query(Enrollment.course_id)
                .filter(
                    Enrollment.student_id == student_id,
                    Enrollment.enrollment_status == "Active",
                    Enrollment.season_id == season_id,
                )
                .all()
            )

            student_course_ids = [row[0] for row in student_course_rows]

            if not student_course_ids:
                return []

            query = query.filter(Course.id.in_(student_course_ids))

        return (
            query
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc(), Course.id.asc())
            .all()
        )
