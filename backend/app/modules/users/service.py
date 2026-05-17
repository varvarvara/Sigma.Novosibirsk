from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.modules.media.service import get_media_service
from app.modules.users.repository import UsersRepository
from app.modules.users.schemas import (
    AvatarUploadOut,
    StaffInCreate,
    StaffOutput,
    StudentInCreate,
    StudentOutput,
)
from app.modules.users.models import Staff, Student
from app.security.hashHelper import HashHelper


class UsersService:
    def __init__(self, session: Session):
        self._users_repository = UsersRepository(session=session)
        self._media = get_media_service()

    @staticmethod
    def _student_output(student: Student) -> StudentOutput:
        media = get_media_service()
        output = StudentOutput.model_validate(student)
        return output.model_copy(
            update={"avatar_url": media.resolve_url(student.avatar_image_key)},
        )

    @staticmethod
    def _staff_output(staff: Staff) -> StaffOutput:
        media = get_media_service()
        output = StaffOutput.model_validate(staff)
        return output.model_copy(
            update={"avatar_url": media.resolve_url(staff.avatar_image_key)},
        )

    def get_me(self, current_user: dict) -> StudentOutput | StaffOutput:
        if current_user["user_type"] == "student":
            return self._student_output(current_user["user"])
        return self._staff_output(current_user["user"])

    def signup_student(self, user_details: StudentInCreate) -> StudentOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password = HashHelper.get_password_hash(plain_password=user_details.password)
        student = self._users_repository.create_student_user(
            user_data=user_details,
            password=password,
        )
        return self._student_output(student)

    def signup_staff(self, user_details: StaffInCreate) -> StaffOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password = HashHelper.get_password_hash(plain_password=user_details.password)
        staff = self._users_repository.create_staff_user(
            user_data=user_details,
            password=password,
        )
        return self._staff_output(staff)

    def upload_my_avatar(self, current_user: dict, file: UploadFile) -> AvatarUploadOut:
        ext = self._media.validate_image(file)
        if current_user["user_type"] == "student":
            user: Student = current_user["user"]
            old_key = user.avatar_image_key
            object_key = self._media.student_avatar_key(user.id, ext)
            self._media.upload_image(file=file, object_key=object_key)
            updated = self._users_repository.set_student_avatar_key(user.id, object_key)
            if updated is None:
                raise HTTPException(status_code=404, detail="Student not found")
            self._media.delete_object(old_key)
            avatar_url = self._media.resolve_url(object_key)
            return AvatarUploadOut(avatar_url=avatar_url or "", avatar_image_key=object_key)

        user_staff: Staff = current_user["user"]
        old_key = user_staff.avatar_image_key
        object_key = self._media.staff_avatar_key(user_staff.id, ext)
        self._media.upload_image(file=file, object_key=object_key)
        updated = self._users_repository.set_staff_avatar_key(user_staff.id, object_key)
        if updated is None:
            raise HTTPException(status_code=404, detail="Staff user not found")
        self._media.delete_object(old_key)
        avatar_url = self._media.resolve_url(object_key)
        return AvatarUploadOut(avatar_url=avatar_url or "", avatar_image_key=object_key)

    def delete_my_avatar(self, current_user: dict) -> StudentOutput | StaffOutput:
        if current_user["user_type"] == "student":
            user: Student = current_user["user"]
            old_key = user.avatar_image_key
            updated = self._users_repository.set_student_avatar_key(user.id, None)
            if updated is None:
                raise HTTPException(status_code=404, detail="Student not found")
            self._media.delete_object(old_key)
            return self._student_output(updated)

        user_staff: Staff = current_user["user"]
        old_key = user_staff.avatar_image_key
        updated = self._users_repository.set_staff_avatar_key(user_staff.id, None)
        if updated is None:
            raise HTTPException(status_code=404, detail="Staff user not found")
        self._media.delete_object(old_key)
        return self._staff_output(updated)
