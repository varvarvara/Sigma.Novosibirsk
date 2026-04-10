from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.users.models import IntakeControl, PreRegistration, Staff, Student
from app.modules.users.schemas import StaffInCreate, StudentInCreate
from enums import PreRegistrationStatuses, StaffRoles, StudentStatuses


class UsersRepository:
    def __init__(self, session: Session):
        self.session = session
        
    def get_students_by_season(self, season_id: int) -> list[Student]:
        return (
            self.session.query(Student)
            .filter(Student.season_id == season_id)
            .order_by(Student.id.desc())
            .all()
        )

    def get_teachers_by_season(self, season_id: int) -> list[Staff]:
        return (
            self.session.query(Staff)
            .filter(
                Staff.season_id == season_id,
                Staff.staff_role == StaffRoles.TEACHER.value,
            )
            .order_by(Staff.id.desc())
            .all()
        )

    def get_all_staff_by_season(self, season_id: int) -> list[Staff]:
        return (
            self.session.query(Staff)
            .filter(Staff.season_id == season_id)
            .order_by(Staff.id.desc())
            .all()
        )

    def get_all_participants_by_season(self, season_id: int) -> list[Student | Staff]:
        students = self.get_students_by_season(season_id)
        staff = self.get_all_staff_by_season(season_id)
        return students + staff

    def create_student_user(self, user_data: StudentInCreate, password: str) -> Student:
        new_student = Student(
            **user_data.model_dump(exclude={"password"}, exclude_none=True),
            password=password,
            student_status=StudentStatuses.REGISTERED.value,
        )
        self.session.add(new_student)
        self.session.commit()
        self.session.refresh(new_student)
        return new_student

    def create_staff_user(self, user_data: StaffInCreate, password: str) -> Staff:
        new_staff = Staff(
            **user_data.model_dump(exclude={"password"}, exclude_none=True, mode="json"),
            password=password,
        )
        self.session.add(new_staff)
        self.session.commit()
        self.session.refresh(new_staff)
        return new_staff

    def create_staff_by_admin(self, data, password: str) -> Staff:
        new_staff = Staff(
            **data.model_dump(exclude={"password"}, exclude_none=True, mode="json"),
            password=password,
        )
        self.session.add(new_staff)
        self.session.commit()
        self.session.refresh(new_staff)
        return new_staff

    def create_staff_from_pre_registration(
        self,
        pre_registration: PreRegistration,
        password: str,
        staff_role: str,
    ) -> Staff:
        new_staff = Staff(
            first_name=pre_registration.first_name,
            last_name=pre_registration.last_name,
            partonymic=pre_registration.partonymic,
            email=pre_registration.email,
            password=password,
            staff_role=staff_role,
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

    def list_admins(self) -> list[Staff]:
        return (
            self.session.query(Staff)
            .filter(Staff.staff_role == StaffRoles.ADMIN.value)
            .order_by(Staff.id.desc())
            .all()
        )

    def get_admin_by_id(self, admin_id: int) -> Staff | None:
        return (
            self.session.query(Staff)
            .filter(Staff.id == admin_id, Staff.staff_role == StaffRoles.ADMIN.value)
            .first()
        )

    def is_admin_by_id(self, staff_id: int) -> bool:
        return self.get_admin_by_id(admin_id=staff_id) is not None

    def count_admins(self) -> int:
        return self.session.query(Staff).filter(Staff.staff_role == StaffRoles.ADMIN.value).count()

    def create_pre_registration(self, data) -> PreRegistration:
        new_pre_registration = PreRegistration(
            **data.model_dump(exclude_none=True),
            pre_registration_status=PreRegistrationStatuses.PENDING_APPROVAL.value,
        )
        self.session.add(new_pre_registration)
        self.session.commit()
        self.session.refresh(new_pre_registration)
        return new_pre_registration

    def get_pre_registration_by_email(self, email: str) -> PreRegistration | None:
        return self.session.query(PreRegistration).filter_by(email=email).first()

    def get_pre_registration_by_id(self, pre_registration_id: int) -> PreRegistration | None:
        return self.session.query(PreRegistration).filter_by(id=pre_registration_id).first()

    def list_pre_registrations(self) -> list[PreRegistration]:
        return self.session.query(PreRegistration).order_by(PreRegistration.id.desc()).all()

    def update_pre_registration_status(self, pre_registration: PreRegistration, new_status: str) -> PreRegistration:
        pre_registration.pre_registration_status = new_status
        self.session.commit()
        self.session.refresh(pre_registration)
        return pre_registration

    def delete_pre_registration(self, pre_registration: PreRegistration) -> None:
        self.session.delete(pre_registration)
        self.session.commit()

    def delete_staff(self, staff: Staff) -> None:
        self.session.delete(staff)
        self.session.commit()

    def user_exist_by_email(self, email: str) -> bool:
        return (
            self.get_student_by_email(email) is not None
            or self.get_staff_by_email(email) is not None
            or self.get_pre_registration_by_email(email) is not None
        )

    def get_or_create_intake_control(self) -> IntakeControl:
        control = self.session.query(IntakeControl).filter(IntakeControl.id == 1).first()
        if control is None:
            control = IntakeControl(id=1, intake_closed=False, closed_at=None, closed_by=None)
            self.session.add(control)
            self.session.commit()
            self.session.refresh(control)
        return control

    def set_intake_closed(self, value: bool, closed_by: int | None) -> IntakeControl:
        control = self.get_or_create_intake_control()
        control.intake_closed = value
        if value:
            control.closed_by = closed_by
            control.closed_at = datetime.utcnow()
        else:
            control.closed_by = None
            control.closed_at = None
        self.session.commit()
        self.session.refresh(control)
        return control

    def is_intake_closed(self) -> bool:
        return self.get_or_create_intake_control().intake_closed
