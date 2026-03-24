from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.gamification.repository import *
from app.modules.gamification.service import *
from app.modules.gamification.schemas import *

gamificationRouter = APIRouter(prefix="/gamification", tags=["gamification"])
# ------------------ DI ------------------

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


# ------------------ GAMIFICATION ------------------

@gamificationRouter.get("/gamification/{student_id}", response_model=GamificationRead)
def get_gam(student_id: int, service: GamificationService = Depends(get_gam_service)):
    return service.get(student_id)


@gamificationRouter.post("/gamification/{student_id}/recalc", response_model=GamificationRead)
def recalc(student_id: int, service: GamificationService = Depends(get_gam_service)):
    return service.recalc(student_id)


@gamificationRouter.post("/gamification/recalc-all")
def recalc_all(service: GamificationService = Depends(get_gam_service)):
    return service.recalc_all()


@gamificationRouter.get("/gamification/leaderboard", response_model=list[GamificationRead])
def leaderboard(service: GamificationService = Depends(get_gam_service)):
    return service.leaderboard()


# ------------------ ACTIVITY ------------------

@gamificationRouter.post("/activity", response_model=ExtracurricularActivityRead)
def create_activity(
    data: ExtracurricularActivityCreate,
    service: ActivityService = Depends(get_activity_service),
):
    return service.create(data)


@gamificationRouter.get("/activity", response_model=list[ExtracurricularActivityRead])
def get_activities(service: ActivityService = Depends(get_activity_service)):
    return service.get_all()


# ------------------ TEAM ------------------

@gamificationRouter.post("/team", response_model=ExtracurricularTeamRead)
def create_team(data: ExtracurricularTeamCreate, service: TeamService = Depends(get_team_service)):
    return service.create(data)


@gamificationRouter.get("/team", response_model=list[ExtracurricularTeamRead])
def get_teams(service: TeamService = Depends(get_team_service)):
    return service.get_all()


# ------------------ SCORE ------------------

@gamificationRouter.post("/score", response_model=ExtracurricularScoreRead)
def create_score(data: ExtracurricularScoreCreate, service: ScoreService = Depends(get_score_service)):
    return service.create(data)


@gamificationRouter.get("/score")
def get_scores(service: ScoreService = Depends(get_score_service)):
    return service.get_all()

# ------------------ GAMIFICATION LEVEL ------------------

@gamificationRouter.post("/level", response_model=GamificationLevelRead)
def create_level(
    data: GamificationLevelCreate,
    service: GamificationLevelService = Depends(get_level_service),
):
    return service.create(data)


@gamificationRouter.get("/level", response_model=list[GamificationLevelRead])
def get_levels(
    service: GamificationLevelService = Depends(get_level_service),
):
    return service.get_all()


@gamificationRouter.patch("/level/{level}", response_model=GamificationLevelRead)
def update_level(
    level: int,
    new_score: int,
    service: GamificationLevelService = Depends(get_level_service),
):
    return service.update(level, new_score)


@gamificationRouter.delete("/level/{level}")
def delete_level(
    level: int,
    service: GamificationLevelService = Depends(get_level_service),
):
    return service.delete(level)