import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv
from jose import jwt

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
REFRESH_EXPIRE_DAYS = int(os.getenv("REFRESH_EXPIRE_DAYS", "7"))

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not configured")

_refresh_tokens: Dict[str, dict] = {}


class AuthHandler(object):

    @staticmethod
    def sign_jwt(user_id: int, user_type: str, staff_role: str | None = None) -> str:
        payload = {
            "sub": str(user_id),
            "user_type": user_type,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        }
        if staff_role is not None:
            payload["staff_role"] = staff_role
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    @staticmethod
    def decode_jwt(token: str) -> dict:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

    @staticmethod
    def create_refresh_token(user_id: int, user_type: str, staff_role: str | None = None) -> str:
        refresh_token = secrets.token_urlsafe(32)
        _refresh_tokens[refresh_token] = {
            "user_id": user_id,
            "user_type": user_type,
            "staff_role": staff_role,
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS),
        }
        return refresh_token

    @staticmethod
    def validate_refresh_token(refresh_token: str) -> dict:
        token_data = _refresh_tokens.get(refresh_token)
        if not token_data:
            raise ValueError("Invalid refresh token")
        if token_data["exp"] < datetime.now(timezone.utc):
            del _refresh_tokens[refresh_token]
            raise ValueError("Refresh token has expired")
        return token_data

    @staticmethod
    def revoke_refresh_token(refresh_token: str) -> None:
        _refresh_tokens.pop(refresh_token, None)
