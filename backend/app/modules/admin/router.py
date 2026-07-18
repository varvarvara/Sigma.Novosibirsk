from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.admin.schemas import (
    ActionMessage,
    IntakeActionOut,
    IntakeStatusOut,
    PreRegistrationApproveIn,
    StaffCreateByAdminIn,
    StudentPasswordSetupSendIn,
    StudentPasswordSetupSendOut,
)
from app.modules.admin.service import AdminService
from app.modules.auth.schemas import PreRegistrationOut
from app.modules.users.schemas import StaffOutput
from app.security.permissions import require_admin


adminRouter = APIRouter(prefix="/admin", tags=["admin"])


@adminRouter.get("/intake/status", response_model=IntakeStatusOut)
def get_intake_status(current_user: dict = Depends(require_admin), session: Session = Depends(get_db)):
    _ = current_user
    return AdminService(session=session).get_intake_status()


@adminRouter.post("/intake/close", response_model=IntakeActionOut)
def close_intake(current_user: dict = Depends(require_admin), session: Session = Depends(get_db)):
    return AdminService(session=session).close_intake(current_admin_id=current_user["user"].id)


@adminRouter.post("/intake/open", response_model=IntakeActionOut)
def open_intake(current_user: dict = Depends(require_admin), session: Session = Depends(get_db)):
    _ = current_user
    return AdminService(session=session).open_intake()


@adminRouter.get("/pre-registrations", response_model=list[PreRegistrationOut])
def get_pre_registrations(_: dict = Depends(require_admin), session: Session = Depends(get_db)):
    return AdminService(session=session).list_pre_registrations()


@adminRouter.patch("/pre-registrations/{pre_registration_id}/approve", response_model=StaffOutput)
def approve_pre_registration(
    pre_registration_id: int,
    body: PreRegistrationApproveIn | None = Body(default=None),
    _: dict = Depends(require_admin),
    session: Session = Depends(get_db),
):
    return AdminService(session=session).approve_pre_registration(
        pre_registration_id=pre_registration_id,
        data=body,
    )


@adminRouter.patch("/pre-registrations/{pre_registration_id}/reject", response_model=ActionMessage)
def reject_pre_registration(
    pre_registration_id: int,
    _: dict = Depends(require_admin),
    session: Session = Depends(get_db),
):
    return AdminService(session=session).reject_pre_registration(pre_registration_id=pre_registration_id)


@adminRouter.post("/staff", status_code=201, response_model=StaffOutput)
def create_staff(
    body: StaffCreateByAdminIn,
    _: dict = Depends(require_admin),
    session: Session = Depends(get_db),
):
    return AdminService(session=session).create_staff(data=body)


@adminRouter.post("/students/password-setup/send", response_model=StudentPasswordSetupSendOut)
def send_student_password_setup_emails(
    body: StudentPasswordSetupSendIn,
    _: dict = Depends(require_admin),
    session: Session = Depends(get_db),
):
    return AdminService(session=session).send_student_password_setup_emails(data=body)


@adminRouter.post("/students/{student_id}/password-setup/send", response_model=StudentPasswordSetupSendOut)
def send_student_password_setup_email(
    student_id: int,
    _: dict = Depends(require_admin),
    session: Session = Depends(get_db),
):
    return AdminService(session=session).send_student_password_setup_email(student_id=student_id)
