from fastapi.testclient import TestClient
from app.services.resource import resource_service
from app.core.auth import create_access_token

# tests made for the routes part of resource


def get_auth_header(user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


def test_create_resource(client: TestClient, db, test_user, test_weekly_plan):
    headers = get_auth_header(test_user)
    response = client.post(
        "/resources/",
        json={
            "weekly_plan_id": test_weekly_plan.id,
            "resource_type": "video",
            "resource_summary": "Intro to Python",
            "url": "https://example.com/video",
        },
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["resource_type"] == "video"
    assert data["url"] == "https://example.com/video"


def test_create_unauthorized(client: TestClient, test_weekly_plan):
    # should return 401 if no token provided
    response = client.post(
        "/resources/",
        json={
            "weekly_plan_id": test_weekly_plan.id,
            "resource_type": "video",
            "resource_summary": "Summary",
            "url": "https://example.com/video",
        },
    )
    assert response.status_code == 401


def test_create_missing_fields(client: TestClient, test_user, test_weekly_plan):
    # missing resource_type should return 422
    headers = get_auth_header(test_user)
    response = client.post(
        "/resources/",
        json={
            "weekly_plan_id": test_weekly_plan.id,
            "resource_summary": "Summary",
            "url": "https://example.com",
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_create_duplicate_url(client: TestClient, db, test_user, test_weekly_plan):
    # creating two resources with the same url should return 400
    headers = get_auth_header(test_user)
    payload = {
        "weekly_plan_id": test_weekly_plan.id,
        "resource_type": "video",
        "resource_summary": "Summary",
        "url": "https://example.com/video",
    }
    client.post("/resources/", json=payload, headers=headers)

    response = client.post("/resources/", json=payload, headers=headers)
    assert response.status_code == 400


def test_get_all_by_weekly_plan(client: TestClient, db, test_user, test_weekly_plan):
    headers = get_auth_header(test_user)
    resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Vid", "https://example.com/1"
    )
    resource_service.create_resource(
        db, test_weekly_plan.id, "article", "Article", "https://example.com/2"
    )

    response = client.get(
        f"/resources/weekly-plan/{test_weekly_plan.id}", headers=headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_all_unauthorized(client: TestClient, test_weekly_plan):
    response = client.get(f"/resources/weekly-plan/{test_weekly_plan.id}")
    assert response.status_code == 401


def test_get_specific_resource(client: TestClient, db, test_user, test_weekly_plan):
    headers = get_auth_header(test_user)
    created = resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Summary", "https://example.com"
    )

    response = client.get(f"/resources/{created.id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == created.id


def test_get_specific_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.get("/resources/9999", headers=headers)
    assert response.status_code == 404


def test_get_specific_unauthorized(client: TestClient):
    response = client.get("/resources/9999")
    assert response.status_code == 401


def test_delete_resource(client: TestClient, db, test_user, test_weekly_plan):
    headers = get_auth_header(test_user)
    created = resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Summary", "https://example.com"
    )

    response = client.delete(f"/resources/{created.id}", headers=headers)
    assert response.status_code == 204


def test_delete_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.delete("/resources/9999", headers=headers)
    assert response.status_code == 404


def test_delete_unauthorized(client: TestClient):
    response = client.delete("/resources/1")
    assert response.status_code == 401
