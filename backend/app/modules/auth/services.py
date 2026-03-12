from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.security.hashHelper import HashHelper
from app.security.authHandler import AuthHandler
from app.modules.auth.repository import UserRepository
from app.modules.auth.schemas import (
    StudentInCreate,
    StudentInLogin,
    StudentOutput,
    StaffInCreate,
    StaffInLogin,
    StaffOutput,
    UserWithToken,
)

class UserServices:
    def __init__(self, session: Session):
        self._user_repository = UserRepository(session=session)

    def signup_student(self, user_details: StudentInCreate) -> StudentOutput:
        if self._user_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password_hash = HashHelper.get_password_hash(plain_password=user_details.password)
        student = self._user_repository.create_student_user(
            user_data=user_details,
            password_hash=password_hash,
        )
        return StudentOutput.model_validate(student)

    def login_student(self, login_details: StudentInLogin) -> UserWithToken:
        student = self._user_repository.get_student_by_email(email=login_details.email)
        if student is None:
            raise HTTPException(status_code=400, detail="Пожалуйста, создайте аккаунт")

        if not HashHelper.verify_password(
            plain_password=login_details.password,
            hashed_password=student["password_hash"],
        ):
            raise HTTPException(status_code=400, detail="Неверный email или пароль")

        token = AuthHandler.sign_jwt(user_id=student.id)
        if not token:
            raise HTTPException(status_code=500, detail="Невозможно выполнить запрос обработки")

        return UserWithToken(token=token)

    def signup_staff(self, user_details: StaffInCreate) -> StaffOutput:
        if self._user_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password_hash = HashHelper.get_password_hash(plain_password=user_details.password)
        staff = self._user_repository.create_staff_user(
            user_data=user_details,
            password_hash=password_hash,
        )
        return StaffOutput.model_validate(staff)

    def login_staff(self, login_details: StaffInLogin) -> UserWithToken:
        staff = self._user_repository.get_staff_by_email(email=login_details.email)
        if staff is None:
            raise HTTPException(status_code=400, detail="Пожалуйста, создайте аккаунт")

        if not HashHelper.verify_password(
            plain_password=login_details.password,
            hashed_password=staff.password_hash,
        ):
            raise HTTPException(status_code=400, detail="Неверный email или пароль")

        token = AuthHandler.sign_jwt(user_id=staff.id)
        if not token:
            raise HTTPException(status_code=500, detail="Невозможно выполнить запрос обработки")

        return UserWithToken(token=token)
