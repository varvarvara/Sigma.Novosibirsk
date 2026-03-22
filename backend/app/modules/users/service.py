from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.users.repository import UsersRepository
from app.modules.users.schemas import StaffInCreate, StaffOutput, StudentInCreate, StudentOutput
from app.security.hashHelper import HashHelper


class UsersService:
    def __init__(self, session: Session):
        self._users_repository = UsersRepository(session=session)

    def signup_student(self, user_details: StudentInCreate) -> StudentOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password = HashHelper.get_password_hash(plain_password=user_details.password)
        student = self._users_repository.create_student_user(
            user_data=user_details,
            password=password,
        )
        return StudentOutput.model_validate(student)

    def signup_staff(self, user_details: StaffInCreate) -> StaffOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password = HashHelper.get_password_hash(plain_password=user_details.password)
        staff = self._users_repository.create_staff_user(
            user_data=user_details,
            password=password,
        )
        return StaffOutput.model_validate(staff)
