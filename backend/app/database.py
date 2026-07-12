"""Hostinger MySQL access with a lazy, small SQLAlchemy connection pool."""

from __future__ import annotations

import logging
import threading

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, URL
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.schemas import ContactRequest

logger = logging.getLogger(__name__)

_engine: Engine | None = None
_engine_lock = threading.Lock()


class DatabaseUnavailable(Exception):
    """Safe internal error that deliberately excludes connection details."""


def get_engine() -> Engine:
    """Create the database engine only when an endpoint needs it."""
    global _engine
    if _engine is not None:
        return _engine

    with _engine_lock:
        if _engine is not None:
            return _engine
        if not settings.database_configured:
            raise DatabaseUnavailable("Database configuration is unavailable")

        connect_args: dict[str, object] = {"connect_timeout": settings.db_connect_timeout}
        if settings.db_ssl_ca:
            connect_args["ssl"] = {"ca": settings.db_ssl_ca}

        try:
            _engine = create_engine(
                URL.create(
                    "mysql+pymysql",
                    username=settings.db_user,
                    password=settings.db_password,
                    host=settings.db_host,
                    port=settings.db_port,
                    database=settings.db_name,
                ),
                pool_pre_ping=True,
                pool_recycle=1800,
                pool_size=5,
                max_overflow=2,
                connect_args=connect_args,
            )
            return _engine
        except SQLAlchemyError as exc:
            logger.error("Unable to create the contact database engine: %s", type(exc).__name__)
            raise DatabaseUnavailable("Database connection could not be initialized") from exc


def check_database_connection() -> None:
    """Raise DatabaseUnavailable when Hostinger MySQL cannot be reached."""
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
    except (SQLAlchemyError, DatabaseUnavailable) as exc:
        logger.error("Contact database health check failed: %s", type(exc).__name__)
        raise DatabaseUnavailable("Database is unavailable") from exc


def save_contact(contact: ContactRequest) -> None:
    """Insert a validated contact into the existing Hostinger contacts table."""
    statement = text(
        """
        INSERT INTO contacts (name, email, phone, subject, message)
        VALUES (:name, :email, :phone, :subject, :message)
        """
    )
    values = {
        "name": contact.name,
        "email": str(contact.email),
        "phone": contact.phone,
        "subject": contact.subject,
        "message": contact.message,
    }
    try:
        with get_engine().begin() as connection:
            connection.execute(statement, values)
    except (SQLAlchemyError, DatabaseUnavailable) as exc:
        logger.error("Contact database insert failed: %s", type(exc).__name__)
        raise DatabaseUnavailable("Contact submission could not be stored") from exc
