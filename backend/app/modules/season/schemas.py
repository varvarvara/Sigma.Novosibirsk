from datetime import date

from pydantic import BaseModel, model_validator


class SeasonCreate(BaseModel):
    season_year: int
    season_description: str | None = None
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class SeasonOutput(SeasonCreate):
    id: int

    model_config = {"from_attributes": True}


class SeasonCourseTeacherOut(BaseModel):
    staff_id: int
    first_name: str
    last_name: str
    partonymic: str | None = None


class SeasonCourseItemOut(BaseModel):
    course_id: int
    title: str
    course_status: str
    course_type: str
    course_duration: str
    teacher: SeasonCourseTeacherOut | None = None


class SeasonCourseGroupOut(BaseModel):
    group_key: str
    title: str
    course_type: str
    course_duration: str
    season_id: int
    course_ids: list[int]
    course_count: int
    active_student_count: int
    lesson_count: int
    teachers: list[SeasonCourseTeacherOut]
    courses: list[SeasonCourseItemOut]
