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
REMEMBER_REFRESH_EXPIRE_DAYS = settings.REMEMBER_REFRESH_EXPIRE_DAYS

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not configured. Set JWT_SECRET in backend/.env")

if JWT_SECRET == "change_me":
    raise RuntimeError("JWT_SECRET=change_me is forbidden. Use a strong secret value.")

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
    def create_refresh_token(
        user_id: int,
        user_type: str,
        staff_role: str | None = None,
        *,
        remember_me: bool = False,
    ) -> str:
        refresh_expire_days = REMEMBER_REFRESH_EXPIRE_DAYS if remember_me else REFRESH_EXPIRE_DAYS
        refresh_token = secrets.token_urlsafe(32)
        payload: Dict[str, str | int | bool | None] = {
            "user_id": user_id,
            "user_type": user_type,
            "staff_role": staff_role,
            "remember_me": remember_me,
            "exp": int((datetime.now(timezone.utc) + timedelta(days=refresh_expire_days)).timestamp()),
        }
        token_store.save_refresh(
            refresh_token=refresh_token,
            payload=payload,
            ttl_seconds=refresh_expire_days * 24 * 60 * 60,
        )
        return refresh_token

    @staticmethod
    def create_password_reset_token(user_id: int, user_type: str, email: str) -> str:
        reset_token = secrets.token_urlsafe(32)
        ttl_seconds = settings.PASSWORD_RESET_EXPIRE_MINUTES * 60
        payload = {
            "user_id": user_id,
            "user_type": user_type,
            "email": email,
            "exp": int((datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)).timestamp()),
        }
        token_store.save_password_reset(
            reset_token=reset_token,
            payload=payload,
            ttl_seconds=ttl_seconds,
        )
        return reset_token

    @staticmethod
    def validate_password_reset_token(reset_token: str) -> dict:
        token_data = token_store.get_password_reset(reset_token)
        if not token_data:
            raise ValueError("Ссылка для сброса пароля недействительна или устарела.")
        if int(token_data["exp"]) < int(datetime.now(timezone.utc).timestamp()):
            token_store.revoke_password_reset(reset_token)
            raise ValueError("Ссылка для сброса пароля недействительна или устарела.")
        return token_data

    @staticmethod
    def revoke_password_reset_token(reset_token: str) -> None:
        token_store.revoke_password_reset(reset_token)

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
