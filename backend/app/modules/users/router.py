from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.users.schemas import (
    AvatarUploadOut,
    ProfileMeUpdate,
    StaffOutput,
    StudentInCreate,
    StudentInCreate2026,
    StudentOutput,
)
from app.modules.users.service import UsersService
from app.security.dependencies import get_current_user

usersRouter = APIRouter(prefix="/users", tags=["users"])


@usersRouter.get("/me", response_model=StudentOutput | StaffOutput)
def get_me(current_user=Depends(get_current_user), session: Session = Depends(get_db)):
    return UsersService(session=session).get_me(current_user=current_user)


@usersRouter.patch("/me", response_model=StudentOutput | StaffOutput)
@usersRouter.put("/me", response_model=StudentOutput | StaffOutput)
def update_me(
    payload: ProfileMeUpdate,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_db),
):
    return UsersService(session=session).update_me(current_user=current_user, payload=payload)


@usersRouter.post("/me/avatar", response_model=AvatarUploadOut)
def upload_my_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    session: Session = Depends(get_db),
):
    return UsersService(session=session).upload_my_avatar(current_user=current_user, file=file)


@usersRouter.delete("/me/avatar", response_model=StudentOutput | StaffOutput)
def delete_my_avatar(
    current_user=Depends(get_current_user),
    session: Session = Depends(get_db),
):
    return UsersService(session=session).delete_my_avatar(current_user=current_user)


@usersRouter.post("/students/signup", status_code=201, response_model=StudentOutput)
def student_signup(signup_details: StudentInCreate, session: Session = Depends(get_db)):
    return UsersService(session=session).signup_student(user_details=signup_details)


@usersRouter.post("/students/signup-2026", status_code=201, response_model=StudentOutput)
def student_signup_2026(
    signup_details: StudentInCreate2026,
    session: Session = Depends(get_db),
):
    return UsersService(session=session).signup_student_2026(user_details=signup_details)


@usersRouter.post(
    "/students/mass-signup-2026",
    status_code=201,
    response_model=list[StudentOutput],
)
def mass_student_signup_2026(
    signup_details: list[StudentInCreate2026],
    session: Session = Depends(get_db),
):
    return UsersService(session=session).mass_signup_students_2026(
        users_details=signup_details,
    )
