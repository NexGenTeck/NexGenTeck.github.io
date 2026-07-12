"""Environment-backed configuration for the Contact API."""

from __future__ import annotations

from functools import cached_property

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings loaded from the deployment environment, never source code."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_name: str = "NexGenTeck Contact API"
    log_level: str = "INFO"

    db_host: str = ""
    db_port: int = 3306
    db_name: str = ""
    db_user: str = ""
    db_password: str = ""
    db_connect_timeout: int = 10
    db_ssl_ca: str = ""

    cors_origins: str = (
        "http://localhost:5173,http://localhost:4000,https://nexgenteck.com,"
        "https://www.nexgenteck.com,https://nexgenteck.github.io,"
        "https://muhammadhasaan82.github.io"
    )

    smtp_enabled: bool = False
    smtp_host: str = "smtp.hostinger.com"
    smtp_port: int = 465
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "NexGenTeck Website"
    admin_email: str = ""

    @field_validator("db_host")
    @classmethod
    def reject_local_production_database(cls, value: str, info):
        host = value.strip()
        environment = str(info.data.get("app_env", "development")).lower()
        if environment == "production" and host.lower() in {
            "localhost",
            "127.0.0.1",
            "api.nexgenteck.com",
            "nexgenteck.com",
        }:
            raise ValueError("DB_HOST must be the Hostinger Remote MySQL hostname")
        return host

    @cached_property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def database_configured(self) -> bool:
        return bool(self.db_host and self.db_name and self.db_user and self.db_password)

    @property
    def smtp_configured(self) -> bool:
        return bool(
            self.smtp_enabled
            and self.smtp_host
            and self.smtp_username
            and self.smtp_password
            and self.smtp_from_email
            and self.admin_email
        )


settings = Settings()
