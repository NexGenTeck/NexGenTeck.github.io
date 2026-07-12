"""Optional, non-blocking SMTP notifications for stored contact requests."""

from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.config import settings
from app.schemas import ContactRequest

logger = logging.getLogger(__name__)


def send_contact_emails(contact: ContactRequest) -> None:
    """Send notifications after persistence; failures never affect the API response."""
    if not settings.smtp_enabled:
        return
    if not settings.smtp_configured:
        logger.warning("SMTP is enabled but contact email settings are incomplete")
        return

    try:
        admin_message = EmailMessage()
        admin_message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        admin_message["To"] = settings.admin_email
        admin_message["Reply-To"] = str(contact.email)
        admin_message["Subject"] = f"New website contact: {contact.subject or 'No subject'}"
        admin_message.set_content(
            "A new website contact was saved.\n\n"
            f"Name: {contact.name}\nEmail: {contact.email}\n"
            f"Phone: {contact.phone or 'Not provided'}\n"
            f"Subject: {contact.subject or 'Not provided'}\n\n"
            f"Message:\n{contact.message}"
        )

        confirmation = EmailMessage()
        confirmation["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        confirmation["To"] = str(contact.email)
        confirmation["Subject"] = "Thank you for contacting NexGenTeck"
        confirmation.set_content(
            f"Hi {contact.name},\n\n"
            "Thank you for contacting NexGenTeck. We received your message and "
            "our team will follow up soon.\n\nBest regards,\nNexGenTeck Team"
        )

        context = ssl.create_default_context()
        if settings.smtp_port == 465:
            client = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context, timeout=15)
        else:
            client = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15)
            client.starttls(context=context)
        with client:
            client.login(settings.smtp_username, settings.smtp_password)
            client.send_message(admin_message)
            client.send_message(confirmation)
    except Exception as exc:  # SMTP libraries expose heterogeneous exception types.
        logger.error("Contact email notification failed: %s", type(exc).__name__)
