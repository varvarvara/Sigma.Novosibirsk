import re
from datetime import date

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.modules.auth.schemas import PreRegistrationCreateIn
from app.security.password_policy import validate_password_strength
from enums import PreRegistrationStatuses, StaffRoles, StudentStatuses

LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-ЯёЁa-zA-Z\-]+$")
FULL_NAME_MATCH_PATTERN = re.compile(r"^[а-яА-ЯёЁa-zA-Z\-]+(?: [а-яА-ЯёЁa-zA-Z\-]+)*$")
PHONE_MATCH_PATTERN = re.compile(r"^\+?[0-9]{10,20}$")
BCRYPT_HASH_PATTERN = re.compile(r"^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$")


class StudentInCreate(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    phone: str | None = None
    tg_nickname: str | None = None
    birth_date: date | None = None
    year_of_study: int
    city: str | None = None
    school: str | None = None
    parent_name: str
    parent_phone: str
    password: str
    season_id: int

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

    @field_validator("parent_name")
    def validate_parent_name(cls, value):
        if not FULL_NAME_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Parent name should contain only letters, spaces and hyphens",
            )
        return value

    @field_validator("year_of_study")
    def validate_year_of_study(cls, value):
        if value is None:
            return value
        if value < 7 or value > 11:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Year of study must be between 8 and 11",
            )
        return value

    @field_validator("phone", "parent_phone")
    def validate_phone_fields(cls, value):
        if value is None:
            return value
        if not PHONE_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone has invalid format",
            )
        return value

    @field_validator("password")
    def validate_password(cls, value):
        return validate_password_strength(value)


class StudentInCreate2026(StudentInCreate):
    phone: str
    student_status: StudentStatuses

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not BCRYPT_HASH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be a valid bcrypt hash",
            )
        return value


class PreRegistrationInCreate2026(PreRegistrationCreateIn):
    pre_registration_status: PreRegistrationStatuses


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

    @field_validator("password")
    def validate_password(cls, value):
        return validate_password_strength(value)

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
    phone: str | None = None
    tg_nickname: str | None = None
    birth_date: date | None = None
    year_of_study: int
    city: str | None = None
    school: str | None = None
    parent_name: str
    parent_phone: str
    student_status: StudentStatuses
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class ProfileMeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    partonymic: str | None = None
    phone: str | None = None
    tg_nickname: str | None = None
    birth_date: date | None = None
    year_of_study: int | None = None
    city: str | None = None
    school: str | None = None
    parent_name: str | None = None
    parent_phone: str | None = None
    university: str | None = None
    study_direction: str | None = None
    study_year: int | None = None

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

    @field_validator("phone", "parent_phone")
    def validate_optional_phone_fields(cls, value):
        if value is None:
            return value
        if not PHONE_MATCH_PATTERN.fullmatch(value):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone has invalid format",
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


StaffMeUpdate = ProfileMeUpdate


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
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class AvatarUploadOut(BaseModel):
    avatar_url: str
    avatar_image_key: str
