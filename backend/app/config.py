from pydantic_settings import BaseSettings
from pydantic import Extra
import os
#переписать после подключения redis
class Settings(BaseSettings):
    
    def build_postgres_dsn(self) -> str:
        return (
            "postgresql+asyncpg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    def build_redis_dsn(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DATABASE}"

    class Config:
        env_file = ".env"
        from_attributes = True
        extra = Extra.forbid


settings = Settings()