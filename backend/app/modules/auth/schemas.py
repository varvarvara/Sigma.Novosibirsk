import re

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from enums import PreRegistrationStatuses


LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-Яa-zA-Z\-]+$")
PHONE_MATCH_PATTERN = re.compile(r"^\+?[0-9]{10,20}$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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


class PreRegistrationOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    partonymic: str | None = None
    phone: str
    email: EmailStr
    tg_nickname: str | None = None
    pre_registration_status: PreRegistrationStatuses

    model_config = {"from_attributes": True}
