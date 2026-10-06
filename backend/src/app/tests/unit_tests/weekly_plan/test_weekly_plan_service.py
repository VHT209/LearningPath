import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.weekly_plan import weekly_plan_service
from app.schemas.weeklyPlan import WeeklyPlanCreate
# functions made to test the functions inside of service for weekly plans


# tests that the right plan is given when it exists
def test_get_by_id_exists(db: Session, test_learning_path):
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["learn web design"],
        plan_description="Week 1",
    )
    # makes sure that result has something and that its the same id
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    result = weekly_plan_service.get_by_id(db, created.id)
    assert result is not None
    assert result.id == created.id


# tests that a 404 code is given when trying to access a plan that doesnt exist
def test_get_by_id_not_found(db: Session):
    # catches execprtion or else test WILL CRASH
    with pytest.raises(HTTPException) as error:
        weekly_plan_service.get_by_id(db, 9999)

    # makes sure that is specificallty a 404 request
    assert error.value.status_code == 404


# tests that all weekly paths are given when giving a learning path
def test_get_all_by_learning_path(db: Session, test_learning_path):

    # creating two plans specifically so its not like the other funciomn
    plan1 = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["random ahh goal"],
        plan_description="idk what to put here",
    )
    plan2 = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=2,
        goal=["second random ahh goal"],
        plan_description="here either",
    )
    weekly_plan_service.create_weekly_plan(db, plan1)
    weekly_plan_service.create_weekly_plan(db, plan2)
    results = weekly_plan_service.get_all_by_learning_path(db, test_learning_path.id)
    assert len(results) == 2


# tests to make sure that you can create a weekly plan and that it does it correctly
def test_create_weekly_plan(db: Session, test_learning_path):
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["learn math"],
        plan_description="new phone who dis",
    )

    # make sure theres an id, matches the week number and learning path id
    result = weekly_plan_service.create_weekly_plan(db, plan_data)
    assert result.id is not None
    assert result.week_number == 1
    assert result.learning_path_id == test_learning_path.id


# checks for same week numbers within the same learning path which should not happen
def test_create_duplicate_week_number(db: Session, test_learning_path):
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["learning enlish"],
        plan_description="Week 1",
    )
    weekly_plan_service.create_weekly_plan(db, plan_data)
    duplicate = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["another learning english"],
        plan_description="Also week 1",
    )

    # if you create two plans with the same week numbers it should raise an error
    with pytest.raises(HTTPException) as error:
        weekly_plan_service.create_weekly_plan(db, duplicate)
    assert error.value.status_code == 400


# tests to check you update weekly plan correctly
def test_update_weekly_plan(db: Session, test_learning_path):
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Old goal"],
        plan_description="Old description",
    )
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    result = weekly_plan_service.update_weekly_plan(
        db, created.id, {"goal": ["New goal"]}
    )
    assert result.goal == ["New goal"]
    assert result.plan_description == "Old description"


# if what your trying to update cant be found give a code
def test_update_not_found(db: Session):
    # specifically give a 404
    with pytest.raises(HTTPException) as error:
        weekly_plan_service.update_weekly_plan(db, 9999, {"goal": ["New"]})
    assert error.value.status_code == 404


# tests that after deleting you correctly get an error if you try accessing it again
def test_delete_weekly_plan(db: Session, test_learning_path):

    # should raise 404 -> not found
    plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Learn basics"],
        plan_description="Week 1",
    )
    created = weekly_plan_service.create_weekly_plan(db, plan_data)
    weekly_plan_service.delete_weekly_plan(db, created.id)
    # check that by trying to get it it will give a status code
    with pytest.raises(HTTPException) as error:
        weekly_plan_service.get_by_id(db, created.id)
    assert error.value.status_code == 404


def test_delete_not_found(db: Session):
    with pytest.raises(HTTPException) as error:
        weekly_plan_service.delete_weekly_plan(db, 9999)
    assert error.value.status_code == 404