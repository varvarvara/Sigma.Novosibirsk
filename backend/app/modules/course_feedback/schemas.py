from datetime import datetime
from pydantic import BaseModel, Field

class CourseFeedbackCreateIn(BaseModel):
    course_id: int
    rating: int = Field(..., ge=1, le=10)
    comment: str = Field(..., min_length=5, max_length=2000)
    season_id: int = Field(..., gt=0)

class CourseFeedbackOut(BaseModel):
    id: int
    course_id: int
    student_id: int
    rating: float
    comment: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}

class CourseFeedbackWithAuthorOut(CourseFeedbackOut):
    student_first_name: str | None = None
    student_last_name: str | None = None
    student_email: str | None = None
    course_title: str | None = None

class FeedbackWindowStatusOut(BaseModel):
    feedback_open: bool
    opened_at: datetime | None = None
    opened_by: int | None = None
    closed_at: datetime | None = None
    closed_by: int | None = None

class FeedbackWindowActionOut(BaseModel):
    message: str
    status: FeedbackWindowStatusOut
