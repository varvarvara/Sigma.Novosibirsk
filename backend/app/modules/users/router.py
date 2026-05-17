from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.users.schemas import AvatarUploadOut, StaffOutput, StudentInCreate, StudentOutput
from app.modules.users.service import UsersService
from app.security.dependencies import get_current_user

usersRouter = APIRouter(prefix="/users", tags=["users"])


@usersRouter.get("/me", response_model=StudentOutput | StaffOutput)
def get_me(current_user=Depends(get_current_user), session: Session = Depends(get_db)):
    return UsersService(session=session).get_me(current_user=current_user)


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
