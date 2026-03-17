from enum import Enum
from pydantic import BaseModel, HttpUrl

class CourseStatus(str, Enum):
    DRAFT = "Draft"
    ARCHIVED = "Archived"
    PUBLISHED = "Published"

class CourseCreate(BaseModel):
    title: str
    description: str
    syllabus_url: HttpUrl
    course_status: CourseStatus = CourseStatus.DRAFT
    staff_id: int | None = None  # only admin can set explicitly

class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    syllabus_url: HttpUrl | None = None
    course_status: CourseStatus | None = None

class CourseOutput(BaseModel):
    id: int
    title: str
    description: str | None = None
    syllabus_url: str | None = None
    course_status: CourseStatus
    staff_id: int
    teacher_name: str | None = None

    model_config = {"from_attributes": True}