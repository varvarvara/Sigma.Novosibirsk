from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.modules.season.service import SeasonService
from app.modules.season.schemas import SeasonCreate, SeasonOutput
from app.db.session import get_db
from app.security.permissions import require_admin

seasonRouter = APIRouter(
    prefix="/season",
    tags=["Season"],
    dependencies=[Depends(require_admin)]
)

def get_service(db: Session):
    return SeasonService(db)


@seasonRouter.post("", status_code=201, response_model=SeasonOutput)
def create_season(payload: SeasonCreate, db: Session = Depends(get_db)):
    return get_service(db).create_season(payload)


@seasonRouter.get("/{season_id}/staff")
def get_staff(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_staff_by_season(season_id)


@seasonRouter.get("/{season_id}/students")
def get_students(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_students_by_season(season_id)


@seasonRouter.get("/{season_id}/pre-registrations")
def get_pre_regs(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_pre_registrations_by_season(season_id)


@seasonRouter.get("/{season_id}/teacher-certificates")
def get_teacher_certs(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_teacher_certificates_by_season(season_id)


@seasonRouter.get("/{season_id}/courses")
def get_courses(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_courses_by_season(season_id)


@seasonRouter.get("/{season_id}/course-classes")
def get_course_classes(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_course_classes_by_season(season_id)


@seasonRouter.get("/{season_id}/attendance")
def get_attendance(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_attendance_by_season(season_id)


@seasonRouter.get("/{season_id}/achievements")
def get_achievements(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_achievements_by_season(season_id)


@seasonRouter.get("/{season_id}/student-achievements")
def get_student_achievements(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_student_achievements_by_season(season_id)


@seasonRouter.get("/{season_id}/student-certificates")
def get_student_certificates(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_student_certificates_by_season(season_id)


@seasonRouter.get("/{season_id}/feedbacks")
def get_feedbacks(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_feedbacks_by_season(season_id)


@seasonRouter.get("/{season_id}/schedules")
def get_schedules(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_schedules_by_season(season_id)


@seasonRouter.get("/{season_id}/slots")
def get_slots(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_slots_by_season(season_id)


@seasonRouter.get("/{season_id}/gamification")
def get_gamification(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_gamification_by_season(season_id)


@seasonRouter.get("/{season_id}/gamification-levels")
def get_gamification_levels(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_gamification_levels_by_season(season_id)


@seasonRouter.get("/{season_id}/extracurricular-activities")
def get_extracurricular_activities(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_extracurricular_activities_by_season(season_id)


@seasonRouter.get("/{season_id}/extracurricular-teams")
def get_extracurricular_teams(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_extracurricular_teams_by_season(season_id)


@seasonRouter.get("/{season_id}/extracurricular-team-members")
def get_extracurricular_team_members(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_extracurricular_team_members_by_season(season_id)


@seasonRouter.get("/{season_id}/extracurricular-scores")
def get_extracurricular_scores(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_extracurricular_scores_by_season(season_id)


@seasonRouter.get("/{season_id}/enrollments")
def get_enrollments(season_id: int, db: Session = Depends(get_db)):
    return get_service(db).get_enrollments_by_season(season_id)

# @seasonRouter.get("/season/{season_id}/courses")
# def get_courses_by_season(season_id: int, db: Session = Depends(get_db)):
#     season_service = SeasonService(db)
#     courses = season_service.get_courses_by_season(season_id)
#     if not courses:
#         raise HTTPException(status_code=404, detail="Courses not found for this season")
#     return courses

# @seasonRouter.get("/season/{season_id}/students")
# def get_students_by_season(season_id: int, db: Session = Depends(get_db)):
#     season_service = SeasonService(db)
#     students = season_service.get_students_by_season(season_id)
#     if not students:
#         raise HTTPException(status_code=404, detail="Students not found for this season")
#     return students

# @seasonRouter.get("/season/{season_id}/attendance")
# def get_attendance_by_season(season_id: int, db: Session = Depends(get_db)):
#     season_service = SeasonService(db)
#     attendance = season_service.get_attendance_by_season(season_id)
#     if not attendance:
#         raise HTTPException(status_code=404, detail="Attendance not found for this season")
#     return attendance
