import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.modules.admin.schemas import (
    ActionMessage,
    IntakeActionOut,
    IntakeStatusOut,
    PreRegistrationApproveIn,
    StaffCreateByAdminIn,
)
from app.modules.auth.schemas import PreRegistrationOut
from app.modules.users.repository import UsersRepository
from app.modules.users.schemas import StaffOutput
from app.security.email_service import _smtp_is_configured, send_teacher_credentials_email
from app.security.hashHelper import HashHelper
from app.security.password_policy import generate_temporary_password
from app.tasks import send_teacher_credentials_email_task
from enums import PreRegistrationStatuses, StaffRoles


logger = logging.getLogger(__name__)


def _dispatch_teacher_credentials_email(*, email: str, first_name: str, password: str) -> None:
    """Queue Celery email when possible; in dev fall back to sync SMTP or log credentials."""
    if _smtp_is_configured():
        try:
            send_teacher_credentials_email_task.delay(email=email, first_name=first_name, password=password)
            return
        except Exception:
            logger.exception("Failed to enqueue teacher credentials email for %s", email)

    if settings.APP_ENV == "dev":
        try:
            send_teacher_credentials_email(to_email=email, first_name=first_name, password=password)
            return
        except Exception:
            logger.warning(
                "Teacher credentials for %s (SMTP unavailable): password=%s",
                email,
                password,
            )
            return

    logger.error("Teacher credentials email was not sent for %s: SMTP is not configured", email)


class AdminService:
    def __init__(self, session: Session):
        self._users_repository = UsersRepository(session=session)

    @staticmethod
    def _to_intake_status(control) -> IntakeStatusOut:
        return IntakeStatusOut(
            intake_closed=control.intake_closed,
            closed_at=control.closed_at,
            closed_by=control.closed_by,
        )

    def get_intake_status(self) -> IntakeStatusOut:
        control = self._users_repository.get_or_create_intake_control()
        return self._to_intake_status(control)

    def close_intake(self, current_admin_id: int) -> IntakeActionOut:
        control = self._users_repository.set_intake_closed(value=True, closed_by=current_admin_id)
        return IntakeActionOut(
            message="Intake closed. Teachers can no longer modify courses/slots.",
            status=self._to_intake_status(control),
        )

    def open_intake(self) -> IntakeActionOut:
        control = self._users_repository.set_intake_closed(value=False, closed_by=None)
        return IntakeActionOut(
            message="Intake opened. Teachers can modify courses/slots.",
            status=self._to_intake_status(control),
        )

    def list_pre_registrations(self) -> list[PreRegistrationOut]:
        records = self._users_repository.list_pre_registrations()
        return [PreRegistrationOut.model_validate(item) for item in records]

    def approve_pre_registration(
        self,
        pre_registration_id: int,
        data: PreRegistrationApproveIn | None = None,
    ) -> StaffOutput:
        pre_registration = self._users_repository.get_pre_registration_by_id(pre_registration_id=pre_registration_id)
        if pre_registration is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pre-registration not found")

        if pre_registration.pre_registration_status == PreRegistrationStatuses.APPROVED.value:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Pre-registration already approved")

        if self._users_repository.get_staff_by_email(email=pre_registration.email) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Staff with this email already exists")

        if self._users_repository.get_student_by_email(email=pre_registration.email) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Student with this email already exists")

        plain_password = data.password if data and data.password else generate_temporary_password(length=8)
        password_hash = HashHelper.get_password_hash(plain_password=plain_password)
        staff = self._users_repository.create_staff_from_pre_registration(
            pre_registration=pre_registration,
            password_hash=password_hash,
            staff_role=StaffRoles.TEACHER.value,
        )
        self._users_repository.update_pre_registration_status(
            pre_registration=pre_registration,
            new_status=PreRegistrationStatuses.APPROVED.value,
        )

        _dispatch_teacher_credentials_email(
            email=pre_registration.email,
            first_name=pre_registration.first_name,
            password=plain_password,
        )

        return StaffOutput.model_validate(staff)

    def reject_pre_registration(self, pre_registration_id: int) -> ActionMessage:
        pre_registration = self._users_repository.get_pre_registration_by_id(pre_registration_id=pre_registration_id)
        if pre_registration is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pre-registration not found")

        self._users_repository.delete_pre_registration(pre_registration=pre_registration)
        return ActionMessage(message=f"Pre-registration {pre_registration_id} rejected")

    def create_staff(self, data: StaffCreateByAdminIn) -> StaffOutput:
        if self._users_repository.user_exist_by_email(email=data.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists")

        password = HashHelper.get_password_hash(plain_password=data.password)
        staff = self._users_repository.create_staff_by_admin(data=data, password=password)
        return StaffOutput.model_validate(staff)

    def get_admin(self, admin_id: int) -> StaffOutput:
        admin = self._users_repository.get_admin_by_id(admin_id=admin_id)
        if admin is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
        return StaffOutput.model_validate(admin)

    def check_admin(self, admin_id: int) -> bool:
        return self._users_repository.is_admin_by_id(staff_id=admin_id)

    def delete_admin(self, admin_id: int, current_admin_id: int | None = None) -> ActionMessage:
        admin = self._users_repository.get_admin_by_id(admin_id=admin_id)
        if admin is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

        if current_admin_id is not None and current_admin_id == admin_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin cannot delete itself")

        admins_count = self._users_repository.count_admins()
        if admins_count <= 1:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete the last admin")

        self._users_repository.delete_staff(staff=admin)
        return ActionMessage(message=f"Admin {admin_id} deleted")
