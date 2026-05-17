import pytest
from fastapi import HTTPException

from app.security.password_policy import generate_temporary_password, validate_password_strength


def test_password_policy_accepts_strong_password():
    assert validate_password_strength("StrongPass") == "StrongPass"


@pytest.mark.parametrize(
    "password, expected_detail",
    [
        ("Short1A", "минимум 8 символов"),
        ("lowercaseonly", "строчные и заглавные буквы"),
        ("UPPERCASEONLY", "строчные и заглавные буквы"),
    ],
)
def test_password_policy_rejects_weak_passwords(password: str, expected_detail: str):
    with pytest.raises(HTTPException) as error:
        validate_password_strength(password)

    assert expected_detail in str(error.value.detail)


def test_generate_temporary_password_meets_rules():
    password = generate_temporary_password(length=8)

    assert len(password) == 8
    assert any(symbol.islower() for symbol in password)
    assert any(symbol.isupper() for symbol in password)
    assert any(symbol.isdigit() for symbol in password)


def test_generate_temporary_password_returns_different_values():
    password_one = generate_temporary_password(length=8)
    password_two = generate_temporary_password(length=8)

    assert password_one != password_two
