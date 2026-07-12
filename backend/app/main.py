"""FastAPI application for NexGenTeck contact submissions."""

from __future__ import annotations

import logging

from fastapi import BackgroundTasks, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import email_service
from app.config import settings
from app.database import DatabaseUnavailable, check_database_connection, save_contact
from app.schemas import ContactError, ContactRequest, ContactSuccess

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(_: Request, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ContactError(error="Please check the submitted fields.").model_dump(),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": settings.app_name}


@app.get("/health/database", response_model=None)
def database_health():
    try:
        check_database_connection()
    except DatabaseUnavailable:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "unreachable"},
        )
    return {"status": "healthy", "database": "reachable"}


@app.post(
    "/contact",
    status_code=status.HTTP_201_CREATED,
    response_model=ContactSuccess,
    responses={
        422: {"model": ContactError},
        503: {"model": ContactError},
        500: {"model": ContactError},
    },
)
def contact_submission(contact: ContactRequest, background_tasks: BackgroundTasks):
    if contact.website:
        return ContactSuccess()

    try:
        save_contact(contact)
    except DatabaseUnavailable:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=ContactError(
                error="Unable to send message right now. Please try again later."
            ).model_dump(),
        )
    except Exception as exc:  # Keep unexpected implementation details server-side.
        logger.error("Unexpected contact submission error: %s", type(exc).__name__)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ContactError(
                error="Unable to send message right now. Please try again later."
            ).model_dump(),
        )

    background_tasks.add_task(email_service.send_contact_emails, contact)
    return ContactSuccess()
