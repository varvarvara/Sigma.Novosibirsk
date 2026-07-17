import re
import secrets
import string

from fastapi import HTTPException, status

MIN_PASSWORD_LENGTH = 8
LOWERCASE_PATTERN = re.compile(r"[a-zа-яё]")
UPPERCASE_PATTERN = re.compile(r"[A-ZА-ЯЁ]")
DIGIT_PATTERN = re.compile(r"\d")
PASSWORD_ALPHABET = string.ascii_letters + string.digits


def validate_password_strength(password: str) -> str:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Пароль должен содержать минимум {MIN_PASSWORD_LENGTH} символов.",
        )

    if not LOWERCASE_PATTERN.search(password) or not UPPERCASE_PATTERN.search(password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Пароль должен содержать строчные и заглавные буквы.",
        )

    return password


def generate_temporary_password(length: int = MIN_PASSWORD_LENGTH) -> str:
    if length < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password length must be >= {MIN_PASSWORD_LENGTH}")

    while True:
        password = "".join(secrets.choice(PASSWORD_ALPHABET) for _ in range(length))
        if (
            LOWERCASE_PATTERN.search(password)
            and UPPERCASE_PATTERN.search(password)
            and DIGIT_PATTERN.search(password)
        ):
            return password
