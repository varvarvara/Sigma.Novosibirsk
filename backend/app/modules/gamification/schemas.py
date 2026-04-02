from pydantic import BaseModel, Field, ConfigDict

class GamificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    attendance_score: int = Field(ge=0)
    achievement_score: int = Field(ge=0)
    extracurricular_score: int = Field(ge=0)
    total_score: int = Field(ge=0)
    level: int = Field(ge=0)

class GamificationLevelCreate(BaseModel):
    gamification_level: int = Field(ge=0)
    gamification_level_score: int = Field(ge=0)

class GamificationLevelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    gamification_level: int = Field(ge=0)
    gamification_level_score: int = Field(ge=0)

class ExtracurricularActivityCreate(BaseModel):
    ex_course_name: str = Field(min_length=2, max_length=100)
    staff_id: int
    ex_course_score: int = Field(ge=0)

class ExtracurricularActivityUpdate(BaseModel):
    ex_course_name: str | None = Field(default=None, min_length=2, max_length=100)
    staff_id: int | None = None
    ex_course_score: int | None = Field(default=None, ge=0)

class ExtracurricularActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ex_course_name: str
    staff_id: int
    ex_course_score: int = Field(ge=0)

class ExtracurricularTeamCreate(BaseModel):
    ex_team_number: int = Field(ge=1)
    ex_team_name: str = Field(min_length=1, max_length=50)

class ExtracurricularTeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ex_team_number: int
    ex_team_name: str

class ExtracurricularTeamMemberCreate(BaseModel):
    team_id: int
    student_id: int

class ExtracurricularTeamMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    student_id: int

class ExtracurricularScoreCreate(BaseModel):
    team_id: int
    ex_course_id: int

class ExtracurricularScoreUpdate(BaseModel):
    ex_team_score: int = Field(ge=0)

class ExtracurricularScoreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    ex_course_id: int
    ex_team_score: int = Field(ge=0)
      
class StudentTeamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_number: int
    team_name: str