import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict

from jose import jwt

from app.config import settings
from app.security.redis import token_store

JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM
JWT_EXPIRE_MINUTES = settings.JWT_EXPIRE_MINUTES
REFRESH_EXPIRE_DAYS = settings.REFRESH_EXPIRE_DAYS

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not configured")

class AuthHandler(object):

    @staticmethod
    def sign_jwt(user_id: int, user_type: str, staff_role: str | None = None) -> str:
        jti = secrets.token_urlsafe(16)
        payload = {
            "sub": str(user_id),
            "user_type": user_type,
            "type": "access",
            "jti": jti,
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
        payload: Dict[str, str | int | None] = {
            "user_id": user_id,
            "user_type": user_type,
            "staff_role": staff_role,
            "exp": int((datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)).timestamp()),
        }
        token_store.save_refresh(
            refresh_token=refresh_token,
            payload=payload,
            ttl_seconds=REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
        )
        return refresh_token

    @staticmethod
    def validate_refresh_token(refresh_token: str) -> dict:
        token_data = token_store.get_refresh(refresh_token)
        if not token_data:
            raise ValueError("Invalid refresh token")
        if int(token_data["exp"]) < int(datetime.now(timezone.utc).timestamp()):
            token_store.revoke_refresh(refresh_token)
            raise ValueError("Refresh token has expired")
        return token_data

    @staticmethod
    def revoke_refresh_token(refresh_token: str) -> None:
        token_store.revoke_refresh(refresh_token)

    @staticmethod
    def revoke_access_token(access_token: str) -> None:
        try:
            payload = AuthHandler.decode_jwt(access_token)
        except Exception:
            return

        token_jti = payload.get("jti")
        token_exp = payload.get("exp")
        if not token_jti or token_exp is None:
            return

        try:
            exp_ts = int(token_exp)
        except Exception:
            return

        token_store.blacklist(token_jti=str(token_jti), access_exp_ts=exp_ts)
