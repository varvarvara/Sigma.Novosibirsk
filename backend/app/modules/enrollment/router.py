from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.enrollment.schemas import (
    EnrollmentInUpdateStatus,
    EnrollmentOutput,
    EnrollmentSlotOptionsOut,
    EnrollmentSubmitIn,
    EnrollmentSubmitOut,
)
from app.modules.enrollment.service import EnrollmentService
from app.security.permissions import require_admin, require_student, require_teacher_or_admin


enrollmentRouter = APIRouter(prefix="/enrollment", tags=["enrollment"])


@enrollmentRouter.get("/slots/options", response_model=EnrollmentSlotOptionsOut)
def get_slot_options(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    return EnrollmentService(db=db).get_slot_options(current_user=current_user)


@enrollmentRouter.post("/slots/submit", status_code=201, response_model=EnrollmentSubmitOut)
def submit_slot_selection(
    body: EnrollmentSubmitIn,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    return EnrollmentService(db=db).submit_slot_selection(data=body, current_user=current_user)


@enrollmentRouter.get("/me", response_model=list[EnrollmentOutput])
def get_my_enrollments(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return EnrollmentService(db=db).get_my_enrollments(
        current_user=current_user,
        offset=offset,
        limit=limit,
    )


@enrollmentRouter.patch("/{enrollment_id}/drop", response_model=EnrollmentOutput)
def drop_my_enrollment(
    enrollment_id: int,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    return EnrollmentService(db=db).drop_my_enrollment(enrollment_id=enrollment_id, current_user=current_user)


@enrollmentRouter.get("/courses/{course_id}", response_model=list[EnrollmentOutput])
def get_course_enrollments(
    course_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return EnrollmentService(db=db).get_course_enrollments(
        course_id=course_id,
        current_user=current_user,
        offset=offset,
        limit=limit,
    )


@enrollmentRouter.get("/students/{student_id}", response_model=list[EnrollmentOutput])
def get_student_enrollments(
    student_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return EnrollmentService(db=db).get_student_enrollments(
        student_id=student_id,
        current_user=current_user,
        offset=offset,
        limit=limit,
    )


@enrollmentRouter.patch("/{enrollment_id}/status", response_model=EnrollmentOutput)
def set_enrollment_status(
    enrollment_id: int,
    body: EnrollmentInUpdateStatus,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return EnrollmentService(db=db).set_enrollment_status(
        enrollment_id=enrollment_id,
        data=body,
        current_user=current_user,
    )
