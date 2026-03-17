from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.auth.schemas import LoginRequest, UserWithToken
from app.modules.users.repository import UsersRepository
from app.security.authHandler import AuthHandler
from app.security.hashHelper import HashHelper


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
    def _issue_tokens(user_id: int, user_type: str, staff_role: str | None = None) -> UserWithToken:
        access_token = AuthHandler.sign_jwt(
            user_id=user_id,
            user_type=user_type,
            staff_role=staff_role,
        )
        refresh_token = AuthHandler.create_refresh_token(
            user_id=user_id,
            user_type=user_type,
            staff_role=staff_role,
        )
        return UserWithToken(access_token=access_token, refresh_token=refresh_token)

    def login(self, login_details: LoginRequest) -> UserWithToken:
        student = self._users_repository.get_student_by_email(email=login_details.email)
        if student is not None:
            if not HashHelper.verify_password(
                plain_password=login_details.password,
                hashed_password=student.password_hash,
            ):
                raise self._credentials_exception()
            return self._issue_tokens(user_id=student.id, user_type="student")

        staff = self._users_repository.get_staff_by_email(email=login_details.email)
        if staff is not None:
            if not HashHelper.verify_password(
                plain_password=login_details.password,
                hashed_password=staff.password_hash,
            ):
                raise self._credentials_exception()

            role_value = staff.staff_role.value if hasattr(staff.staff_role, "value") else staff.staff_role
            return self._issue_tokens(user_id=staff.id, user_type="staff", staff_role=role_value)

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
        )

    def logout(self, refresh_token: str | None = None) -> None:
        if refresh_token:
            AuthHandler.revoke_refresh_token(refresh_token)
