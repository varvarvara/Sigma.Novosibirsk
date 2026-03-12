from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import (
    StudentInCreate,
    StudentInLogin,
    StudentOutput,
    StaffInCreate,
    StaffInLogin,
    StaffOutput,
    UserWithToken,
)
from app.modules.auth.services import UserServices
from fastapi.security import OAuth2PasswordRequestForm


authRouter = APIRouter(prefix="/auth", tags=["auth"])

@authRouter.post("/token", response_model=UserWithToken)
def token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_db)):
    return UserServices(session=session).login_oauth2(
        email=form_data.username,
        password=form_data.password,
    )

@authRouter.post("/students/login", status_code=200, response_model=UserWithToken)
def studentLogin(loginDetails: StudentInLogin, session: Session = Depends(get_db)):
    try:
        return UserServices(session=session).login_student(login_details=loginDetails)
    except Exception as error:
        print(error)
        raise error


@authRouter.post("/students/signup", status_code=201, response_model=StudentOutput)
def studentSignUp(signUpDetails: StudentInCreate, session: Session = Depends(get_db)):
    try:
        return UserServices(session=session).signup_student(user_details=signUpDetails)
    except Exception as error:
        print(error)
        raise error


@authRouter.post("/staff/login", status_code=200, response_model=UserWithToken)
def staffLogin(loginDetails: StaffInLogin, session: Session = Depends(get_db)):
    try:
        return UserServices(session=session).login_staff(login_details=loginDetails)
    except Exception as error:
        print(error)
        raise error


@authRouter.post("/staff/signup", status_code=201, response_model=StaffOutput)
def staffSignUp(signUpDetails: StaffInCreate, session: Session = Depends(get_db)):
    try:
        return UserServices(session=session).signup_staff(user_details=signUpDetails)
    except Exception as error:
        print(error)
        raise error
