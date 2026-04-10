from datetime import date, time
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl, field_validator


ALLOWED_SLOT_HOURS = {9, 10, 11, 12}


class CourseStatus(str, Enum):
    DRAFT = "Draft"
    ARCHIVED = "Archived"
    PUBLISHED = "Published"


class CourseType(str, Enum):
    THREE_DAYS = "ThreeDays"
    SIX_DAYS = "SixDays"


class CourseCreate(BaseModel):
    title: str
    description: str
    syllabus_url: HttpUrl
    course_status: CourseStatus = CourseStatus.DRAFT
    course_type: CourseType = CourseType.THREE_DAYS
    staff_id: int | None = None  # only admin can set explicitly
    capacity: int | None = Field(default=None, ge=1)
    season_id: int = Field(gt=0)


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    syllabus_url: HttpUrl | None = None
    course_status: CourseStatus | None = None
    course_type: CourseType | None = None
    capacity: int | None = Field(default=None, ge=1)


class CourseOutput(BaseModel):
    id: int
    title: str
    description: str | None = None
    syllabus_url: str | None = None
    course_status: CourseStatus
    course_type: CourseType
    staff_id: int
    teacher_name: str | None = None
    capacity: int | None = None

    model_config = {"from_attributes": True}


class CourseSlotIn(BaseModel):
    slot_date: date
    slot_hour: int

    @field_validator("slot_hour")
    @classmethod
    def validate_slot_hour(cls, value: int):
        if value not in ALLOWED_SLOT_HOURS:
            raise ValueError("Allowed slot start hours: 9, 10, 11, 12")
        return value


class CourseSlotsSetIn(BaseModel):
    slots: list[CourseSlotIn]

    @field_validator("slots")
    @classmethod
    def validate_slots(cls, value: list[CourseSlotIn]):
        if not value:
            raise ValueError("At least one slot is required")
        return value


class CourseSlotOut(BaseModel):
    slot_id: int
    slot_date: date
    slot_time: time
    is_booked: bool


class CourseSlotsSetOut(BaseModel):
    course_id: int
    staff_id: int
    created: int
    total_slots: int
    items: list[CourseSlotOut]
