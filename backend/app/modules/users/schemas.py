import re
from datetime import date

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from enums import StaffRoles, StudentStatuses

LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-ЯёЁa-zA-Z\-]+$")
PHONE_MATCH_PATTERN = re.compile(r"^\+?[0-9]{10,20}$")
MIN_PASSWORD_LENGTH = 8


class StudentInCreate(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    phone: str
    tg_nickname: str | None = None
    year_of_study: int
    city: str | None = None
    school: str | None = None
    parent_name: str
    parent_phone: str
    password: str
    season_id: int

    @field_validator("first_name", "last_name", "partonymic", "parent_name")
    def validate_name_fields(cls, value):
        if value is None:
            return value
        if not LETTER_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Name fields should contain only letters",
            )
        return value

    @field_validator("phone", "parent_phone")
    def validate_phone_fields(cls, value):
        if not PHONE_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone has invalid format",
            )
        return value

    @field_validator("year_of_study")
    def validate_year_of_study(cls, value):
        if value < 8 or value > 11:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Year of study must be between 8 and 11",
            )
        return value

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Password can not contain less than {MIN_PASSWORD_LENGTH} symbols",
            )
        return value


class StaffInCreate(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    staff_role: StaffRoles
    password: str
    season_id: int
    birth_date: date | None = None
    university: str | None = None
    study_direction: str | None = None
    study_year: int | None = None

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

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Password can not contain less than {MIN_PASSWORD_LENGTH} symbols",
            )
        return value

    @field_validator("study_year")
    def validate_study_year(cls, value):
        if value is None:
            return value
        if value < 1 or value > 6:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="study_year must be between 1 and 6",
            )
        return value


class StudentOutput(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    phone: str
    tg_nickname: str | None = None
    year_of_study: int
    city: str | None = None
    school: str | None = None
    parent_name: str
    parent_phone: str
    student_status: StudentStatuses

    model_config = {"from_attributes": True}


class StaffOutput(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    staff_role: StaffRoles
    birth_date: date | None = None
    university: str | None = None
    study_direction: str | None = None
    study_year: int | None = None

    model_config = {"from_attributes": True}
