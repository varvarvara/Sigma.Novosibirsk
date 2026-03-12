from pathlib import Path

from dotenv import load_dotenv
from decouple import config
from jose import jwt
from datetime import datetime, timedelta, timezone

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

JWT_SECRET = config("JWT_SECRET")
JWT_ALGORITHM = config("JWT_ALGORITHM")
JWT_EXPIRE_MINUTES = config("JWT_EXPIRE_MINUTES", cast=int, default=60)

class AuthHandler:
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
