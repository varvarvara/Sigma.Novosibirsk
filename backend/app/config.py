from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    POSTGRES_DB: str = "sigma"
    POSTGRES_USER: str = "sigma"
    POSTGRES_PASSWORD: str = "sigma"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None

    APP_ENV: Literal["dev", "test", "prod"] = "dev"

    JWT_SECRET: str | None = None
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    REFRESH_EXPIRE_DAYS: int = 7
    REMEMBER_REFRESH_EXPIRE_DAYS: int = 30
    PASSWORD_RESET_EXPIRE_MINUTES: int = 60
    FRONTEND_APP_URL: str = "http://localhost:5173"

    CORS_ALLOW_ORIGINS: str = "*"
    CORS_ALLOW_METHODS: str = "*"
    CORS_ALLOW_HEADERS: str = "*"
    CORS_ALLOW_CREDENTIALS: bool = False

    OPENAPI_ENABLED: bool | None = None

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None
    REDIS_URL: str | None = None

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    SMTP_USE_STARTTLS: bool = True
    SMTP_USE_SSL: bool = False

    # S3
    S3_ENDPOINT_URL: str | None = None
    S3_REGION: str = "ru-central-1"
    S3_BUCKET_NAME: str = "sigma-storage"
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    S3_PUBLIC_BASE_URL: str | None = None
    S3_TENANT_ID: str | None = None
    S3_KEY_ID: str | None = None
    S3_AUTO_CREATE_BUCKET: bool = False

    APP_TIMEZONE: str = "Europe/Moscow"
    CERTIFICATES_FOLDER: str = "certificates"
    MEDIA_FOLDER: str = "media"
    PROFILES_FOLDER: str = "profiles"

    @staticmethod
    def _split_csv(value: str) -> list[str]:
        return [item.strip() for item in value.split(",") if item.strip()]

    def build_database_url(self) -> str:
        return (
            "postgresql://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    def build_redis_url(self) -> str:
        if self.REDIS_PASSWORD and self.REDIS_PASSWORD.lower() not in {"none", "null"}:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL or self.build_database_url()

    @property
    def redis_url(self) -> str:
        return self.REDIS_URL or self.build_redis_url()

    @property
    def cors_allow_origins(self) -> list[str]:
        if self.CORS_ALLOW_ORIGINS.strip() == "*":
            return ["*"]
        return self._split_csv(self.CORS_ALLOW_ORIGINS)

    @property
    def cors_allow_methods(self) -> list[str]:
        if self.CORS_ALLOW_METHODS.strip() == "*":
            return ["*"]
        return self._split_csv(self.CORS_ALLOW_METHODS)

    @property
    def cors_allow_headers(self) -> list[str]:
        if self.CORS_ALLOW_HEADERS.strip() == "*":
            return ["*"]
        return self._split_csv(self.CORS_ALLOW_HEADERS)

    @property
    def openapi_enabled(self) -> bool:
        if self.OPENAPI_ENABLED is not None:
            return self.OPENAPI_ENABLED
        return self.APP_ENV != "prod"


settings = Settings()
