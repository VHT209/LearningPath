from fastapi.testclient import TestClient
from app.schemas.weeklyPlan import WeeklyPlanCreate
from app.services.weekly_plan import weekly_plan_service
from app.core.auth import create_access_token
# tests made for the routes part of weekly plans, less commented since most of this is explained more in other parts, like weekly plan services


# used to get the token to authenticate the user, authentication required
def get_auth_header(user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


# testings for creating the weekly plan itself, make sure it matches expected or fails
def test_create_weekly_plan(client: TestClient, db, test_user, test_learning_path):
    headers = get_auth_header(test_user)
    response = client.post(
        "/weekly-plans/",
        json={
            "learning_path_id": test_learning_path.id,
            "week_number": 1,
            "goal": ["learning how to code"],
            "plan_description": "intro to ide's",
        },
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["week_number"] == 1
    assert data["learning_path_id"] == test_learning_path.id


# makes sure that you cant create a weekly plan if your unauthorized, gives status codes
def test_create_weekly_plan_unauthorized(client: TestClient, test_learning_path):
    response = client.post(
        "/weekly-plans/",
        json={
            "learning_path_id": test_learning_path.id,
            "week_number": 1,
            "goal": ["learning basic rust"],
            "plan_description": "random descripion",
        },
    )

    # should be 401 specifically, need authentication
    assert response.status_code == 401


# tests if in your weekly plan you ahve missing fields and the reaction it gives to it
def test_create_weekly_plan_missing_fields(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.post(
        "/weekly-plans/",
        json={
            "week_number": 1,
        },
        headers=headers,
    )

    # should be 422 specifically
    assert response.status_code == 422


# tests to make sure that you get all weekly plans, plan created through service first
def test_get_all_weekly_plans(client: TestClient, db, test_user, test_learning_path):
    headers = get_auth_header(test_user)
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["get this project done"],
        plan_description="Week 1",
    )

    # return specific status code if it works
    weekly_plan_service.create_weekly_plan(db, plan_data)
    response = client.get(
        f"/weekly-plans/learning-path/{test_learning_path.id}", headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


# makes sure that you cant get weekly plans if your unauthorized
def test_get_all_weekly_plans_unauthorized(client: TestClient, test_learning_path):
    response = client.get(f"/weekly-plans/learning-path/{test_learning_path.id}")

    # DROP THAT 401 ON THEIR HEAD IF THEIR NOT AUTHORIZED
    assert response.status_code == 401


# tests to make sure you can get a specific week
def test_get_specific_weekly_plan(
    client: TestClient, db, test_user, test_learning_path
):
    headers = get_auth_header(test_user)
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Learn basics"],
        plan_description="Week 1",
    )
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    response = client.get(f"/weekly-plans/{created.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created.id


# tests that if you get a week thats in there, will give error
def test_get_specific_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.get("/weekly-plans/9999", headers=headers)
    assert response.status_code == 404


# tests to make sute that you can update the weekly plan correctly
def test_update_weekly_plan(client: TestClient, db, test_user, test_learning_path):
    headers = get_auth_header(test_user)
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Old goal"],
        plan_description="Old",
    )
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    response = client.put(
        f"/weekly-plans/{created.id}", json={"goal": ["New goal"]}, headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["goal"] == ["New goal"]


# makes sure your not allowed to update unless authorized
def test_update_unauthorized(client: TestClient):
    response = client.put("/weekly-plans/1", json={"goal": ["New"]})
    assert response.status_code == 401


# tests that deleting a weekly plan works out as expected
def test_delete_weekly_plan(client: TestClient, db, test_user, test_learning_path):
    headers = get_auth_header(test_user)
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Learn basics"],
        plan_description="Week 1",
    )
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    response = client.delete(f"/weekly-plans/{created.id}", headers=headers)
    assert response.status_code == 204


# makes sure you cant delete something if your unauthorized, tests to make sure it behaves as expected
def test_delete_unauthorized(client: TestClient):
    response = client.delete("/weekly-plans/1")
    assert response.status_code == 401


#
def test_delete_not_found(client: TestClient, test_user):
    headers = get_auth_header(test_user)
    response = client.delete("/weekly-plans/9999", headers=headers)
    assert response.status_code == 404
