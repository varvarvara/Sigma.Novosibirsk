from datetime import datetime
from enum import Enum

from pydantic import BaseModel

ALLOWED_SLOT_HOURS = [9, 10, 11]

SCHEDULE_HOUR_TO_ENROLLMENT_SLOT = {10: 9, 11: 10, 12: 11}


class EnrollmentStatus(str, Enum):
    ACTIVE = "Active"
    DROPPED = "Dropped"
    COMPLETED = "Completed"


class EnrollmentInCreate(BaseModel):
    course_id: int
    season_id: int


class EnrollmentInUpdateStatus(BaseModel):
    enrollment_status: EnrollmentStatus


class Enrollment2026In(BaseModel):
    student_id: int
    course_id: int
    season_id: int
    enrollment_status: EnrollmentStatus


class MassEnrollment2026Out(BaseModel):
    created_count: int
    items: list["EnrollmentOutput"]


class EnrollmentSelectionIn(BaseModel):
    slot_hour: int
    course_id: int


class EnrollmentSubmitIn(BaseModel):
    selections: list[EnrollmentSelectionIn]


class SlotCourseOption(BaseModel):
    course_id: int
    title: str
    description: str | None = None
    syllabus_url: str | None = None
    course_type: str | None = None
    teacher_name: str | None = None
    cover_image_url: str | None = None
    capacity: int | None = None
    enrolled_count: int
    seats_left: int | None = None


class SlotOptionsItem(BaseModel):
    slot_hour: int
    courses: list[SlotCourseOption]
    preview_cover_url: str | None = None


class EnrollmentSlotOptionsOut(BaseModel):
    required_slot_hours: list[int]
    slots: list[SlotOptionsItem]


class EnrollmentOutput(BaseModel):
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime | None = None
    enrollment_status: EnrollmentStatus

    course_title: str | None = None
    course_description: str | None = None
    course_status: str | None = None
    course_duration: str | None = None
    course_type: str | None = None

    teacher_id: int | None = None
    teacher_name: str | None = None

    model_config = {"from_attributes": True}


class EnrollmentSubmitOut(BaseModel):
    message: str
    total_selected: int
    items: list[EnrollmentOutput]
