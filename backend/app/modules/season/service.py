import re

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.attendance.models import Attendance, Achievement, StudentAchievement, StudentCertificate
from app.modules.courses.models import Course, CourseClass
from app.modules.course_feedback.models import Feedback
from app.modules.enrollment.models import Enrollment
from app.modules.gamification.models import (
    Gamification,
    GamificationLevel,
    ExtracurricularActivity,
    ExtracurricularTeam,
    ExtracurricularTeamMember,
    ExtracurricularScore,
)
from app.modules.media.service import get_media_service
from app.modules.scheduling.models import Schedule, Slot
from app.modules.users.models import Student, Staff, PreRegistration, TeacherCertificate
from app.modules.season.models import Season
from app.modules.season.schemas import (
    SeasonCourseGroupOut,
    SeasonCourseItemOut,
    SeasonCourseTeacherOut,
    SeasonCreate,
)

class SeasonService:
    def __init__(self, db: Session):
        self.db = db
        self.media = get_media_service()

    @staticmethod
    def _normalize_course_title(title: str | None) -> str:
        if not title:
            return ""
        normalized = re.sub(r"\s+", " ", title).strip().lower()
        return normalized

    def _build_course_group_key(self, course: Course) -> str:
        title_key = self._normalize_course_title(course.title)
        return f"{course.season_id}:{title_key}:{course.course_type}:{course.course_duration}"

    @staticmethod
    def _teacher_payload(staff: Staff | None) -> SeasonCourseTeacherOut | None:
        if staff is None:
            return None
        return SeasonCourseTeacherOut(
            staff_id=staff.id,
            first_name=staff.first_name,
            last_name=staff.last_name,
            partonymic=staff.partonymic,
        )

    def _student_payload(self, student: Student) -> dict:
        data = {
            column.name: getattr(student, column.name)
            for column in Student.__table__.columns
            if column.name != "password"
        }
        data["avatar_url"] = self.media.resolve_url(student.avatar_image_key)
        return data

    def get_season_by_id(self, season_id: int) -> Season | None:
        return self.db.query(Season).filter(Season.id == season_id).first()

    def create_season(self, data: SeasonCreate) -> Season:
        season = Season(**data.model_dump())
        self.db.add(season)
        self.db.commit()
        self.db.refresh(season)
        return season

    def get_staff_by_season(self, season_id: int) -> list[Staff]:
        return self.db.query(Staff).filter(Staff.season_id == season_id).all()

    def get_students_by_season(self, season_id: int) -> list[dict]:
        students = self.db.query(Student).filter(Student.season_id == season_id).all()
        return [self._student_payload(student) for student in students]

    def get_pre_registrations_by_season(self, season_id: int) -> list[PreRegistration]:
        return self.db.query(PreRegistration).filter(PreRegistration.season_id == season_id).all()

    def get_teacher_certificates_by_season(self, season_id: int) -> list[TeacherCertificate]:
        return self.db.query(TeacherCertificate).filter(TeacherCertificate.season_id == season_id).all()

    def get_courses_by_season(self, season_id: int) -> list[Course]:
        return self.db.query(Course).filter(Course.season_id == season_id).all()

    def get_course_groups_by_season(self, season_id: int) -> list[SeasonCourseGroupOut]:
        courses = (
            self.db.query(Course)
            .filter(Course.season_id == season_id)
            .all()
        )
        if not courses:
            return []

        active_enrollment_rows = (
            self.db.query(
                Enrollment.course_id,
                func.count(func.distinct(Enrollment.student_id)).label("student_count"),
            )
            .filter(
                Enrollment.season_id == season_id,
                Enrollment.enrollment_status == "Active",
            )
            .group_by(Enrollment.course_id)
            .all()
        )
        active_student_count_by_course = {
            row.course_id: int(row.student_count or 0)
            for row in active_enrollment_rows
        }

        lesson_rows = (
            self.db.query(
                CourseClass.course_id,
                func.count(Schedule.id).label("lesson_count"),
            )
            .join(Schedule, Schedule.course_class_id == CourseClass.id)
            .filter(Schedule.season_id == season_id)
            .group_by(CourseClass.course_id)
            .all()
        )
        lesson_count_by_course = {
            row.course_id: int(row.lesson_count or 0)
            for row in lesson_rows
        }

        groups: dict[str, dict] = {}
        for course in sorted(courses, key=lambda item: (item.title.lower(), item.id)):
            teacher_payload = self._teacher_payload(course.staff)
            group_key = self._build_course_group_key(course)
            group = groups.setdefault(
                group_key,
                {
                    "group_key": group_key,
                    "title": course.title,
                    "course_type": course.course_type,
                    "course_duration": course.course_duration,
                    "season_id": course.season_id,
                    "course_ids": [],
                    "course_count": 0,
                    "active_student_count": 0,
                    "lesson_count": 0,
                    "teachers": [],
                    "teacher_ids": set(),
                    "courses": [],
                },
            )

            group["course_ids"].append(course.id)
            group["course_count"] += 1
            group["active_student_count"] += active_student_count_by_course.get(course.id, 0)
            group["lesson_count"] += lesson_count_by_course.get(course.id, 0)

            if teacher_payload is not None and teacher_payload.staff_id not in group["teacher_ids"]:
                group["teacher_ids"].add(teacher_payload.staff_id)
                group["teachers"].append(teacher_payload)

            group["courses"].append(
                SeasonCourseItemOut(
                    course_id=course.id,
                    title=course.title,
                    course_status=course.course_status,
                    course_type=course.course_type,
                    course_duration=course.course_duration,
                    teacher=teacher_payload,
                )
            )

        result: list[SeasonCourseGroupOut] = []
        for group in groups.values():
            group.pop("teacher_ids", None)
            group["course_ids"].sort()
            group["courses"].sort(key=lambda item: item.course_id)
            group["teachers"].sort(key=lambda item: (item.last_name.lower(), item.first_name.lower(), item.staff_id))
            result.append(SeasonCourseGroupOut(**group))

        return sorted(result, key=lambda item: (item.title.lower(), item.group_key))

    def get_course_classes_by_season(self, season_id: int) -> list[CourseClass]:
        return self.db.query(CourseClass).filter(CourseClass.season_id == season_id).all()

    def get_attendance_by_season(self, season_id: int) -> list[Attendance]:
        return self.db.query(Attendance).filter(Attendance.season_id == season_id).all()

    def get_achievements_by_season(self, season_id: int) -> list[Achievement]:
        return self.db.query(Achievement).filter(Achievement.season_id == season_id).all()

    def get_student_achievements_by_season(self, season_id: int) -> list[StudentAchievement]:
        return self.db.query(StudentAchievement).filter(StudentAchievement.season_id == season_id).all()

    def get_student_certificates_by_season(self, season_id: int) -> list[StudentCertificate]:
        return self.db.query(StudentCertificate).filter(StudentCertificate.season_id == season_id).all()

    def get_feedbacks_by_season(self, season_id: int) -> list[Feedback]:
        return self.db.query(Feedback).filter(Feedback.season_id == season_id).all()

    def get_schedules_by_season(self, season_id: int) -> list[Schedule]:
        return self.db.query(Schedule).filter(Schedule.season_id == season_id).all()

    def get_slots_by_season(self, season_id: int) -> list[Slot]:
        return self.db.query(Slot).filter(Slot.season_id == season_id).all()

    def get_gamification_by_season(self, season_id: int) -> list[Gamification]:
        return self.db.query(Gamification).filter(Gamification.season_id == season_id).all()

    def get_gamification_levels_by_season(self, season_id: int) -> list[GamificationLevel]:
        return self.db.query(GamificationLevel).filter(GamificationLevel.season_id == season_id).all()

    def get_extracurricular_activities_by_season(self, season_id: int) -> list[ExtracurricularActivity]:
        return self.db.query(ExtracurricularActivity).filter(ExtracurricularActivity.season_id == season_id).all()

    def get_extracurricular_teams_by_season(self, season_id: int) -> list[ExtracurricularTeam]:
        return self.db.query(ExtracurricularTeam).filter(ExtracurricularTeam.season_id == season_id).all()

    def get_extracurricular_team_members_by_season(self, season_id: int) -> list[ExtracurricularTeamMember]:
        return self.db.query(ExtracurricularTeamMember).filter(ExtracurricularTeamMember.season_id == season_id).all()

    def get_extracurricular_scores_by_season(self, season_id: int) -> list[ExtracurricularScore]:
        return self.db.query(ExtracurricularScore).filter(ExtracurricularScore.season_id == season_id).all()

    def get_enrollments_by_season(self, season_id: int) -> list[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.season_id == season_id).all()
