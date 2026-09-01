from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.security.dependencies import get_current_user
from app.security.permissions import require_admin, require_student
from app.modules.gamification.repository import *
from app.modules.gamification.service import *
from app.modules.gamification.schemas import *

gamificationRouter = APIRouter(prefix="/gamification", tags=["gamification"])

def require_staff(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "staff":
        raise HTTPException(403, "Only staff allowed")
    return current_user


def require_student_or_staff(current_user=Depends(get_current_user)):
    if current_user["user_type"] not in ["student", "staff"]:
        raise HTTPException(403, "Access denied")
    return current_user

def get_gam_service(db: Session = Depends(get_db)):
    return GamificationService(GamificationRepository(db))


def get_activity_service(db: Session = Depends(get_db)):
    return ActivityService(ExtracurricularActivityRepository(db))


def get_team_service(db: Session = Depends(get_db)):
    return TeamService(ExtracurricularTeamRepository(db))


def get_score_service(db: Session = Depends(get_db)):
    return ScoreService(ExtracurricularScoreRepository(db))

def get_level_service(db: Session = Depends(get_db)):
    return GamificationLevelService(GamificationLevelRepository(db))

def get_team_member_service(db: Session = Depends(get_db)):
    return TeamMemberService(ExtracurricularTeamMemberRepository(db))

@gamificationRouter.get("/gamification/leaderboard", response_model=list[GamificationRead])
def leaderboard(current_user=Depends(require_staff), service: GamificationService = Depends(get_gam_service)):
    return service.leaderboard()

@gamificationRouter.get("/gamification/{student_id}", response_model=GamificationRead, summary="Get full gamification for student")
def get_gam(student_id: int, current_user=Depends(require_student_or_staff), service: GamificationService = Depends(get_gam_service)):
    return service.get(student_id)

@gamificationRouter.post("/activity")
def create_activity(
    data: ExtracurricularActivityCreate, current_user=Depends(require_staff),service: ActivityService = Depends(get_activity_service),
):
    return service.create(data)

@gamificationRouter.get("/activity", response_model=list[ExtracurricularActivityRead])
def get_activities(current_user=Depends(require_staff), service: ActivityService = Depends(get_activity_service)):
    return service.get_all()


@gamificationRouter.post("/team", response_model=ExtracurricularTeamRead)
def create_team(data: ExtracurricularTeamCreate,current_user=Depends(require_staff), service: TeamService = Depends(get_team_service)):
    return service.create(data)


@gamificationRouter.get("/team", response_model=list[ExtracurricularTeamRead])
def get_teams(current_user=Depends(require_staff), service: TeamService = Depends(get_team_service)):
    return service.get_all()


@gamificationRouter.post("/team/member", response_model=ExtracurricularTeamMemberRead)
def add_team_member(
    data: ExtracurricularTeamMemberCreate,
    current_user=Depends(require_admin),
    service: TeamMemberService = Depends(get_team_member_service)
):
    return service.add(data)


@gamificationRouter.get(
    "/team/{team_id}/members",
    response_model=list[ExtracurricularTeamMemberOut],
    summary="List team members with full names",
)
def list_team_members(
    team_id: int,
    season_id: int = 1,
    current_user=Depends(require_staff),
    service: TeamMemberService = Depends(get_team_member_service),
):
    return service.list_for_team(team_id, season_id)


@gamificationRouter.post("/score", response_model=ExtracurricularScoreRead)
def mark_ex_team_attendance(data: ExtracurricularScoreCreate, current_user=Depends(require_staff), service: ScoreService = Depends(get_score_service)):
    return service.create(data)


@gamificationRouter.get("/score")
def get_scores(current_user=Depends(require_staff), service: ScoreService = Depends(get_score_service)):
    return service.get_all()

@gamificationRouter.post("/level", response_model=GamificationLevelRead)
def create_level(data: GamificationLevelCreate, current_user=Depends(require_staff), service: GamificationLevelService = Depends(get_level_service),
):
    return service.create(data)


@gamificationRouter.get("/level", response_model=list[GamificationLevelRead])
def get_levels(current_user=Depends(require_staff), service: GamificationLevelService = Depends(get_level_service)):
    return service.get_all()

@gamificationRouter.patch("/level/{level}", response_model=GamificationLevelRead)
def update_level(level: int, new_score: int, current_user=Depends(require_staff), service: GamificationLevelService = Depends(get_level_service)):
    return service.update(level, new_score)

@gamificationRouter.delete("/level/{level}")
def delete_level(level: int, current_user=Depends(require_staff), service: GamificationLevelService = Depends(get_level_service)):
    return service.delete(level)

@gamificationRouter.get(
    "/me/extracurricular",
    response_model=StudentExtracurricularDashboardOut,
    summary="Внеучебка: рейтинг команд, моя команда и начисления",
)
def get_my_extracurricular(
    season_id: int = 1,
    current_user: dict = Depends(require_student),
    service: GamificationService = Depends(get_gam_service),
):
    student_id = current_user["user"].id
    return service.get_my_extracurricular_dashboard(student_id=student_id, season_id=season_id)


@gamificationRouter.get("/team/{student_id}")
def get_student_team(student_id: int, current_user=Depends(require_student_or_staff), service: GamificationService = Depends(get_gam_service)):
    return service.get_student_team(student_id)

@gamificationRouter.get(
    "/team/{team_id}/extracurricular-attendance",
    summary="Get team score for extracurricular attendance")
def get_team_scores(
    team_id: int,
    current_user=Depends(require_student_or_staff),
    service: ScoreService = Depends(get_score_service)
):
    return service.get_by_team(team_id)
