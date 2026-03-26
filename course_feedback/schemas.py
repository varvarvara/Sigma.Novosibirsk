from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    course_id: int
    rating: float = Field(..., ge=1.0, le=10.0)
    comment: Optional[str] = Field(None, min_length=5, max_length=1000)


class ReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1.0, le=10.0)
    comment: Optional[str] = Field(None, min_length=5, max_length=1000)


class ReviewOutput(BaseModel):
    id: int
    course_id: int
    student_id: int
    rating: float
    comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReviewModerationOutput(ReviewOutput):
    student_name: Optional[str] = None
    course_title: Optional[str] = None