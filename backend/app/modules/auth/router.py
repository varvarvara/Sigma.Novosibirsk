from fastapi import APIRouter, Depends, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    MessageOut,
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
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


@authRouter.post("/password-reset/request", response_model=MessageOut)
def request_password_reset(body: PasswordResetRequestIn, session: Session = Depends(get_db)):
    return AuthService(session=session).request_password_reset(body=body)


@authRouter.post("/password-reset/confirm", response_model=MessageOut)
def confirm_password_reset(body: PasswordResetConfirmIn, session: Session = Depends(get_db)):
    return AuthService(session=session).confirm_password_reset(body=body)
