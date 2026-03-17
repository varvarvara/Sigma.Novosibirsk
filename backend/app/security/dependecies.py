from fastapi import Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.users.repository import UsersRepository
from app.security.authHandler import AuthHandler


def get_token_from_header(request: Request) -> str:
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return authorization.split(" ", 1)[1]


def get_current_user(
    token: str = Depends(get_token_from_header),
    session: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = AuthHandler.decode_jwt(token)
    except JWTError:
        raise credentials_exception

    user_id = payload.get("sub")
    user_type = payload.get("user_type")

    if user_id is None or user_type is None:
        raise credentials_exception

    repository = UsersRepository(session=session)

    if user_type == "student":
        user = repository.get_student_by_id(int(user_id))
    elif user_type == "staff":
        user = repository.get_staff_by_id(int(user_id))
    else:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return {
        "user": user,
        "user_type": user_type,
        "staff_role": payload.get("staff_role"),
    }
