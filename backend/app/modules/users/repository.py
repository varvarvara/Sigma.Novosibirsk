from sqlalchemy.orm import Session

from app.modules.users.models import Staff, Student
from app.modules.users.schemas import StaffInCreate, StudentInCreate
from enums import StudentStatuses


class UsersRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_student_user(self, user_data: StudentInCreate, password_hash: str) -> Student:
        new_student = Student(
            **user_data.model_dump(exclude={"password"}, exclude_none=True),
            password_hash=password_hash,
            student_status=StudentStatuses.REGISTERED.value,
        )
        self.session.add(new_student)
        self.session.commit()
        self.session.refresh(new_student)
        return new_student

    def create_staff_user(self, user_data: StaffInCreate, password_hash: str) -> Staff:
        new_staff = Staff(
            **user_data.model_dump(exclude={"password"}, exclude_none=True, mode="json"),
            password_hash=password_hash,
        )
        self.session.add(new_staff)
        self.session.commit()
        self.session.refresh(new_staff)
        return new_staff

    def get_student_by_email(self, email: str) -> Student | None:
        return self.session.query(Student).filter_by(email=email).first()

    def get_staff_by_email(self, email: str) -> Staff | None:
        return self.session.query(Staff).filter_by(email=email).first()

    def get_student_by_id(self, user_id: int) -> Student | None:
        return self.session.query(Student).filter_by(id=user_id).first()

    def get_staff_by_id(self, user_id: int) -> Staff | None:
        return self.session.query(Staff).filter_by(id=user_id).first()

    def user_exist_by_email(self, email: str) -> bool:
        return self.get_student_by_email(email) is not None or self.get_staff_by_email(email) is not None
