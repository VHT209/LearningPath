import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.resource import resource_service

# tests made for service functions of resource


def test_get_by_id_exists(db: Session, test_weekly_plan):
    created = resource_service.create_resource(
        db,
        test_weekly_plan.id,
        "video",
        "Intro to Python",
        "https://example.com/video",
    )

    result = resource_service.get_by_id(db, created.id)

    # makes sure that result has something and that its the same id
    assert result is not None
    assert result.id == created.id


def test_get_by_id_not_found(db: Session):
    with pytest.raises(HTTPException) as error:
        resource_service.get_by_id(db, 9999)
    assert error.value.status_code == 404


def test_get_all_by_weekly_plan(db: Session, test_weekly_plan):
    resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Vid", "https://example.com/1"
    )
    resource_service.create_resource(
        db, test_weekly_plan.id, "article", "Article", "https://example.com/2"
    )

    results = resource_service.get_all_by_weekly_plan(db, test_weekly_plan.id)
    assert len(results) == 2


def test_create_resource(db: Session, test_weekly_plan):
    result = resource_service.create_resource(
        db,
        test_weekly_plan.id,
        "video",
        "Intro to Python",
        "https://example.com/video",
    )

    # make sure theres an id and it matches the weekly plan
    assert result.id is not None
    assert result.weeklyplan_id == test_weekly_plan.id
    assert result.url == "https://example.com/video"


def test_create_duplicate_url(db: Session, test_weekly_plan):
    # creating the same url twice in the same weekly plan should raise an error
    resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Summary", "https://example.com/video"
    )

    # if you create two resources with the same url it should raise an error
    with pytest.raises(HTTPException) as error:
        resource_service.create_resource(
            db, test_weekly_plan.id, "article", "Summary 2", "https://example.com/video"
        )
    assert error.value.status_code == 400


def test_update_resource(db: Session, test_weekly_plan):
    created = resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Old summary", "https://example.com"
    )

    result = resource_service.update_resource(
        db, created.id, {"resource_summary": "New summary"}
    )

    assert result.resource_summary == "New summary"
    assert result.resource_type == "video"


def test_update_not_found(db: Session):
    with pytest.raises(HTTPException) as error:
        resource_service.update_resource(db, 9999, {"resource_summary": "New"})
    assert error.value.status_code == 404


def test_delete_resource(db: Session, test_weekly_plan):
    created = resource_service.create_resource(
        db, test_weekly_plan.id, "video", "Summary", "https://example.com"
    )

    resource_service.delete_resource(db, created.id)

    # check that by trying to get it, it will give a 404
    with pytest.raises(HTTPException) as error:
        resource_service.get_by_id(db, created.id)
    assert error.value.status_code == 404


def test_delete_not_found(db: Session):
    with pytest.raises(HTTPException) as error:
        resource_service.delete_resource(db, 9999)
    assert error.value.status_code == 404
