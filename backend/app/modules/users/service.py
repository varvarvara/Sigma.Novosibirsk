from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.modules.media.service import get_media_service
from app.modules.auth.schemas import PreRegistrationOut
from app.modules.users.repository import UsersRepository
from app.modules.users.schemas import (
    AvatarUploadOut,
    PreRegistrationInCreate2026,
    StaffInCreate,
    ProfileMeUpdate,
    StaffOutput,
    StudentInCreate,
    StudentInCreate2026,
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

    def update_me(self, current_user: dict, payload: ProfileMeUpdate) -> StudentOutput | StaffOutput:
        updates = payload.model_dump(exclude_unset=True, mode="json")
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        if current_user["user_type"] == "student":
            allowed_student_fields = {
                "first_name",
                "last_name",
                "partonymic",
                "birth_date",
                "year_of_study",
                "city",
                "school",
                "phone",
                "tg_nickname",
                "parent_name",
                "parent_phone",
            }
            student_updates = {
                field: value
                for field, value in updates.items()
                if field in allowed_student_fields
            }
            if not student_updates:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No student profile fields to update",
                )

            student: Student = current_user["user"]
            updated_student = self._users_repository.update_student(student.id, student_updates)
            if updated_student is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

            return self._student_output(updated_student)

        allowed_staff_fields = {
            "first_name",
            "last_name",
            "partonymic",
            "birth_date",
            "university",
            "study_direction",
            "study_year",
        }
        staff_updates = {
            field: value
            for field, value in updates.items()
            if field in allowed_staff_fields
        }
        if not staff_updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No staff fields to update",
            )

        staff: Staff = current_user["user"]
        updated = self._users_repository.update_staff(staff.id, staff_updates)
        if updated is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff user not found")

        return self._staff_output(updated)

    def signup_student(self, user_details: StudentInCreate) -> StudentOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        password = HashHelper.get_password_hash(plain_password=user_details.password)
        student = self._users_repository.create_student_user(
            user_data=user_details,
            password=password,
        )
        return self._student_output(student)

    def signup_student_2026(self, user_details: StudentInCreate2026) -> StudentOutput:
        if self._users_repository.user_exist_by_email(email=user_details.email):
            raise HTTPException(status_code=400, detail="Пользователь уже существует, выполните вход")

        student = self._users_repository.create_student_user_2026(user_data=user_details)
        return self._student_output(student)

    def mass_signup_students_2026(
        self,
        users_details: list[StudentInCreate2026],
    ) -> list[StudentOutput]:
        if not users_details:
            raise HTTPException(status_code=400, detail="Список пользователей не может быть пустым")

        normalized_emails = [str(user.email).lower() for user in users_details]
        duplicate_emails = sorted(
            email for email in set(normalized_emails) if normalized_emails.count(email) > 1
        )
        if duplicate_emails:
            raise HTTPException(
                status_code=400,
                detail=f"Email повторяется в запросе: {', '.join(duplicate_emails)}",
            )

        existing_emails = [
            str(user.email)
            for user in users_details
            if self._users_repository.user_exist_by_email(email=user.email)
        ]
        if existing_emails:
            raise HTTPException(
                status_code=400,
                detail=f"Пользователи уже существуют: {', '.join(existing_emails)}",
            )

        students = self._users_repository.create_student_users_2026(users_data=users_details)
        return [self._student_output(student) for student in students]

    def mass_create_pre_registrations_2026(
        self,
        items: list[PreRegistrationInCreate2026],
    ) -> list[PreRegistrationOut]:
        if not items:
            raise HTTPException(status_code=400, detail="Список пререгистраций не может быть пустым")

        normalized_emails = [str(item.email).lower() for item in items]
        duplicate_emails = sorted(
            email for email in set(normalized_emails) if normalized_emails.count(email) > 1
        )
        if duplicate_emails:
            raise HTTPException(
                status_code=400,
                detail=f"Email повторяется в запросе: {', '.join(duplicate_emails)}",
            )

        existing_emails = [
            str(item.email)
            for item in items
            if self._users_repository.user_exist_by_email(email=item.email)
        ]
        if existing_emails:
            raise HTTPException(
                status_code=400,
                detail=f"Пользователи уже существуют: {', '.join(existing_emails)}",
            )

        created = self._users_repository.create_pre_registrations_2026(items=items)
        return [PreRegistrationOut.model_validate(item) for item in created]

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
