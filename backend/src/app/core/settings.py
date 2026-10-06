from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from pydantic import Field
#Resolve path for .env file
BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    app_name: str = "Learning Path Generator"
    app_version: str = "1.0.0"

    secret_key: str = Field(
        default="dev_secret",
        description="The secret key for JWT",
    )

    algorithm: str = Field(
        default="Algorithm",
        description="The algorithm used for JWT",
    )

    access_token_expire_minutes: int = Field(
        default=10,
        description="Access token expiration time in minutes",
    )
 
    database_url: str = Field(
        default="",
        alias="DATABASE_URL",
        description="The database URL",
    )
    groq_api_key: str = Field(
        default="",
        alias="GROQ_API_KEY",
        description="API key to use groq (AI)"
    )

    youtube_api_key: str = Field(
        default="",
        alias="YOUTUBE_API_KEY",
        description="API key for Youtube"
    )


    #Adding config for .env file
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        populate_by_name=True,
    )

settings = Settings()

# Fail fast on a misconfigured deployment instead of silently falling back
# to a local SQLite file that no other process or pod can see.
if not settings.database_url.strip():
    raise RuntimeError(
        "DATABASE_URL is not set. Provide it via an environment variable or "
        "backend/.env, e.g. "
        "postgresql+psycopg://user:password@host:5432/dbname"
    )
