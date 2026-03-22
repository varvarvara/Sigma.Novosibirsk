from sqlalchemy import Session, desc, text
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from app.modules.gamification.models import Gamification, GamificationLevel, ExtracurricularActivity, ExtracurricularTeam, ExtracurricularTeamMember, ExtracurricularScore
from app.modules.gamification.schemas import GamificationSchema, GamificationLevelSchema, ExtracurricularActivitySchema, ExtracurricularTeamSchema, ExtracurricularTeamMemberSchema, ExtracurricularScoreSchema, ExtracurricularActivityUpdate

class GamificationRepository:

    def __init__(self, session: Session):
        self.session = session

    def get_by_student_id(self, student_id: int) -> Optional[Gamification]:
        return (
            self.session.query(Gamification)
            .filter(Gamification.student_id == student_id)
            .first()
        )

    def create(self, student_id: int) -> Gamification:
        obj = Gamification(student_id=student_id)
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def get_or_create(self, student_id: int) -> Gamification:
        obj = self.get_by_student_id(student_id)
        if not obj:
            obj = self.create(student_id)
        return obj

    def recalculate(self, student_id: int) -> None:
        self.session.execute(
            text("SELECT recalc_gamification(:student_id)"),
            {"student_id": student_id}
        )
        self.session.commit()
        
    def recalculate_all(self):
        self.session.execute(
            text("SELECT recalc_gamification_all()")
        )
        self.session.commit()

    def recalculate_and_get(self, student_id: int) -> Gamification:
        self.recalculate(student_id)
        return self.get_by_student_id(student_id)

    def get_leaderboard(self, limit: int = 10) -> List[Gamification]:
        return (
            self.session.query(Gamification)
            .order_by(desc(Gamification.total_score))
            .limit(limit)
            .all()
        )

    def delete(self, student_id: int) -> None:
        obj = self.get_by_student_id(student_id)
        if obj:
            self.session.delete(obj)
            self.session.commit()
            
class GamificationLevelRepository():
    def __init__(self, session: Session):
        self.session = session
        
    def create_gamification_level(self, new_gamification_level: GamificationLevelSchema) -> GamificationLevel:
        existing_level = self.session.query(GamificationLevel).filter_by(gamification_level=new_gamification_level.gamification_level).first()
        if existing_level:
            raise ValueError(f"Уровень {new_gamification_level.gamification_level} уже существует.")
        
        gamification_level = GamificationLevel(**new_gamification_level.model_dump())
        self.session.add(gamification_level)
        self.session.commit()
        self.session.refresh(gamification_level)
        return gamification_level
    
    def get_all_gamification_levels(self) -> list[GamificationLevel]:
        return self.session.query(GamificationLevel).all()
    
    def get_gamification_level_score_by_level(self, level: int) -> int:
        gamification_level = self.session.query(GamificationLevel).filter_by(gamification_level=level).first()
        if not gamification_level:
            raise ValueError(f"Уровень {level} не найден.")
        return gamification_level.gamification_level_score
    
    def update_gamification_level_score(self, level: int, new_score: int) -> GamificationLevel:
        gamification_level = self.session.query(GamificationLevel).filter_by(gamification_level=level).first()
        if not gamification_level:
            raise ValueError(f"Уровень {level} не найден.")
        
        gamification_level.gamification_level_score = new_score
        self.session.commit()
        self.session.refresh(gamification_level)
        return gamification_level
    
class ExtracurricularActivityRepository():
    def __init__(self, session: Session):
        self.session = session

    def create_extracurricular_activity(self, name: str, staff_id: int, score: int) -> ExtracurricularActivity:

        if score < 0:
            raise ValueError("Score не может быть отрицательным")

        activity = ExtracurricularActivity(
            ex_course_name=name,
            staff_id=staff_id,
            ex_course_score=score
        )

        self.session.add(activity)

        try:
            self.session.commit()
            self.session.refresh(activity)
            return activity

        except IntegrityError:
            self.session.rollback()
            raise ValueError("Ошибка при создании активности (возможно дубликат)")
        
    
    def get_all_extracurricular_activities(self) -> list[ExtracurricularActivity]:
        return self.session.query(ExtracurricularActivity).all()
    
    def get_all_extracurricular_activities_by_staff_id(self, staff_id: int) -> list[ExtracurricularActivity]:
        return self.session.query(ExtracurricularActivity).filter_by(staff_id=staff_id).all()
    
    def get_all_ex_act_with_scores(self):
           return (self.session.query(ExtracurricularActivity.ex_course_name, ExtracurricularActivity.ex_course_score)
        .all()
    )
           
    def change_extracurricular_score(self, ex_course_name: str, new_score: int) -> ExtracurricularActivity:
        activity = (
            self.session.query(ExtracurricularActivity)
            .filter(ExtracurricularActivity.ex_course_name == ex_course_name)
            .first()
        )

        if not activity:
            raise ValueError(f"Внеучебная активность '{ex_course_name}' не найдена")
        activity.ex_course_score = new_score

        self.session.commit()
        self.session.refresh(activity)

        return activity
    
    def update_activity(self, activity_id: int, update_data: ExtracurricularActivityUpdate) -> ExtracurricularActivity:
        activity = (self.session.query(ExtracurricularActivity).filter(ExtracurricularActivity.id == activity_id)
            .first()
        )

        if not activity:
            raise ValueError(f"Активность с id={activity_id} не найдена")

        data = update_data.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(activity, field, value)

        self.session.commit()
        self.session.refresh(activity)

        return activity


class ExtracurricularTeamRepository():

    def __init__(self, session: Session):
        self.session = session

    def create_team(self, team_number: int, team_name: str) -> ExtracurricularTeam:
        team = ExtracurricularTeam(
            ex_team_number=team_number,
            ex_team_name=team_name
        )

        self.session.add(team)

        try:
            self.session.commit()
            self.session.refresh(team)
            return team
        except IntegrityError:
            self.session.rollback()
            raise ValueError("Команда с таким номером уже существует")

    def get_all(self):
        return self.session.query(ExtracurricularTeam).all()

    def get_by_id(self, team_id: int):
        return self.session.query(ExtracurricularTeam).filter_by(id=team_id).first()

    def get_by_number(self, team_number: int):
        return (
            self.session.query(ExtracurricularTeam)
            .filter_by(ex_team_number=team_number)
            .first()
        )

    def delete(self, team_id: int):
        team = self.get_by_id(team_id)

        if not team:
            return False

        self.session.delete(team)
        self.session.commit()
        return True      
    
class ExtracurricularTeamMemberRepository():

    def __init__(self, session: Session):
        self.session = session

    def add_member(self, team_id: int, student_id: int):
        member = ExtracurricularTeamMember(
            team_id=team_id,
            student_id=student_id
        )

        self.session.add(member)

        try:
            self.session.commit()
            self.session.refresh(member)
            return member
        except IntegrityError:
            self.session.rollback()
            raise ValueError("Студент уже в этой команде")

    def get_by_team(self, team_id: int):
        return (
            self.session.query(ExtracurricularTeamMember)
            .filter_by(team_id=team_id)
            .all()
        )

    def get_by_student(self, student_id: int):
        return (
            self.session.query(ExtracurricularTeamMember)
            .filter_by(student_id=student_id)
            .all()
        )

    def remove_member(self, team_id: int, student_id: int):
        member = (
            self.session.query(ExtracurricularTeamMember)
            .filter(
                ExtracurricularTeamMember.team_id == team_id,
                ExtracurricularTeamMember.student_id == student_id
            )
            .first()
        )

        if not member:
            return False

        self.session.delete(member)
        self.session.commit()
        return True


class ExtracurricularScoreRepository():

    def __init__(self, session: Session):
        self.session = session

    def create_score(self, team_id: int, ex_course_id: int, score: int):
        obj = ExtracurricularScore(
            team_id=team_id,
            ex_course_id=ex_course_id,
            ex_team_score=score
        )

        self.session.add(obj)

        try:
            self.session.commit()
            self.session.refresh(obj)
            return obj
        except IntegrityError:
            self.session.rollback()
            raise ValueError("Score уже существует для этой команды и активности")

    def update_score(self, team_id: int, ex_course_id: int, new_score: int):
        obj = (
            self.session.query(ExtracurricularScore)
            .filter(
                ExtracurricularScore.team_id == team_id,
                ExtracurricularScore.ex_course_id == ex_course_id
            )
            .first()
        )

        if not obj:
            raise ValueError("Score не найден")

        obj.ex_team_score = new_score

        self.session.commit()
        self.session.refresh(obj)
        return obj

    def get_by_team(self, team_id: int):
        return (
            self.session.query(ExtracurricularScore)
            .filter_by(team_id=team_id)
            .all()
        )

    def get_by_activity(self, ex_course_id: int):
        return (
            self.session.query(ExtracurricularScore)
            .filter_by(ex_course_id=ex_course_id)
            .all()
        )
        
    def get_all_scores(self):
        results = (
        self.session.query(
            ExtracurricularScore.team_id,
            ExtracurricularScore.ex_course_id,
            ExtracurricularScore.ex_team_score
        )
        .all())

        return [
            {
            "team_id": r.team_id,
            "ex_course_id": r.ex_course_id,
            "score": r.ex_team_score
            }
            for r in results
        ]