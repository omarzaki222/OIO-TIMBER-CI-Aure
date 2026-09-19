from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "OIO Wood & Timber"
    app_env: str = "dev"
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="postgresql+psycopg://oio:oio@localhost:5432/oio",
        description="SQLAlchemy URL. PostgreSQL for local/prod; SQLite only in tests.",
    )

    jwt_secret: str = Field(default="dev-only-change-me")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    refresh_cookie_name: str = "oio_refresh"
    refresh_cookie_path: str = "/api/v1/auth"

    cors_allowed_origins: str = "http://localhost:3000,http://localhost:3001"

    media_storage_type: str = "local"

    @field_validator("jwt_secret")
    @classmethod
    def secret_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("JWT_SECRET must be set")
        return v

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def cookie_secure(self) -> bool:
        return self.app_env.lower() in {"prod", "production"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
