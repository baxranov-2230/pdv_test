from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Test Platform"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/pdv_test"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
