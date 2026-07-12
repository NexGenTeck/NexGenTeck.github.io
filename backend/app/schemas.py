"""Request and public response schemas."""

from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, field_validator


class ContactRequest(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=150)]
    email: Annotated[EmailStr, Field(max_length=255)]
    phone: Annotated[str | None, Field(max_length=50)] = None
    subject: Annotated[str | None, Field(max_length=100)] = None
    message: Annotated[str, Field(min_length=1, max_length=10000)]
    website: Annotated[str, Field(max_length=200)] = ""

    @field_validator("name", "message", mode="before")
    @classmethod
    def strip_required_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone", "subject", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: object) -> object:
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class ContactSuccess(BaseModel):
    success: bool = True
    message: str = "Message received successfully."


class ContactError(BaseModel):
    success: bool = False
    error: str
