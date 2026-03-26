from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.course_feedback.schemas import (
    CourseFeedbackCreateIn,
    CourseFeedbackOut,
    CourseFeedbackWithAuthorOut,
    FeedbackWindowActionOut,
    FeedbackWindowStatusOut,
)
from app.modules.course_feedback.service import CourseFeedbackService
from app.security.dependecies import get_current_user
from app.security.permissions import require_admin, require_student, require_teacher, require_teacher_or_admin

courseFeedbackRouter = APIRouter(prefix="/course-feedback", tags=["course-feedback"])

def get_course_feedback_service(db: Session = Depends(get_db)) -> CourseFeedbackService:
    return CourseFeedbackService(db=db)


@courseFeedbackRouter.get("/window/status", response_model=FeedbackWindowStatusOut)
def get_feedback_window_status(
    _: dict = Depends(get_current_user),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.get_window_status()


@courseFeedbackRouter.post("/window/open", response_model=FeedbackWindowActionOut)
def open_feedback_window(
    current_user: dict = Depends(require_admin),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.open_window(current_user=current_user)


@courseFeedbackRouter.post("/window/close", response_model=FeedbackWindowActionOut)
def close_feedback_window(
    current_user: dict = Depends(require_admin),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.close_window(current_user=current_user)

@courseFeedbackRouter.post("", response_model=CourseFeedbackOut, status_code=201)
def create_course_feedback(
    body: CourseFeedbackCreateIn,
    current_user: dict = Depends(require_student),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.create_feedback(data=body, current_user=current_user)


@courseFeedbackRouter.get("/me", response_model=list[CourseFeedbackOut])
def get_my_feedback(
    current_user: dict = Depends(require_student),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.get_my_feedback(current_user=current_user)


@courseFeedbackRouter.get("/courses/{course_id}", response_model=list[CourseFeedbackWithAuthorOut])
def get_feedback_for_course(
    course_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.get_feedback_for_course(course_id=course_id, current_user=current_user)


@courseFeedbackRouter.get("/teacher/my-courses", response_model=list[CourseFeedbackWithAuthorOut])
def get_feedback_for_teacher_courses(
    current_user: dict = Depends(require_teacher),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.get_feedback_for_teacher(current_user=current_user)


@courseFeedbackRouter.get("/admin/all", response_model=list[CourseFeedbackWithAuthorOut])
def get_feedback_for_admin(
    course_id: int | None = Query(default=None, description="Filter by course id"),
    current_user: dict = Depends(require_admin),
    service: CourseFeedbackService = Depends(get_course_feedback_service),
):
    return service.get_feedback_for_admin(current_user=current_user, course_id=course_id)
