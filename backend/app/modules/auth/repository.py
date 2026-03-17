from sqlalchemy import insert, select, update

from app.modules.auth.base import BaseRepository
from app.modules.users.models import Staff, Student, PreRegistration
from app.modules.auth.schemas import StudentInCreate, StaffInCreate, PreRegistrationInCreate
from enums import StudentStatuses, PreRegistrationStatuses

class UserRepository(BaseRepository):

    def create_student_user(self, user_data: StudentInCreate, password_hash: str) -> Student:
        new_student = Student(
            **user_data.model_dump(exclude={"password"}, exclude_none=True),
            password_hash=password_hash,
            student_status=StudentStatuses.REGISTERED.value,
        )
        self.session.add(instance=new_student)
        self.session.commit()
        self.session.refresh(instance=new_student)
        return new_student

    def get_student_by_email(self, email: str) -> Student | None:
        return self.session.query(Student).filter_by(email=email).first()

    def get_student_by_id(self, user_id: int) -> Student | None:
        return self.session.query(Student).filter_by(id=user_id).first()


    def create_staff_user(self, user_data: StaffInCreate, password_hash: str) -> Staff:
        new_staff = Staff(
            **user_data.model_dump(exclude={"password"}, exclude_none=True, mode="json"),
            password_hash=password_hash,
        )
        self.session.add(instance=new_staff)
        self.session.commit()
        self.session.refresh(instance=new_staff)
        return new_staff

    def get_staff_by_email(self, email: str) -> Staff | None:
        return self.session.query(Staff).filter_by(email=email).first()

    def get_staff_by_id(self, user_id: int) -> Staff | None:
        return self.session.query(Staff).filter_by(id=user_id).first()

    def create_pre_registration(self, data: PreRegistrationInCreate) -> PreRegistration:
        new_pre_reg = PreRegistration(
            **data.model_dump(exclude_none=True, mode="json"),
            pre_registration_status=PreRegistrationStatuses.PENDING_APPROVAL.value,
        )
        self.session.add(instance=new_pre_reg)
        self.session.commit()
        self.session.refresh(instance=new_pre_reg)
        return new_pre_reg

    def get_pre_registration_by_id(self, pre_registration_id: int) -> PreRegistration | None:
        return self.session.query(PreRegistration).filter_by(id=pre_registration_id).first()

    def update_pre_registration_status(self, pre_registration_id: int, new_status) -> PreRegistration | None:
        pre_reg = self.get_pre_registration_by_id(pre_registration_id)
        if pre_reg is None:
            return None
        pre_reg.pre_registration_status = new_status.value if hasattr(new_status, "value") else new_status
        self.session.commit()
        self.session.refresh(instance=pre_reg)
        return pre_reg

    def user_exist_by_email(self, email: str) -> bool:
        student = self.get_student_by_email(email)
        staff = self.get_staff_by_email(email)
        return bool(student or staff)