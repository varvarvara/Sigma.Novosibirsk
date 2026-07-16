import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.modules.auth.schemas import (
    LoginRequest,
    MessageOut,
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
    PreRegistrationCreateIn,
    PreRegistrationOut,
    UserWithToken,
)
from app.modules.users.repository import UsersRepository
from app.security.authHandler import AuthHandler
from app.security.email_service import _smtp_is_configured, send_password_reset_email
from app.security.hashHelper import HashHelper
from app.security.rate_limit import is_password_reset_limited, mark_password_reset_sent
from app.tasks import send_password_reset_email_task
from enums import PreRegistrationStatuses

logger = logging.getLogger(__name__)

PASSWORD_RESET_REQUEST_MESSAGE = (
    "Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля."
)


class AuthService:
    def __init__(self, session: Session):
        self._users_repository = UsersRepository(session=session)

    @staticmethod
    def _credentials_exception(detail: str = "Incorrect email or password") -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    @staticmethod
    def _issue_tokens(
        user_id: int,
        user_type: str,
        staff_role: str | None = None,
        *,
        remember_me: bool = False,
    ) -> UserWithToken:
        access_token = AuthHandler.sign_jwt(
            user_id=user_id,
            user_type=user_type,
            staff_role=staff_role,
        )
        refresh_token = AuthHandler.create_refresh_token(
            user_id=user_id,
            user_type=user_type,
            staff_role=staff_role,
            remember_me=remember_me,
        )
        return UserWithToken(access_token=access_token, refresh_token=refresh_token)

    def login(self, login_details: LoginRequest) -> UserWithToken:
        student = self._users_repository.get_student_by_email(email=login_details.email)
        if student is not None:
            if not HashHelper.verify_password(
                plain_password=login_details.password,
                hashed_password=student.password,
            ):
                raise self._credentials_exception()
            return self._issue_tokens(
                user_id=student.id,
                user_type="student",
                remember_me=login_details.remember_me,
            )

        staff = self._users_repository.get_staff_by_email(email=login_details.email)
        if staff is not None:
            if not HashHelper.verify_password(
                plain_password=login_details.password,
                hashed_password=staff.password,
            ):
                raise self._credentials_exception()

            role_value = staff.staff_role.value if hasattr(staff.staff_role, "value") else staff.staff_role
            return self._issue_tokens(
                user_id=staff.id,
                user_type="staff",
                staff_role=role_value,
                remember_me=login_details.remember_me,
            )

        pre_registration = self._users_repository.get_pre_registration_by_email(email=login_details.email)
        if pre_registration is not None:
            status_value = (
                pre_registration.pre_registration_status.value
                if hasattr(pre_registration.pre_registration_status, "value")
                else pre_registration.pre_registration_status
            )
            if status_value == PreRegistrationStatuses.PENDING_APPROVAL.value:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Заявка преподавателя еще не одобрена администратором",
                )

        raise self._credentials_exception(detail="Пожалуйста, создайте аккаунт")

    def refresh_tokens(self, refresh_token: str) -> UserWithToken:
        try:
            token_data = AuthHandler.validate_refresh_token(refresh_token)
        except ValueError as error:
            raise self._credentials_exception(detail=str(error))

        AuthHandler.revoke_refresh_token(refresh_token)

        return self._issue_tokens(
            user_id=int(token_data["user_id"]),
            user_type=token_data["user_type"],
            staff_role=token_data.get("staff_role"),
            remember_me=bool(token_data.get("remember_me")),
        )

    def logout(self, refresh_token: str | None = None, access_token: str | None = None) -> None:
        if refresh_token:
            AuthHandler.revoke_refresh_token(refresh_token)
        if access_token:
            AuthHandler.revoke_access_token(access_token)

    def staff_pre_registration(self, data: PreRegistrationCreateIn) -> PreRegistrationOut:
        if self._users_repository.user_exist_by_email(email=data.email):
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

        pre_registration = self._users_repository.create_pre_registration(data=data)
        return PreRegistrationOut.model_validate(pre_registration)

    def _build_password_reset_url(self, reset_token: str) -> str:
        base_url = settings.FRONTEND_APP_URL.rstrip("/")
        return f"{base_url}/password-reset?token={reset_token}"

    def _dispatch_password_reset_email(self, email: str, reset_url: str) -> None:
        if _smtp_is_configured():
            try:
                send_password_reset_email_task.delay(email=email, reset_url=reset_url)
                return
            except Exception:
                logger.exception("Failed to enqueue password reset email for %s", email)

        if settings.APP_ENV == "dev":
            try:
                send_password_reset_email(to_email=email, reset_url=reset_url)
                return
            except Exception:
                logger.warning(
                    "Password reset link for %s (SMTP unavailable): %s",
                    email,
                    reset_url,
                )
                return

        logger.error("Password reset email was not sent for %s: SMTP is not configured", email)

    def request_password_reset(self, body: PasswordResetRequestIn, client_ip: str | None = None) -> MessageOut:
        email = str(body.email).strip()
        if is_password_reset_limited(email=email, client_ip=client_ip):
            return MessageOut(message=PASSWORD_RESET_REQUEST_MESSAGE)

        student = self._users_repository.get_student_by_email(email=email)
        staff = None if student is not None else self._users_repository.get_staff_by_email(email=email)

        if student is not None:
            reset_token = AuthHandler.create_password_reset_token(
                user_id=student.id,
                user_type="student",
                email=email,
            )
            self._dispatch_password_reset_email(email=email, reset_url=self._build_password_reset_url(reset_token))
            mark_password_reset_sent(email=email)
        elif staff is not None:
            reset_token = AuthHandler.create_password_reset_token(
                user_id=staff.id,
                user_type="staff",
                email=email,
            )
            self._dispatch_password_reset_email(email=email, reset_url=self._build_password_reset_url(reset_token))
            mark_password_reset_sent(email=email)

        return MessageOut(message=PASSWORD_RESET_REQUEST_MESSAGE)

    def confirm_password_reset(self, body: PasswordResetConfirmIn) -> MessageOut:
        try:
            token_data = AuthHandler.validate_password_reset_token(body.token)
        except ValueError as error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

        password_hash = HashHelper.get_password_hash(plain_password=body.password)
        user_id = int(token_data["user_id"])
        user_type = str(token_data["user_type"])

        if user_type == "student":
            self._users_repository.update_student_password(student_id=user_id, password_hash=password_hash)
        elif user_type == "staff":
            self._users_repository.update_staff_password(staff_id=user_id, password_hash=password_hash)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Некорректный тип пользователя.")

        AuthHandler.revoke_password_reset_token(body.token)
        return MessageOut(message="Пароль успешно изменён.")
