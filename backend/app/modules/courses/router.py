from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.courses.schemas import (
    CourseCreate,
    CourseOutput,
    CourseSlotOut,
    CourseSlotsSetIn,
    CourseSlotsSetOut,
    CourseUpdate,
)
from app.modules.courses.service import CourseService
from app.security.dependecies import get_current_user
from app.security.permissions import require_admin, require_teacher, require_teacher_or_admin

courseRouter = APIRouter(prefix="/courses", tags=["courses"])


@courseRouter.get("", response_model=list[CourseOutput])
def get_courses(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return CourseService(db=db).list_courses(current_user=current_user, offset=offset, limit=limit)


@courseRouter.get("/my", response_model=list[CourseOutput])
def get_my_courses(
    current_user: dict = Depends(require_teacher),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return CourseService(db=db).list_my_courses(current_user=current_user, offset=offset, limit=limit)


@courseRouter.get("/admin/all", response_model=list[CourseOutput])
def get_all_courses_admin(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return CourseService(db=db).list_all_courses_admin(current_user=current_user, offset=offset, limit=limit)


@courseRouter.get("/{course_id}", response_model=CourseOutput)
def get_course(course_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return CourseService(db=db).get_course(course_id=course_id, current_user=current_user)


@courseRouter.post("", response_model=CourseOutput, status_code=201)
def create_course(data: CourseCreate, current_user: dict = Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    return CourseService(db=db).create_course(data=data, current_user=current_user)


@courseRouter.patch("/{course_id}", response_model=CourseOutput)
def update_course(
    course_id: int,
    data: CourseUpdate,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return CourseService(db=db).update_course(course_id=course_id, data=data, current_user=current_user)


@courseRouter.delete("/{course_id}")
def delete_course(course_id: int, current_user: dict = Depends(require_admin), db: Session = Depends(get_db)):
    return CourseService(db=db).delete_course(course_id=course_id, current_user=current_user)


@courseRouter.post("/{course_id}/slots", response_model=CourseSlotsSetOut)
def set_course_slots(
    course_id: int,
    body: CourseSlotsSetIn,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return CourseService(db=db).set_course_slots(course_id=course_id, data=body, current_user=current_user)


@courseRouter.get("/{course_id}/slots", response_model=list[CourseSlotOut])
def get_course_slots(
    course_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return CourseService(db=db).get_course_slots(course_id=course_id, current_user=current_user)


@courseRouter.delete("/{course_id}/slots/{slot_id}")
def delete_course_slot(
    course_id: int,
    slot_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return CourseService(db=db).delete_course_slot(course_id=course_id, slot_id=slot_id, current_user=current_user)
