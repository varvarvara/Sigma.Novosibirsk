from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv
#переписать после подключения redis
class Settings(BaseSettings):
    
    # model_config = SettingsConfigDict(
    #     env_file=".env",
    #     env_file_encoding="utf-8",
    # )

    # secret_key = load_dotenv("JWT_SECRET")
    # algorithm = os.getenv("JWT_ALGORITHM")
    # access = int(os.getenv("JWT_EXPIRE_MINUTES")

    def build_postgres_dsn(self) -> str:
        return (
            "postgresql+asyncpg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    def build_redis_dsn(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DATABASE}"


settings = Settings()