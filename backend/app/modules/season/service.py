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
from app.modules.scheduling.models import Schedule, Slot
from app.modules.users.models import Student, Staff, PreRegistration, TeacherCertificate
from app.modules.season.models import Season

class SeasonService:
    def __init__(self, db: Session):
        self.db = db

    def get_season_by_id(self, season_id: int) -> Season | None:
        return self.db.query(Season).filter(Season.id == season_id).first()

    def get_staff_by_season(self, season_id: int) -> list[Staff]:
        return self.db.query(Staff).filter(Staff.season_id == season_id).all()

    def get_students_by_season(self, season_id: int) -> list[Student]:
        return self.db.query(Student).filter(Student.season_id == season_id).all()

    def get_pre_registrations_by_season(self, season_id: int) -> list[PreRegistration]:
        return self.db.query(PreRegistration).filter(PreRegistration.season_id == season_id).all()

    def get_teacher_certificates_by_season(self, season_id: int) -> list[TeacherCertificate]:
        return self.db.query(TeacherCertificate).filter(TeacherCertificate.season_id == season_id).all()

    def get_courses_by_season(self, season_id: int) -> list[Course]:
        return self.db.query(Course).filter(Course.season_id == season_id).all()

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
    
    