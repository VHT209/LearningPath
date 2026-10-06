from fastapi.testclient import TestClient
from app.schemas.learningpath import LearningPathCreate
from app.services.learning_path import learning_path_service
from app.core.auth import create_access_token

# tests made for routes in learning paths, similar to weekly plans which has comments already explaining what things do


def get_auth_header(user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


def test_create_learning_path(client: TestClient, db, test_user):
    headers = get_auth_header(test_user)
    response = client.post(
        "/learning-paths/",
        json={
            "topic": "test",
            "proficency": "beginner",
            "learning_type": ["video"],
            "weeks": 8,
        },
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["topic"] == "test"
    assert data["user_id"] == test_user.id


def test_create_unauthorized(client: TestClient):
    response = client.post(
        "/learning-paths/",
        json={
            "topic": "singing",
            "proficency": "beginner",
            "learning_type": ["video"],
            "weeks": 8,
        },
    )
    assert response.status_code == 401


def test_create_missing_fields(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.post(
        "/learning-paths/",
        json={
            "topic": "rapping",
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_get_all_learning_paths(client: TestClient, db, test_user):
    headers = get_auth_header(test_user)
    data = LearningPathCreate(
        topic="photoshopping",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    learning_path_service.create_learning_path(db, data, test_user.id)
    response = client.get("/learning-paths/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_all_unauthorized(client: TestClient):
    response = client.get("/learning-paths/")
    assert response.status_code == 401


def test_get_specific(client: TestClient, db, test_user):
    headers = get_auth_header(test_user)
    data = LearningPathCreate(
        topic="drawing",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    response = client.get(f"/learning-paths/{created.id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == created.id


def test_get_specific_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.get("/learning-paths/9999", headers=headers)
    assert response.status_code == 404


def test_update_learning_path(client: TestClient, db, test_user):
    headers = get_auth_header(test_user)
    data = LearningPathCreate(
        topic="movie making",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    response = client.put(
        f"/learning-paths/{created.id}", json={"weeks": 12}, headers=headers
    )
    assert response.status_code == 200


def test_update_unauthorized(client: TestClient):
    response = client.put("/learning-paths/1", json={"weeks": 12})
    assert response.status_code == 401


def test_delete_learning_path(client: TestClient, db, test_user):
    headers = get_auth_header(test_user)
    data = LearningPathCreate(
        topic="rust",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    response = client.delete(f"/learning-paths/{created.id}", headers=headers)
    assert response.status_code == 204


def test_delete_unauthorized(client: TestClient):
    response = client.delete("/learning-paths/1")
    assert response.status_code == 401


def test_delete_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.delete("/learning-paths/9999", headers=headers)
    assert response.status_code == 404
