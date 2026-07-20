from datetime import date, time
from enum import Enum

from pydantic import BaseModel, Field, field_validator


ALLOWED_SLOT_HOURS = {10, 11, 12}


class SlotCreate2026In(BaseModel):
    staff_id: int = Field(gt=0)
    slot_date: date
    slot_time: time
    season_id: int = Field(gt=0)


class Slot2026Out(SlotCreate2026In):
    id: int

    model_config = {"from_attributes": True}


class ScheduleCreate2026In(BaseModel):
    staff_id: int = Field(gt=0)
    course_class_id: int = Field(gt=0)
    lesson_date: date
    lesson_time: time
    season_id: int = Field(gt=0)


class Schedule2026Out(ScheduleCreate2026In):
    id: int
    slot_id: int

    model_config = {"from_attributes": True}


class CourseClassCreate2026In(BaseModel):
    course_id: int = Field(gt=0)
    class_number: int = Field(gt=0)
    class_description: str = Field(min_length=1, max_length=200)
    season_id: int = Field(gt=0)


class CourseClass2026Out(CourseClassCreate2026In):
    id: int

    model_config = {"from_attributes": True}


class Weekday(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class CourseScheduleGenerateIn(BaseModel):
    start_date: date
    weekdays: list[Weekday]
    preferred_slots: list[int] = [10, 11, 12]

    @field_validator("weekdays")
    @classmethod
    def validate_weekdays(cls, value: list[Weekday]):
        if not value:
            raise ValueError("At least one weekday is required")
        if len(set(value)) != len(value):
            raise ValueError("Weekdays must be unique")
        return value

    @field_validator("preferred_slots")
    @classmethod
    def validate_preferred_slots(cls, value: list[int]):
        if not value:
            raise ValueError("At least one preferred slot is required")

        unique_values = sorted(set(value))
        invalid = [item for item in unique_values if item not in ALLOWED_SLOT_HOURS]
        if invalid:
            raise ValueError("Allowed slot start hours: 10, 11, 12")

        return unique_values


class GenerateFromAvailabilityIn(BaseModel):
    start_date: date | None = None


class GeneratedScheduleItem(BaseModel):
    schedule_id: int
    class_number: int
    lesson_date: date
    lesson_time: time
    classroom: str | None = None
    slot_id: int | None = None


class CourseScheduleGenerateOut(BaseModel):
    course_id: int
    required_lessons: int
    existing_lessons: int
    generated_lessons: int
    items: list[GeneratedScheduleItem]
    message: str


class GlobalScheduleGenerateIn(BaseModel):
    start_date: date | None = None


class GlobalCourseBuildResult(BaseModel):
    course_id: int
    course_title: str
    staff_id: int
    required_lessons: int
    existing_lessons: int
    generated_lessons: int
    conflict_overrides: int = 0
    total_lessons: int
    status: str
    message: str


class GlobalScheduleGenerateOut(BaseModel):
    start_date: date
    total_courses: int
    generated_lessons_total: int
    courses_with_conflict_overrides: int = 0
    courses: list[GlobalCourseBuildResult]


class TimetableItemOut(BaseModel):
    schedule_id: int
    course_id: int
    course_title: str
    class_number: int
    staff_id: int
    teacher_name: str
    lesson_date: date
    lesson_time: time
    classroom: str | None = None
    slot_id: int | None = None
