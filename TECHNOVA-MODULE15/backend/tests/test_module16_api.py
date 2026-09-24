from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def get_token():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "technova123",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_login():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "technova123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_protected_endpoint_without_token():
    response = client.get(
        "/api/v1/security/protected"
    )

    assert response.status_code == 401


def test_protected_endpoint_with_token():
    token = get_token()

    response = client.get(
        "/api/v1/security/protected",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "JWT authentication successful"


def test_data_api_pagination():
    token = get_token()

    response = client.get(
        "/api/v1/data?page=1&page_size=2",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "pagination" in data
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 2


def test_data_api_filter():
    token = get_token()

    response = client.get(
        "/api/v1/data?district=Chennai&disease=Dengue",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["district"] == "Chennai"
    assert data["items"][0]["disease"] == "Dengue"


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"