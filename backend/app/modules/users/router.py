from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.users.schemas import StaffOutput, StudentInCreate, StudentOutput
from app.modules.users.service import UsersService
from app.security.dependecies import get_current_user

usersRouter = APIRouter(prefix="/users", tags=["users"])

@usersRouter.get("/me")
def get_me(current_user=Depends(get_current_user)):
    if current_user["user_type"] == "student":
        return StudentOutput.model_validate(current_user["user"])
    return StaffOutput.model_validate(current_user["user"])


@usersRouter.post("/students/signup", status_code=201, response_model=StudentOutput)
def student_signup(signup_details: StudentInCreate, session: Session = Depends(get_db)):
    return UsersService(session=session).signup_student(user_details=signup_details)
