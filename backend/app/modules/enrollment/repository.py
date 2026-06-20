from datetime import date, time

from sqlalchemy.orm import Session

from app.modules.courses.models import Course, CourseClass
from app.modules.enrollment.models import Enrollment
from app.modules.scheduling.models import Schedule
from app.modules.users.models import IntakeControl, Staff, Student


class EnrollmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_enrollment_by_season(self, season_id: int) -> list[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.season_id == season_id).all()
    
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

    def get_student_by_id(self, student_id: int) -> Student | None:
        return self.db.query(Student).filter(Student.id == student_id).first()

    def update_student_status(self, student: Student, status_value: str) -> Student:
        student.student_status = status_value
        self.db.commit()
        self.db.refresh(student)
        return student

    def get_course_by_id(self, course_id: int) -> Course | None:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def list_published_courses_with_schedule(self) -> list[Course]:
        return (
            self.db.query(Course)
            .join(CourseClass, CourseClass.course_id == Course.id)
            .join(Schedule, Schedule.course_class_id == CourseClass.id)
            .filter(Course.course_status == "Published")
            .distinct(Course.id)
            .order_by(Course.id.asc())
            .all()
        )

    def get_staff_by_id(self, staff_id: int) -> Staff | None:
        return self.db.query(Staff).filter(Staff.id == staff_id).first()

    def get_enrollment_by_id(self, enrollment_id: int) -> Enrollment | None:
        return self.db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    def get_enrollment_by_student_and_course(self, student_id: int, course_id: int) -> Enrollment | None:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
            .first()
        )

    def list_enrollments_by_student(self, student_id: int, offset: int = 0, limit: int = 20) -> list[Enrollment]:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.student_id == student_id)
            .order_by(Enrollment.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def list_enrollments_by_course(self, course_id: int, offset: int = 0, limit: int = 20) -> list[Enrollment]:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.course_id == course_id)
            .order_by(Enrollment.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count_active_enrollments(self, course_id: int) -> int:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.course_id == course_id, Enrollment.enrollment_status == "Active")
            .count()
        )

    def create_enrollment(self, student_id: int, course_id: int) -> Enrollment:
        db_enrollment = Enrollment(student_id=student_id, course_id=course_id, enrollment_status="Active")
        self.db.add(db_enrollment)
        self.db.commit()
        self.db.refresh(db_enrollment)
        return db_enrollment

    def update_enrollment_status(self, enrollment: Enrollment, new_status: str) -> Enrollment:
        enrollment.enrollment_status = new_status
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment

    def list_course_schedule_slots(self, course_id: int) -> list[tuple[date, time]]:
        rows = (
            self.db.query(Schedule.lesson_date, Schedule.lesson_time)
            .join(CourseClass, CourseClass.id == Schedule.course_class_id)
            .filter(CourseClass.course_id == course_id)
            .all()
        )
        return [(row.lesson_date, row.lesson_time) for row in rows]

    def list_course_slot_hours(self, course_id: int) -> list[int]:
        rows = (
            self.db.query(Schedule.lesson_time)
            .join(CourseClass, CourseClass.id == Schedule.course_class_id)
            .filter(CourseClass.course_id == course_id)
            .all()
        )
        return sorted({row.lesson_time.hour for row in rows})

    def course_has_slot_hour(self, course_id: int, slot_hour: int) -> bool:
        return slot_hour in self.list_course_slot_hours(course_id=course_id)

    def list_student_active_enrollments(self, student_id: int) -> list[Enrollment]:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.student_id == student_id, Enrollment.enrollment_status == "Active")
            .order_by(Enrollment.id.asc())
            .all()
        )

    def has_student_schedule_conflict(self, student_id: int, course_id: int) -> bool:
        target_slots = set(self.list_course_schedule_slots(course_id=course_id))
        if not target_slots:
            return False

        rows = (
            self.db.query(Schedule.lesson_date, Schedule.lesson_time)
            .join(CourseClass, CourseClass.id == Schedule.course_class_id)
            .join(Enrollment, Enrollment.course_id == CourseClass.course_id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.enrollment_status == "Active",
                Enrollment.course_id != course_id,
            )
            .all()
        )

        for row in rows:
            if (row.lesson_date, row.lesson_time) in target_slots:
                return True

        return False
