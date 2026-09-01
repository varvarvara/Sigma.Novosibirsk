import re
from datetime import date, datetime
from enum import Enum

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.security.password_policy import validate_password_strength as _validate_password_strength
from enums import PreRegistrationStatuses


LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-ЯёЁa-zA-Z\-]+$")
PHONE_MATCH_PATTERN = re.compile(r"^\+?[0-9]{10,20}$")
MAX_PROPOSED_DESCRIPTION_LENGTH = 2000


class TeacherCourseType(str, Enum):
    OLYMPIAD = "Olympiad"
    AUTHOR = "Author"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


class PasswordResetConfirmIn(BaseModel):
    token: str = Field(..., min_length=16)
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password_strength(value)


class MessageOut(BaseModel):
    message: str


class RegistrationStatusOut(BaseModel):
    intake_closed: bool


class UserWithToken(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class PreRegistrationCreateIn(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    email: EmailStr
    tg_nickname: str | None = None
    season_id: int = Field(..., gt=0)
    birth_date: date
    university: str = Field(..., min_length=2, max_length=150)
    study_direction: str = Field(..., min_length=2, max_length=150)
    study_year: int = Field(..., ge=1, le=6)
    proposed_course_title: str = Field(..., min_length=2, max_length=150)
    proposed_course_type: TeacherCourseType
    proposed_course_description: str = Field(..., min_length=1, max_length=MAX_PROPOSED_DESCRIPTION_LENGTH)

    @model_validator(mode="before")
    @classmethod
    def normalize_patronymic(cls, value):
        if isinstance(value, dict) and "partonymic" not in value and "patronymic" in value:
            value["partonymic"] = value.get("patronymic")
        return value

    @field_validator("first_name", "last_name", "partonymic")
    def validate_name_fields(cls, value):
        if value is None:
            return value
        if not LETTER_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Name fields should contain only letters",
            )
        return value

    @field_validator("phone")
    def validate_phone(cls, value):
        if not PHONE_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone has invalid format",
            )
        return value

    @field_validator("birth_date", mode="before")
    def validate_birth_date(cls, value):
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", stripped):
                try:
                    return datetime.strptime(stripped, "%d.%m.%Y").date()
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="birth_date has invalid value",
                    )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="birth_date must be in DD.MM.YYYY format",
        )


class PreRegistrationOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    email: EmailStr
    tg_nickname: str | None = None
    season_id: int
    birth_date: date
    university: str
    study_direction: str
    study_year: int
    proposed_course_title: str
    proposed_course_type: TeacherCourseType
    proposed_course_description: str
    pre_registration_status: PreRegistrationStatuses

    model_config = {"from_attributes": True}
