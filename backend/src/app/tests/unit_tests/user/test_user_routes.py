# Tests for user registration routes (HTTP layer)

from fastapi.testclient import TestClient

# Route Tests

def test_register_user_success(client: TestClient):
    # hitting POST /users/register with valid data should return 201
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data
    # password should never be returned
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient):
    # second registration with the same email should return 400
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword123",
    }
    client.post("/users/register", json=payload)

    response = client.post(
        "/users/register",
        json={
            "username": "anotheruser",
            "email": "test@example.com",
            "password": "differentpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_register_duplicate_username(client: TestClient):
    # second registration with the same username should return 400
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "first@example.com",
            "password": "securepassword123",
        },
    )

    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "second@example.com",
            "password": "differentpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken"


def test_register_missing_fields(client: TestClient):
    # missing password should return 422
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
        },
    )
    assert response.status_code == 422


def test_register_invalid_email(client: TestClient):
    # invalid email format should return 422
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "not-an-email",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 422


def test_register_returns_correct_schema(client: TestClient):
    # response should only contain id, username, email
    response = client.post(
        "/users/register",
        json={
            "username": "schemauser",
            "email": "schema@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert set(data.keys()) == {"id", "username", "email"}


def test_register_empty_password(client: TestClient):
    # empty password should return 422
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "",
        },
    )
    assert response.status_code == 422
