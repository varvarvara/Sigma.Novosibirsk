from pydantic import BaseModel, EmailStr, Field, field_validator

class GamificationSchema(BaseModel):
    id: int 
    student_id: int
    attendance_score: int = Field(ge=0)
    achievement_score: int = Field(ge=0)
    extracurricular_score: int = Field(ge=0)
    total_score: int = Field(ge=0)
    level: int = Field(ge=0)


class GamificationLevelSchema(BaseModel):
    id: int 
    gamification_level: int = Field(ge=0, le=5) #уточнить границы уровней
    gamification_level_score: int = Field(ge=0)

class ExtracurricularActivitySchema(BaseModel):
    id: int 
    ex_course_name: str =  Field (min_length=2,max_length=100)
    staff_id: int
    ex_course_score: int = Field(ge=0)  
    
class ExtracurricularActivityCreate(BaseModel):
    ex_course_name: str
    staff_id: int
    ex_course_score: int
    
class ExtracurricularActivityUpdate(BaseModel):
    ex_course_name: str | None = None
    staff_id: int | None = None
    ex_course_score: int | None = None
  
class ExtracurricularTeamSchema(BaseModel):
    id: int
    ex_team_number: int = Field(ge=1)
    ex_team_name: str = Field(min_length=1, max_length=50)

    
class ExtracurricularTeamMemberSchema(BaseModel):
    id: int
    team_id: int
    student_id: int
    
    
class ExtracurricularScoreSchema(BaseModel):
    id: int
    team_id: int
    ex_course_id: int
    ex_team_score: int = Field(ge=0)
    
