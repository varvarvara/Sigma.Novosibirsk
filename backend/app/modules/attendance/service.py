from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.attendance.models import Achievement
from app.modules.attendance.repository import AttendanceRepository, AchievementRepository
from app.modules.gamification.repository import GamificationRepository
from app.modules.attendance.schemas import (
    AttendanceBulkMarkIn,
    AttendanceBulkMarkOut,
    AttendanceMarkIn,
    AttendanceMarkOut,
    CourseAttendanceSummaryOut,
    CourseStudentAttendanceDetailOut,
    CourseStudentAttendanceSummaryOut,
    LessonAttendanceItemOut,
    StudentAttendanceDashboardOut,
    StudentAchievementDetailedOut,
    StudentAttendanceChargeOut,
    StudentAttendanceFilterCourseOut,
    StudentAttendanceFilterOptionsOut,
    StudentCourseAttendanceOut,
    StudentSearchItemOut,
)


class AttendanceService:
    def __init__(self, db: Session):
        self.repository = AttendanceRepository(db=db)
        self.achievement_repository = AchievementRepository(db=db)
        self.gam_repo = GamificationRepository(db)

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

    @staticmethod
    def _is_student(current_user: dict) -> bool:
        return current_user["user_type"] == "student"

    def _require_teacher_or_admin(self, current_user: dict) -> None:
        if not self._is_teacher(current_user) and not self._is_admin(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

    def _require_student(self, current_user: dict) -> None:
        if not self._is_student(current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")

    def _ensure_course_access(self, course_id: int, current_user: dict):
        course_info = self.repository.get_course_with_staff(course_id=course_id)
        if course_info is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        course, _staff = course_info

        if self._is_teacher(current_user) and course.staff_id != current_user["user"].id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        return course_info

    def _ensure_schedule_access(self, schedule_id: int, current_user: dict):
        row = self.repository.get_schedule_with_course(schedule_id=schedule_id)
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

        schedule, _course_class, course, _staff = row

        if self._is_teacher(current_user) and course.staff_id != current_user["user"].id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        return schedule, course

    def _recalculate_attendance_points(self, student_id: int) -> int:
        attended_lessons = self.repository.count_student_attended_total(student_id=student_id)
        gamification = self.repository.upsert_gamification_attendance_score(
            student_id=student_id,
            attendance_score=attended_lessons,
        )
        return int(gamification.attendance_score or 0)

    def mark_attendance(self, data: AttendanceMarkIn, current_user: dict) -> AttendanceMarkOut:
        self._require_teacher_or_admin(current_user=current_user)
        _schedule, course = self._ensure_schedule_access(schedule_id=data.schedule_id, current_user=current_user)

        student = self.repository.get_student_by_id(student_id=data.student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        if not self.repository.is_student_enrolled_in_course(student_id=data.student_id, course_id=course.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student is not enrolled in this course",
            )
        
        attendance, created = self.repository.upsert_attendance(
            student_id=data.student_id,
            schedule_id=data.schedule_id,
            attendance_status=data.attendance_status,
    )

        self.gam_repo.get_or_create(data.student_id)
        self.gam_repo.recalculate(data.student_id)

        gamification = self.gam_repo.get_by_student_id(data.student_id)


        return AttendanceMarkOut(
            attendance_id=attendance.id,
            student_id=attendance.student_id,
            schedule_id=attendance.schedule_id,
            attendance_status=attendance.attendance_status,
            attendance_points=gamification.attendance_score if gamification else 0,
            created=created,
        )

    def bulk_mark_attendance(
        self,
        schedule_id: int,
        data: AttendanceBulkMarkIn,
        current_user: dict,
    ) -> AttendanceBulkMarkOut:
        self._require_teacher_or_admin(current_user=current_user)
        _schedule, course = self._ensure_schedule_access(schedule_id=schedule_id, current_user=current_user)

        if not data.items:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Items list is empty")

        not_enrolled_student_ids: list[int] = []
        for item in data.items:
            if not self.repository.is_student_enrolled_in_course(student_id=item.student_id, course_id=course.id):
                not_enrolled_student_ids.append(item.student_id)

        if not_enrolled_student_ids:
            ids = ", ".join(str(item) for item in sorted(set(not_enrolled_student_ids)))
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Some students are not enrolled in this course: {ids}",
            )

        results: list[AttendanceMarkOut] = []
        for item in data.items:
            attendance, created = self.repository.upsert_attendance(
                student_id=item.student_id,
                schedule_id=schedule_id,
                attendance_status=item.attendance_status,
            )
            points = self._recalculate_attendance_points(student_id=item.student_id)

            results.append(
                AttendanceMarkOut(
                    attendance_id=attendance.id,
                    student_id=attendance.student_id,
                    schedule_id=attendance.schedule_id,
                    attendance_status=attendance.attendance_status,
                    attendance_points=points,
                    created=created,
                )
            )

        return AttendanceBulkMarkOut(
            schedule_id=schedule_id,
            updated_count=len(results),
            results=results,
        )

    def get_course_summary(
        self,
        course_id: int,
        current_user: dict,
        search: str | None = None,
    ) -> CourseAttendanceSummaryOut:
        self._require_teacher_or_admin(current_user=current_user)
        course, staff = self._ensure_course_access(course_id=course_id, current_user=current_user)

        students_data = self.repository.list_course_student_summaries(course_id=course_id, search=search)
        students = [CourseStudentAttendanceSummaryOut(**item) for item in students_data]

        teacher_name = f"{staff.first_name} {staff.last_name}".strip()
        return CourseAttendanceSummaryOut(
            course_id=course.id,
            course_title=course.title,
            staff_id=staff.id,
            teacher_name=teacher_name,
            students=students,
        )

    def get_course_student_detail(
        self,
        course_id: int,
        student_id: int,
        current_user: dict,
    ) -> CourseStudentAttendanceDetailOut:
        self._require_teacher_or_admin(current_user=current_user)
        course, _staff = self._ensure_course_access(course_id=course_id, current_user=current_user)

        student = self.repository.get_student_by_id(student_id=student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        if not self.repository.is_student_enrolled_in_course(student_id=student_id, course_id=course_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student is not enrolled in this course")

        lesson_rows = self.repository.list_course_lessons_with_student_attendance(
            course_id=course_id,
            student_id=student_id,
        )
        lessons = [LessonAttendanceItemOut(**item) for item in lesson_rows]

        total_lessons = len(lesson_rows)
        attended_lessons = sum(1 for item in lesson_rows if item["attendance_status"] is True)
        attendance_percent = round((attended_lessons / total_lessons) * 100, 2) if total_lessons else 0.0
        points = self._recalculate_attendance_points(student_id=student_id)

        return CourseStudentAttendanceDetailOut(
            student_id=student.id,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            course_id=course.id,
            course_title=course.title,
            attended_lessons=attended_lessons,
            total_lessons=total_lessons,
            attendance_percent=attendance_percent,
            attendance_points=points,
            lessons=lessons,
        )

    def search_students(
        self,
        query_value: str,
        current_user: dict,
        course_id: int | None = None,
    ) -> list[StudentSearchItemOut]:
        self._require_teacher_or_admin(current_user=current_user)

        if len(query_value.strip()) < 2:
            return []

        if course_id is not None:
            self._ensure_course_access(course_id=course_id, current_user=current_user)
            students = self.repository.search_students_in_course(
                course_id=course_id,
                query_value=query_value.strip(),
            )
        elif self._is_admin(current_user):
            students = self.repository.search_students_global(query_value=query_value.strip())
        else:
            students = self.repository.search_students_for_teacher(
                teacher_staff_id=current_user["user"].id,
                query_value=query_value.strip(),
            )

        return [
            StudentSearchItemOut(
                student_id=student.id,
                first_name=student.first_name,
                last_name=student.last_name,
                email=student.email,
            )
            for student in students
        ]

    def get_my_attendance(self, current_user: dict) -> StudentAttendanceDashboardOut:
        self._require_student(current_user=current_user)

        student = current_user["user"]
        student_id = student.id

        courses = self.repository.list_student_courses(student_id=student_id)
        courses_out: list[StudentCourseAttendanceOut] = []

        total_lessons = 0
        total_attended_lessons = 0

        for course in courses:
            lesson_rows = self.repository.list_course_lessons_with_student_attendance(
                course_id=course.id,
                student_id=student_id,
            )
            course_total = len(lesson_rows)
            course_attended = sum(1 for item in lesson_rows if item["attendance_status"] is True)

            total_lessons += course_total
            total_attended_lessons += course_attended

            attendance_percent = round((course_attended / course_total) * 100, 2) if course_total else 0.0

            courses_out.append(
                StudentCourseAttendanceOut(
                    course_id=course.id,
                    course_title=course.title,
                    attended_lessons=course_attended,
                    total_lessons=course_total,
                    attendance_percent=attendance_percent,
                )
            )

        attendance_points = self._recalculate_attendance_points(student_id=student_id)

        return StudentAttendanceDashboardOut(
            student_id=student_id,
            attendance_points=attendance_points,
            total_attended_lessons=total_attended_lessons,
            total_lessons=total_lessons,
            courses=courses_out,
        )

    def get_my_filter_options(self, current_user: dict) -> StudentAttendanceFilterOptionsOut:
        self._require_student(current_user=current_user)

        student_id = current_user["user"].id
        courses = [
            StudentAttendanceFilterCourseOut(**item)
            for item in self.repository.list_student_filter_courses(student_id=student_id)
        ]
        dates = self.repository.list_student_lesson_dates(student_id=student_id)

        return StudentAttendanceFilterOptionsOut(courses=courses, dates=dates)

    def get_my_attendance_charges(self, current_user: dict) -> list[StudentAttendanceChargeOut]:
        self._require_student(current_user=current_user)

        student_id = current_user["user"].id
        rows = self.repository.list_student_attendance_charges(student_id=student_id)

        return [StudentAttendanceChargeOut(**row) for row in rows]

    def get_my_achievements(self, current_user: dict) -> list[StudentAchievementDetailedOut]:
        self._require_student(current_user=current_user)

        student_id = current_user["user"].id
        rows = self.achievement_repository.list_student_achievements(student_id=student_id)

        return [
            StudentAchievementDetailedOut(
                id=row.id,
                student_id=row.student_id,
                achievement_id=row.achievement_id,
                awarded_at=row.awarded_at,
                season_id=row.season_id,
                course_id=row.course_id,
                course_title=row.course_title,
                achievement_name=row.achievement_name,
                achievement_description=row.achievement_description,
                achievement_score=row.achievement_score,
            )
            for row in rows
        ]
        
class AchievementService:
    def __init__(self, db: Session):
        self.repository = AchievementRepository(db=db)
        self.gam_repo = GamificationRepository(db)

    def assign_achievement(self, data, current_user):
        if current_user["user_type"] not in ["staff", "teacher"]:
            raise HTTPException(status_code=403, detail="Only staff or teachers are allowed")

        achievement = self.repository.db.query(Achievement).filter(
            Achievement.id == data.achievement_id
        ).first()

        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        obj = self.repository.assign_to_student(
            student_id=data.student_id,
            achievement_id=data.achievement_id,
        )

        return obj
    
    def create_achievement(self, data, current_user):
        if current_user["user_type"] != "staff":
            raise HTTPException(status_code=403, detail="Only staff allowed")

        achievement = Achievement(
            achievement_name=data.achievement_name,
            achievement_description=data.achievement_description,
            course_id=data.course_id,
            achievement_score=data.achievement_score,
        )

        self.repository.db.add(achievement)
        self.repository.db.commit()
        self.repository.db.refresh(achievement)

        return achievement
    
    
    def get_student_course_achievements(self, student_id: int, course_id: int):
        rows = self.repository.get_student_course_achievements(student_id, course_id)

        return [
            {
                "course_id": row.course_id,
                "achievement_name": row.achievement_name,
            }
            for row in rows
        ]
