from fastapi.testclient import TestClient
from pydantic import ValidationError

from app import main
from app.config import Settings
from app.database import DatabaseUnavailable


client = TestClient(main.app)


def test_process_health_does_not_require_database():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "NexGenTeck Contact API",
    }


def test_database_health_hides_database_failure(monkeypatch):
    monkeypatch.setattr(
        main,
        "check_database_connection",
        lambda: (_ for _ in ()).throw(DatabaseUnavailable()),
    )

    response = client.get("/health/database")

    assert response.status_code == 503
    assert response.json() == {"status": "unhealthy", "database": "unreachable"}


def test_production_rejects_local_database_host():
    try:
        Settings(app_env="production", db_host="localhost")
    except ValidationError:
        pass
    else:
        raise AssertionError("Production configuration accepted a local database host")
