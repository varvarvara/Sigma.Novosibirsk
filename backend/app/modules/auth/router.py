from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import LoginRequest, LogoutRequest, RefreshTokenRequest, UserWithToken
from app.modules.auth.services import AuthService

authRouter = APIRouter(prefix="/auth", tags=["auth"])


@authRouter.post("/login", response_model=UserWithToken)
def login(body: LoginRequest, session: Session = Depends(get_db)):
    return AuthService(session=session).login(login_details=body)


@authRouter.post("/refresh", response_model=UserWithToken)
def refresh(body: RefreshTokenRequest, session: Session = Depends(get_db)):
    return AuthService(session=session).refresh_tokens(refresh_token=body.refresh_token)


@authRouter.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(body: LogoutRequest, session: Session = Depends(get_db)) -> Response:
    AuthService(session=session).logout(refresh_token=body.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
