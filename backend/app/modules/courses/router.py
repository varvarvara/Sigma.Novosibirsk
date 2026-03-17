from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.courses.schemas import CourseCreate, CourseOutput, CourseUpdate
from app.modules.courses.service import CourseService
from app.security.dependecies import get_current_user
from app.security.permissions import require_admin, require_teacher, require_teacher_or_admin

courseRouter = APIRouter(prefix="/courses", tags=["courses"])


@courseRouter.get("", response_model=list[CourseOutput])
def get_courses(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return CourseService(db=db).list_courses(current_user=current_user)


@courseRouter.get("/my", response_model=list[CourseOutput])
def get_my_courses(current_user: dict = Depends(require_teacher), db: Session = Depends(get_db)):
    return CourseService(db=db).list_my_courses(current_user=current_user)


@courseRouter.get("/admin/all", response_model=list[CourseOutput])
def get_all_courses_admin(current_user: dict = Depends(require_admin), db: Session = Depends(get_db)):
    return CourseService(db=db).list_all_courses_admin(current_user=current_user)


@courseRouter.get("/{course_id}", response_model=CourseOutput)
def get_course(course_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return CourseService(db=db).get_course(course_id=course_id, current_user=current_user)


@courseRouter.post("", response_model=CourseOutput, status_code=201)
def create_course(data: CourseCreate, _: dict = Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    return CourseService(db=db).create_course(data=data, current_user=_)


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