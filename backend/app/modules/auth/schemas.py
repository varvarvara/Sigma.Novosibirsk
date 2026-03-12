import re

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from enums import StaffRoles, StudentStatuses, PreRegistrationStatuses

LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-Яa-zA-Z\-]+$")
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


class StudentInLogin(BaseModel):
    email: EmailStr
    password: str


class StudentInUpdate(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    tg_nickname: str | None = None
    city: str | None = None
    school: str | None = None

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


class StaffInCreate(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    staff_role: StaffRoles
    password: str

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


class StaffInLogin(BaseModel):
    email: EmailStr
    password: str


class StaffInUpdate(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    staff_role: StaffRoles

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


class StaffOutput(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    staff_role: StaffRoles

    model_config = {"from_attributes": True}


class PreRegistrationInCreate(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    email: EmailStr
    tg_nickname: str | None = None
    staff_role: StaffRoles

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


class PreRegistrationInUpdateStatus(BaseModel):
    id: int
    pre_registration_status: PreRegistrationStatuses


class PreRegistrationOutput(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    email: EmailStr
    tg_nickname: str | None = None
    staff_role: StaffRoles
    pre_registration_status: PreRegistrationStatuses

    model_config = {"from_attributes": True}


class UserWithToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


