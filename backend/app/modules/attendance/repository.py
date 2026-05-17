from datetime import date

from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.modules.attendance.models import Attendance, Achievement, StudentAchievement
from app.modules.courses.models import Course, CourseClass
from app.modules.enrollment.models import Enrollment
from app.modules.gamification.models import Gamification
from app.modules.scheduling.models import Schedule
from app.modules.users.models import Staff, Student


class AttendanceRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_attendance_by_season(self, season_id: int) -> list[Attendance]:
        return self.db.query(Attendance).filter(Attendance.season_id == season_id).all()

    def get_schedule_with_course(self, schedule_id: int):
        return (
            self.db.query(Schedule, CourseClass, Course, Staff)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Staff, Schedule.staff_id == Staff.id)
            .filter(Schedule.id == schedule_id)
            .first()
        )

    def get_course_with_staff(self, course_id: int):
        return (
            self.db.query(Course, Staff)
            .join(Staff, Course.staff_id == Staff.id)
            .filter(Course.id == course_id)
            .first()
        )

    def get_student_by_id(self, student_id: int) -> Student | None:
        return self.db.query(Student).filter(Student.id == student_id).first()

    def is_student_enrolled_in_course(self, student_id: int, course_id: int) -> bool:
        return (
            self.db.query(Enrollment.id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.course_id == course_id,
                Enrollment.enrollment_status != "Dropped",
            )
            .first()
            is not None
        )

    def get_attendance(self, student_id: int, schedule_id: int) -> Attendance | None:
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.student_id == student_id,
                Attendance.schedule_id == schedule_id,
            )
            .first()
        )

    def upsert_attendance(self, student_id: int, schedule_id: int, attendance_status: bool) -> tuple[Attendance, bool]:
        attendance = self.get_attendance(student_id=student_id, schedule_id=schedule_id)
        created = False

        if attendance is None:
            attendance = Attendance(
                student_id=student_id,
                schedule_id=schedule_id,
                attendance_status=attendance_status,
            )
            self.db.add(attendance)
            created = True
        else:
            attendance.attendance_status = attendance_status

        self.db.commit()
        self.db.refresh(attendance)
        return attendance, created

    def count_course_lessons(self, course_id: int) -> int:
        return (
            self.db.query(Schedule.id)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .filter(CourseClass.course_id == course_id)
            .count()
        )

    def list_course_student_summaries(self, course_id: int, search: str | None = None) -> list[dict]:
        total_lessons = self.count_course_lessons(course_id=course_id)

        attended_subq = (
            self.db.query(
                Attendance.student_id.label("student_id"),
                func.count(Attendance.id).label("attended_lessons"),
            )
            .join(Schedule, Attendance.schedule_id == Schedule.id)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .filter(
                CourseClass.course_id == course_id,
                Attendance.attendance_status.is_(True),
            )
            .group_by(Attendance.student_id)
            .subquery()
        )

        query = (
            self.db.query(
                Student.id.label("student_id"),
                Student.first_name,
                Student.last_name,
                Student.email,
                func.coalesce(attended_subq.c.attended_lessons, 0).label("attended_lessons"),
            )
            .join(Enrollment, Enrollment.student_id == Student.id)
            .outerjoin(attended_subq, attended_subq.c.student_id == Student.id)
            .filter(
                Enrollment.course_id == course_id,
                Enrollment.enrollment_status != "Dropped",
            )
        )

        if search:
            like_query = f"%{search}%"
            query = query.filter(
                or_(
                    Student.first_name.ilike(like_query),
                    Student.last_name.ilike(like_query),
                    Student.email.ilike(like_query),
                )
            )

        rows = query.order_by(Student.last_name.asc(), Student.first_name.asc()).all()

        results: list[dict] = []
        for row in rows:
            attendance_percent = 0.0
            if total_lessons > 0:
                attendance_percent = round((row.attended_lessons / total_lessons) * 100, 2)

            results.append(
                {
                    "student_id": row.student_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "email": row.email,
                    "attended_lessons": int(row.attended_lessons),
                    "total_lessons": total_lessons,
                    "attendance_percent": attendance_percent,
                }
            )

        return results

    def list_course_lessons_with_student_attendance(self, course_id: int, student_id: int) -> list[dict]:
        rows = (
            self.db.query(
                Schedule.id.label("schedule_id"),
                Schedule.lesson_date,
                Schedule.lesson_time,
                Attendance.attendance_status,
            )
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .outerjoin(
                Attendance,
                (Attendance.schedule_id == Schedule.id) & (Attendance.student_id == student_id),
            )
            .filter(CourseClass.course_id == course_id)
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc())
            .all()
        )

        return [
            {
                "schedule_id": row.schedule_id,
                "lesson_date": row.lesson_date,
                "lesson_time": row.lesson_time,
                "attendance_status": row.attendance_status,
            }
            for row in rows
        ]

    def search_students_global(self, query_value: str, limit: int = 50) -> list[Student]:
        like_query = f"%{query_value}%"
        return (
            self.db.query(Student)
            .filter(
                or_(
                    Student.first_name.ilike(like_query),
                    Student.last_name.ilike(like_query),
                    Student.email.ilike(like_query),
                )
            )
            .order_by(Student.last_name.asc(), Student.first_name.asc())
            .limit(limit)
            .all()
        )

    def search_students_in_course(self, course_id: int, query_value: str, limit: int = 50) -> list[Student]:
        like_query = f"%{query_value}%"
        return (
            self.db.query(Student)
            .join(Enrollment, Enrollment.student_id == Student.id)
            .filter(
                Enrollment.course_id == course_id,
                Enrollment.enrollment_status != "Dropped",
                or_(
                    Student.first_name.ilike(like_query),
                    Student.last_name.ilike(like_query),
                    Student.email.ilike(like_query),
                ),
            )
            .order_by(Student.last_name.asc(), Student.first_name.asc())
            .limit(limit)
            .all()
        )

    def search_students_for_teacher(self, teacher_staff_id: int, query_value: str, limit: int = 50) -> list[Student]:
        like_query = f"%{query_value}%"
        return (
            self.db.query(Student)
            .join(Enrollment, Enrollment.student_id == Student.id)
            .join(Course, Course.id == Enrollment.course_id)
            .filter(
                Course.staff_id == teacher_staff_id,
                Enrollment.enrollment_status != "Dropped",
                or_(
                    Student.first_name.ilike(like_query),
                    Student.last_name.ilike(like_query),
                    Student.email.ilike(like_query),
                ),
            )
            .distinct(Student.id)
            .order_by(Student.last_name.asc(), Student.first_name.asc())
            .limit(limit)
            .all()
        )

    def list_student_courses(self, student_id: int) -> list[Course]:
        return (
            self.db.query(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.enrollment_status == "Active",
            )
            .order_by(Course.id.asc())
            .all()
        )

    def list_student_filter_courses(self, student_id: int) -> list[dict]:
        rows = (
            self.db.query(Course.id, Course.title, Staff.first_name, Staff.last_name)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .join(Staff, Course.staff_id == Staff.id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.enrollment_status == "Active",
            )
            .order_by(Course.id.asc())
            .all()
        )

        return [
            {
                "course_id": row.id,
                "course_title": row.title,
                "teacher_name": f"{row.first_name} {row.last_name}".strip() or "Преподаватель не указан",
            }
            for row in rows
        ]

    def list_student_lesson_dates(self, student_id: int) -> list[date]:
        rows = (
            self.db.query(Schedule.lesson_date)
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.enrollment_status == "Active",
            )
            .distinct()
            .order_by(Schedule.lesson_date.asc())
            .all()
        )

        return [row.lesson_date for row in rows if isinstance(row.lesson_date, date)]

    def list_student_attendance_charges(self, student_id: int) -> list[dict]:
        rows = (
            self.db.query(
                Schedule.id.label("schedule_id"),
                Course.id.label("course_id"),
                Course.title.label("course_title"),
                Staff.first_name,
                Staff.last_name,
                Schedule.lesson_date,
                Attendance.attendance_status,
            )
            .join(CourseClass, Schedule.course_class_id == CourseClass.id)
            .join(Course, CourseClass.course_id == Course.id)
            .join(Staff, Course.staff_id == Staff.id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .outerjoin(
                Attendance,
                (Attendance.schedule_id == Schedule.id) & (Attendance.student_id == student_id),
            )
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.enrollment_status == "Active",
            )
            .order_by(Schedule.lesson_date.asc(), Schedule.lesson_time.asc())
            .all()
        )

        results: list[dict] = []
        for row in rows:
            attended = row.attendance_status is True
            results.append(
                {
                    "schedule_id": row.schedule_id,
                    "course_id": row.course_id,
                    "course_title": row.course_title,
                    "teacher_name": f"{row.first_name} {row.last_name}".strip() or "Преподаватель не указан",
                    "lesson_date": row.lesson_date,
                    "points": 1 if attended else 0,
                    "attended": attended,
                }
            )

        return results

    def count_student_attended_total(self, student_id: int) -> int:
        return (
            self.db.query(Attendance.id)
            .filter(
                Attendance.student_id == student_id,
                Attendance.attendance_status.is_(True),
            )
            .count()
        )

    def get_gamification(self, student_id: int) -> Gamification | None:
        return self.db.query(Gamification).filter(Gamification.student_id == student_id).first()

    def upsert_gamification_attendance_score(self, student_id: int, attendance_score: int) -> Gamification:
        gamification = self.get_gamification(student_id=student_id)

        if gamification is None:
            gamification = Gamification(
                student_id=student_id,
                attendance_score=attendance_score,
                achievement_score=0,
                extracurricular_score=0,
                total_score=attendance_score,
                level=0,
            )
            self.db.add(gamification)
        else:
            gamification.attendance_score = attendance_score
            gamification.total_score = (
                attendance_score
                + (gamification.achievement_score or 0)
                + (gamification.extracurricular_score or 0)
            )

        self.db.commit()
        self.db.refresh(gamification)
        return gamification
    
class AchievementRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_achievement_by_season(self, season_id: int) -> list[Achievement]:
        return self.db.query(Achievement).filter(Achievement.season_id == season_id).all()

    def assign_to_student(self, student_id: int, achievement_id: int):
        obj = StudentAchievement(
            student_id=student_id,
            achievement_id=achievement_id,
        )

        self.db.add(obj)

        try:
            self.db.commit()
            self.db.refresh(obj)
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="This achievement is already assigned to the student"
            )

        return obj

    def get_student_course_achievements(self, student_id: int, course_id: int):
        return (
            self.db.query(
                Achievement.course_id.label("course_id"),
                Achievement.achievement_name.label("achievement_name"),
            )
            .join(StudentAchievement, StudentAchievement.achievement_id == Achievement.id)
            .filter(
                StudentAchievement.student_id == student_id,
                Achievement.course_id == course_id,
            )
            .all()
        )

    def list_student_achievements(self, student_id: int):
        return (
            self.db.query(
                StudentAchievement.id.label("id"),
                StudentAchievement.student_id.label("student_id"),
                StudentAchievement.achievement_id.label("achievement_id"),
                StudentAchievement.awarded_at.label("awarded_at"),
                StudentAchievement.season_id.label("season_id"),
                Achievement.course_id.label("course_id"),
                Course.title.label("course_title"),
                Achievement.achievement_name.label("achievement_name"),
                Achievement.achievement_description.label("achievement_description"),
                Achievement.achievement_score.label("achievement_score"),
            )
            .join(Achievement, StudentAchievement.achievement_id == Achievement.id)
            .join(Course, Achievement.course_id == Course.id)
            .filter(StudentAchievement.student_id == student_id)
            .order_by(StudentAchievement.awarded_at.desc(), StudentAchievement.id.desc())
            .all()
        )
