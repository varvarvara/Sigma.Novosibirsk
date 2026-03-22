import re
from datetime import datetime

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from enums import StaffRoles


LETTER_MATCH_PATTERN = re.compile(r"^[а-яА-Яa-zA-Z\-]+$")
MIN_PASSWORD_LENGTH = 8


class PreRegistrationApproveIn(BaseModel):
    password: str
    staff_role: StaffRoles = StaffRoles.TEACHER

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Password can not contain less than {MIN_PASSWORD_LENGTH} symbols",
            )
        return value

    @field_validator("staff_role")
    def validate_staff_role(cls, value):
        if value != StaffRoles.TEACHER:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Approve flow can create only Teacher role",
            )
        return value


class StaffCreateByAdminIn(BaseModel):
    first_name: str
    last_name: str
    partonymic: str | None = None
    email: EmailStr
    password: str
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

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Password can not contain less than {MIN_PASSWORD_LENGTH} symbols",
            )
        return value


class ActionMessage(BaseModel):
    message: str


class IntakeStatusOut(BaseModel):
    intake_closed: bool
    closed_at: datetime | None = None
    closed_by: int | None = None


class IntakeActionOut(BaseModel):
    message: str
    status: IntakeStatusOut
