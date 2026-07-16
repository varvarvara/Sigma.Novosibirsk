from app.config import Settings


def test_openapi_disabled_by_default_in_prod():
    settings = Settings(
        APP_ENV="prod",
        OPENAPI_ENABLED=None,
        JWT_SECRET="test_secret",
    )
    assert settings.openapi_enabled is False


def test_openapi_enabled_by_default_in_dev():
    settings = Settings(
        APP_ENV="dev",
        OPENAPI_ENABLED=None,
        JWT_SECRET="test_secret",
    )
    assert settings.openapi_enabled is True


def test_cors_origin_csv_parsing():
    settings = Settings(
        CORS_ALLOW_ORIGINS="http://localhost:5173, http://127.0.0.1:5173",
        JWT_SECRET="test_secret",
    )
    assert settings.cors_allow_origins == [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
