from fastapi import APIRouter, Depends, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    PreRegistrationCreateIn,
    PreRegistrationOut,
    RefreshTokenRequest,
    UserWithToken,
)
from app.modules.auth.services import AuthService

authRouter = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)


@authRouter.post("/login", response_model=UserWithToken)
def login(body: LoginRequest, session: Session = Depends(get_db)):
    return AuthService(session=session).login(login_details=body)


@authRouter.post("/refresh", response_model=UserWithToken)
def refresh(body: RefreshTokenRequest, session: Session = Depends(get_db)):
    return AuthService(session=session).refresh_tokens(refresh_token=body.refresh_token)


@authRouter.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    body: LogoutRequest,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Response:
    access_token = None
    if credentials is not None and credentials.scheme.lower() == "bearer":
        access_token = credentials.credentials
    AuthService(session=session).logout(refresh_token=body.refresh_token, access_token=access_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@authRouter.post("/staff/pre-registration", status_code=201, response_model=PreRegistrationOut)
def staff_pre_registration(body: PreRegistrationCreateIn, session: Session = Depends(get_db)):
    return AuthService(session=session).staff_pre_registration(data=body)
