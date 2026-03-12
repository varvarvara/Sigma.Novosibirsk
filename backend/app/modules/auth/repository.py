from .base import BaseRepository
from app.modules.users.models import Staff, Student, PreRegistration
from enums import (
    StaffRoles,
    StudentStatuses,
    PreRegistrationStatuses,
)
from app.modules.auth.schemas import (
    StudentInCreate,
    StaffInCreate,
    PreRegistrationInCreate,
)

class UserRepository(BaseRepository):

    def create_student_user(self, user_data: StudentInCreate, password_hash: str) -> Student:
        payload = user_data.model_dump(exclude={"password"}, exclude_none=True)

        student = Student(
            **payload,
            password_hash=password_hash,  # должен быть в модели Student
            student_status=StudentStatuses.REGISTERED,
        )
        self.session.add(student)
        self.session.commit()
        self.session.refresh(student)
        return student

    def create_staff_user(self, user_data: StaffInCreate, password_hash: str) -> Staff:
        payload = user_data.model_dump(exclude={"password"}, exclude_none=True)

        staff = Staff(
            **payload,
            password_hash=password_hash,  
        )
        self.session.add(staff)
        self.session.commit()
        self.session.refresh(staff)
        return staff

    def create_pre_registration(self, data: PreRegistrationInCreate) -> PreRegistration:
        payload = data.model_dump(exclude_none=True)

        pre_registration = PreRegistration(
            **payload,
            pre_registration_status=PreRegistrationStatuses.PENDING_APPROVAL,
        )
        self.session.add(pre_registration)
        self.session.commit()
        self.session.refresh(pre_registration)
        return pre_registration


    def get_student_by_email(self, email: str) -> Student | None:
        return self.session.query(Student).filter(Student.email == email).first()

    def get_staff_by_email(self, email: str) -> Staff | None:
        return self.session.query(Staff).filter(Staff.email == email).first()

    def get_pre_registration_by_email(self, email: str) -> PreRegistration | None:
        return (
            self.session.query(PreRegistration)
            .filter(PreRegistration.email == email)
            .first()
        )

    def user_exist_by_email(self, email: str) -> bool:
        return (
            self.get_student_by_email(email) is not None
            or self.get_staff_by_email(email) is not None
            or self.get_pre_registration_by_email(email) is not None
        )


    def get_student_by_id(self, user_id: int) -> Student | None:
        return self.session.query(Student).filter(Student.id == user_id).first()

    def get_staff_by_id(self, user_id: int) -> Staff | None:
        return self.session.query(Staff).filter(Staff.id == user_id).first()


    def get_pre_registration_by_id(self, pre_registration_id: int) -> PreRegistration | None:
        return (
            self.session.query(PreRegistration)
            .filter(PreRegistration.id == pre_registration_id)
            .first()
        )

    def update_pre_registration_status(
        self,
        pre_registration_id: int,
        new_status: PreRegistrationStatuses,
    ) -> PreRegistration | None:
        pre_registration = self.get_pre_registration_by_id(pre_registration_id)
        if pre_registration is None:
            return None

        pre_registration.pre_registration_status = new_status
        self.session.commit()
        self.session.refresh(pre_registration)
        return pre_registration
