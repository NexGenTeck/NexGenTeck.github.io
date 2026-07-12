from fastapi.testclient import TestClient

from app import main
from app.database import DatabaseUnavailable


client = TestClient(main.app)

VALID_CONTACT = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "",
    "subject": "",
    "message": "Please contact me about a project.",
    "website": "",
}


def test_valid_contact_returns_201_and_normalizes_optionals(monkeypatch):
    saved = []
    monkeypatch.setattr(main, "save_contact", saved.append)

    response = client.post("/contact", json=VALID_CONTACT)

    assert response.status_code == 201
    assert response.json() == {
        "success": True,
        "message": "Message received successfully.",
    }
    assert saved[0].phone is None
    assert saved[0].subject is None


def test_required_fields_and_invalid_email_are_422():
    missing_message = client.post("/contact", json={"name": "Ada", "email": "ada@example.com"})
    invalid_email = client.post(
        "/contact", json={**VALID_CONTACT, "email": "not-an-email"}
    )

    assert missing_message.status_code == 422
    assert invalid_email.status_code == 422
    assert missing_message.json() == {
        "success": False,
        "error": "Please check the submitted fields.",
    }


def test_field_length_limits_are_enforced():
    invalid_payloads = [
        {**VALID_CONTACT, "name": "n" * 151},
        {**VALID_CONTACT, "phone": "p" * 51},
        {**VALID_CONTACT, "subject": "s" * 101},
        {**VALID_CONTACT, "message": "m" * 10001},
    ]

    for payload in invalid_payloads:
        response = client.post("/contact", json=payload)
        assert response.status_code == 422


def test_honeypot_returns_success_without_database_write(monkeypatch):
    database_save = []
    monkeypatch.setattr(main, "save_contact", database_save.append)

    response = client.post("/contact", json={**VALID_CONTACT, "website": "bot"})

    assert response.status_code == 201
    assert response.json()["success"] is True
    assert database_save == []


def test_database_failure_is_generic_and_does_not_leak(monkeypatch):
    def fail_save(_):
        raise DatabaseUnavailable("internal database failure")

    monkeypatch.setattr(main, "save_contact", fail_save)
    response = client.post("/contact", json=VALID_CONTACT)

    assert response.status_code == 503
    assert response.json() == {
        "success": False,
        "error": "Unable to send message right now. Please try again later.",
    }
    assert "database failure" not in response.text
    assert "internal" not in response.text


def test_smtp_failure_does_not_change_a_successful_insert(monkeypatch):
    monkeypatch.setattr(main, "save_contact", lambda _: None)
    monkeypatch.setattr(main.settings, "smtp_enabled", True)
    monkeypatch.setattr(main.settings, "smtp_username", "sender@example.com")
    monkeypatch.setattr(main.settings, "smtp_password", "not-a-real-password")
    monkeypatch.setattr(main.settings, "smtp_from_email", "sender@example.com")
    monkeypatch.setattr(main.settings, "admin_email", "admin@example.com")

    def unavailable_smtp(*_, **__):
        raise OSError("SMTP unavailable")

    monkeypatch.setattr(main.email_service.smtplib, "SMTP_SSL", unavailable_smtp)

    response = client.post("/contact", json=VALID_CONTACT)

    assert response.status_code == 201
    assert response.json()["success"] is True


def test_cors_preflight_allows_only_configured_origins():
    allowed = client.options(
        "/contact",
        headers={
            "Origin": "https://nexgenteck.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    rejected = client.options(
        "/contact",
        headers={
            "Origin": "https://unapproved.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "https://nexgenteck.com"
    assert rejected.headers.get("access-control-allow-origin") is None
