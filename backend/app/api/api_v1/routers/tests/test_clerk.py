from fastapi.testclient import TestClient
from app.core import clerk


def test_read_session_success(client: TestClient, monkeypatch):
    def verify_session_mock(token: str):
        return {"id": "sess_123", "user": {"id": "user_1"}}

    monkeypatch.setattr(clerk, "verify_session", verify_session_mock)
    headers = {"Authorization": "Bearer testtoken"}
    response = client.get("/api/session", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"session": {"id": "sess_123", "user": {"id": "user_1"}}}


def test_read_session_missing_header(client: TestClient):
    response = client.get("/api/session")
    assert response.status_code == 401
