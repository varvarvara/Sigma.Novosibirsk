import re
from datetime import datetime

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.security.password_policy import validate_password_strength
from enums import StaffRoles


LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-ЯёЁa-zA-Z\-]+$")


class PreRegistrationApproveIn(BaseModel):
    password: str | None = None

    @field_validator("password")
    def validate_password(cls, value):
        if value is None:
            return value
        return validate_password_strength(value)


class StaffCreateByAdminIn(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    password: str
    staff_role: StaffRoles
    season_id: int = Field(default=1, gt=0)

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


class ActionMessage(BaseModel):
    message: str


class IntakeStatusOut(BaseModel):
    intake_closed: bool
    closed_at: datetime | None = None
    closed_by: int | None = None


class IntakeActionOut(BaseModel):
    message: str
    status: IntakeStatusOut
