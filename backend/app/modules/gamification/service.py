from fastapi import HTTPException

from app.modules.gamification.repository import (
    GamificationRepository,
    GamificationLevelRepository,
    ExtracurricularActivityRepository,
    ExtracurricularTeamRepository,
    ExtracurricularTeamMemberRepository,
    ExtracurricularScoreRepository,
    GamificationLevelCreate
)

class GamificationService:

    def __init__(self, repo: GamificationRepository):
        self.repo = repo

    def get(self, student_id: int):
        obj = self.repo.get_by_student_id(student_id)
        if not obj:
            raise HTTPException(404, "Gamification not found")
        return obj

    def recalc(self, student_id: int):
        self.repo.get_or_create(student_id)
        self.repo.recalculate(student_id)
        return self.repo.get_by_student_id(student_id)

    def recalc_all(self):
        self.repo.recalculate_all()
        return {"status": "ok"}

    def leaderboard(self, limit: int = 10):
        return self.repo.get_leaderboard(limit)


class GamificationLevelService:

    def __init__(self, repo: GamificationLevelRepository):
        self.repo = repo

    def create(self, data):
        return self.repo.create_gamification_level(data)

    def get_all(self):
        return self.repo.get_all_gamification_levels()



class ActivityService:

    def __init__(self, repo: ExtracurricularActivityRepository):
        self.repo = repo

    def create(self, data):
        return self.repo.create_extracurricular_activity(
            data.ex_course_name,
            data.staff_id,
            data.ex_course_score,
        )

    def get_all(self):
        return self.repo.get_all_extracurricular_activities()

    def update(self, activity_id: int, data):
        return self.repo.update_activity(activity_id, data)


class TeamService:

    def __init__(self, repo: ExtracurricularTeamRepository):
        self.repo = repo

    def create(self, data):
        return self.repo.create_team(data.ex_team_number, data.ex_team_name)

    def get_all(self):
        return self.repo.get_all()

    def delete(self, team_id: int):
        if not self.repo.delete(team_id):
            raise HTTPException(404, "Team not found")



class TeamMemberService:

    def __init__(self, repo: ExtracurricularTeamMemberRepository):
        self.repo = repo

    def add(self, data):
        return self.repo.add_member(data.team_id, data.student_id)

    def remove(self, team_id, student_id):
        if not self.repo.remove_member(team_id, student_id):
            raise HTTPException(404, "Not found")



class ScoreService:

    def __init__(self, repo: ExtracurricularScoreRepository):
        self.repo = repo

    def create(self, data):
        return self.repo.create_score(
            data.team_id,
            data.ex_course_id,
            data.ex_team_score,
        )

    def update(self, team_id, course_id, data):
        return self.repo.update_score(
            team_id,
            course_id,
            data.ex_team_score,
        )

    def get_all(self):
        return self.repo.get_all_scores()
    
    
class GamificationLevelService:

    def __init__(self, repo: GamificationLevelRepository):
        self.repo = repo

    def create(self, data: GamificationLevelCreate):
        try:
            return self.repo.create(data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def get_all(self):
        return self.repo.get_all()

    def update(self, level: int, new_score: int):
        try:
            return self.repo.update(level, new_score)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    def delete(self, level: int):
        try:
            self.repo.delete(level)
            return {"status": "deleted"}
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))