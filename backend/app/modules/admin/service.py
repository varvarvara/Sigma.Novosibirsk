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
    StudentPasswordSetupSendIn,
    StudentPasswordSetupSendOut,
)
from app.modules.auth.schemas import PreRegistrationOut
from app.modules.users.repository import UsersRepository
from app.modules.users.schemas import StaffOutput
from app.security.authHandler import AuthHandler
from app.security.email_service import (
    _smtp_is_configured,
    send_student_password_setup_email,
    send_teacher_password_setup_email,
)
from app.security.hashHelper import HashHelper
from app.security.password_policy import generate_temporary_password
from app.tasks import send_student_password_setup_email_task, send_teacher_password_setup_email_task
from enums import PreRegistrationStatuses, StaffRoles


logger = logging.getLogger(__name__)


def _build_teacher_password_setup_url(reset_token: str) -> str:
    base_url = settings.FRONTEND_APP_URL.rstrip("/")
    return f"{base_url}/password-reset?token={reset_token}&mode=setup"


def _build_student_password_setup_url(reset_token: str) -> str:
    base_url = settings.FRONTEND_APP_URL.rstrip("/")
    return f"{base_url}/password-reset?token={reset_token}&mode=setup"


def _dispatch_teacher_password_setup_email(*, email: str, first_name: str, setup_url: str) -> None:
    """Queue Celery email when possible; in dev fall back to sync SMTP or log the setup link."""
    if _smtp_is_configured():
        try:
            send_teacher_password_setup_email_task.delay(email=email, first_name=first_name, setup_url=setup_url)
            return
        except Exception:
            logger.exception("Failed to enqueue teacher password setup email for %s", email)

    if settings.APP_ENV == "dev":
        try:
            send_teacher_password_setup_email(to_email=email, first_name=first_name, setup_url=setup_url)
            return
        except Exception:
            logger.warning(
                "Teacher password setup link for %s (SMTP unavailable): %s",
                email,
                setup_url,
            )
            return

    logger.error("Teacher password setup email was not sent for %s: SMTP is not configured", email)


def _dispatch_student_password_setup_email(*, email: str, first_name: str, setup_url: str) -> None:
    """Queue Celery email when possible; in dev fall back to sync SMTP or log the setup link."""
    if _smtp_is_configured():
        try:
            send_student_password_setup_email_task.delay(email=email, first_name=first_name, setup_url=setup_url)
            return
        except Exception:
            logger.exception("Failed to enqueue student password setup email for %s", email)

    if settings.APP_ENV == "dev":
        try:
            send_student_password_setup_email(to_email=email, first_name=first_name, setup_url=setup_url)
            return
        except Exception:
            logger.warning(
                "Student password setup link for %s (SMTP unavailable): %s",
                email,
                setup_url,
            )
            return

    logger.error("Student password setup email was not sent for %s: SMTP is not configured", email)


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

        # The approval body is kept for API compatibility; teachers now set their own password by email link.
        _ = data
        technical_password = generate_temporary_password(length=32)
        password_hash = HashHelper.get_password_hash(plain_password=technical_password)
        staff = self._users_repository.create_staff_from_pre_registration(
            pre_registration=pre_registration,
            password_hash=password_hash,
            staff_role=StaffRoles.TEACHER.value,
        )
        self._users_repository.update_pre_registration_status(
            pre_registration=pre_registration,
            new_status=PreRegistrationStatuses.APPROVED.value,
        )

        reset_token = AuthHandler.create_password_reset_token(
            user_id=staff.id,
            user_type="staff",
            email=staff.email,
        )
        _dispatch_teacher_password_setup_email(
            email=pre_registration.email,
            first_name=pre_registration.first_name,
            setup_url=_build_teacher_password_setup_url(reset_token),
        )

        return StaffOutput.model_validate(staff)

    def mass_approve_pre_registrations_2026(
        self,
        pre_registration_ids: list[int],
    ) -> list[StaffOutput]:
        if not pre_registration_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID list cannot be empty")

        duplicate_ids = sorted(
            item_id
            for item_id in set(pre_registration_ids)
            if pre_registration_ids.count(item_id) > 1
        )
        if duplicate_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate pre-registration IDs: {duplicate_ids}",
            )

        records = self._users_repository.get_pre_registrations_by_ids(
            pre_registration_ids=pre_registration_ids,
        )
        records_by_id = {record.id: record for record in records}
        missing_ids = [item_id for item_id in pre_registration_ids if item_id not in records_by_id]
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pre-registrations not found: {missing_ids}",
            )

        ordered_records = [records_by_id[item_id] for item_id in pre_registration_ids]
        approved_ids = [
            record.id
            for record in ordered_records
            if record.pre_registration_status == PreRegistrationStatuses.APPROVED.value
        ]
        if approved_ids:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Pre-registrations already approved: {approved_ids}",
            )

        conflicting_emails = [
            record.email
            for record in ordered_records
            if self._users_repository.get_staff_by_email(email=record.email) is not None
            or self._users_repository.get_student_by_email(email=record.email) is not None
        ]
        if conflicting_emails:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Users with these emails already exist: {conflicting_emails}",
            )

        items = []
        for record in ordered_records:
            technical_password = generate_temporary_password(length=32)
            items.append((record, HashHelper.get_password_hash(plain_password=technical_password)))

        staff_members = self._users_repository.create_staff_from_pre_registrations(
            items=items,
            staff_role=StaffRoles.TEACHER.value,
        )

        for record, staff in zip(ordered_records, staff_members):
            reset_token = AuthHandler.create_password_reset_token(
                user_id=staff.id,
                user_type="staff",
                email=staff.email,
            )
            _dispatch_teacher_password_setup_email(
                email=record.email,
                first_name=record.first_name,
                setup_url=_build_teacher_password_setup_url(reset_token),
            )

        return [StaffOutput.model_validate(staff) for staff in staff_members]

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

    def send_student_password_setup_emails(self, data: StudentPasswordSetupSendIn) -> StudentPasswordSetupSendOut:
        students = self._users_repository.list_students_for_password_setup(
            emails=[str(email) for email in data.emails] if data.emails else None,
        )

        sent = 0
        for student in students:
            technical_password = generate_temporary_password(length=32)
            password_hash = HashHelper.get_password_hash(plain_password=technical_password)
            self._users_repository.update_student_password(student_id=student.id, password_hash=password_hash)

            reset_token = AuthHandler.create_password_reset_token(
                user_id=student.id,
                user_type="student",
                email=student.email,
            )
            _dispatch_student_password_setup_email(
                email=student.email,
                first_name=student.first_name,
                setup_url=_build_student_password_setup_url(reset_token),
            )
            sent += 1

        return StudentPasswordSetupSendOut(
            matched=len(students),
            sent=sent,
            message=f"Отправлено писем для задания пароля: {sent}.",
        )

    def send_student_password_setup_email(self, student_id: int) -> StudentPasswordSetupSendOut:
        student = self._users_repository.get_student_by_id(user_id=student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        technical_password = generate_temporary_password(length=32)
        password_hash = HashHelper.get_password_hash(plain_password=technical_password)
        self._users_repository.update_student_password(student_id=student.id, password_hash=password_hash)

        reset_token = AuthHandler.create_password_reset_token(
            user_id=student.id,
            user_type="student",
            email=student.email,
        )
        _dispatch_student_password_setup_email(
            email=student.email,
            first_name=student.first_name,
            setup_url=_build_student_password_setup_url(reset_token),
        )

        return StudentPasswordSetupSendOut(
            matched=1,
            sent=1,
            message=f"Письмо для задания пароля отправлено ученику {student.email}.",
        )

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
