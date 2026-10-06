from sqlalchemy.orm import Session
from app.repository.resource import ResourceRepository

# tests made for the repository functions of resource


def test_create_resource(db: Session, test_weekly_plan):
    # creating a resource and storing the result
    result = ResourceRepository.create_resource(
        db,
        test_weekly_plan.id,
        "video",
        "Intro to Python",
        "https://example.com/video",
    )

    # checking that the result matches what we expect
    assert result.id is not None
    assert result.resource_type == "video"
    assert result.resource_summary == "Intro to Python"
    assert result.url == "https://example.com/video"
    assert result.weeklyplan_id == test_weekly_plan.id


def test_get_by_id_exists(db: Session, test_weekly_plan):
    created = ResourceRepository.create_resource(
        db,
        test_weekly_plan.id,
        "article",
        "Python basics",
        "https://example.com/article",
    )

    result = ResourceRepository.get_by_id(db, created.id)

    assert result is not None
    assert result.id == created.id
    assert result.resource_type == "article"


def test_get_by_id_not_found(db: Session):
    # gives an id that does not exist to make sure the result is None
    result = ResourceRepository.get_by_id(db, 9999)
    assert result is None


def test_get_all_by_weekly_plan(db: Session, test_weekly_plan):
    # creating two resources to make sure both show up
    ResourceRepository.create_resource(
        db, test_weekly_plan.id, "video", "Vid 1", "https://example.com/1"
    )
    ResourceRepository.create_resource(
        db, test_weekly_plan.id, "article", "Article 1", "https://example.com/2"
    )

    result = ResourceRepository.get_all_by_weekly_plan(db, test_weekly_plan.id)

    # make sure both resources are returned
    assert len(result) == 2


def test_get_all_by_weekly_plan_empty(db: Session, test_weekly_plan):
    # nothing in there so should be empty
    result = ResourceRepository.get_all_by_weekly_plan(db, test_weekly_plan.id)
    assert len(result) == 0


def test_update_resource(db: Session, test_weekly_plan):
    created = ResourceRepository.create_resource(
        db, test_weekly_plan.id, "video", "Old summary", "https://example.com"
    )

    # making an update and storing the result to see if it worked
    update = {"resource_summary": "New summary"}
    result = ResourceRepository.update_resource(db, created, update)

    assert result.resource_summary == "New summary"
    assert result.resource_type == "video"


def test_delete_resource(db: Session, test_weekly_plan):
    created = ResourceRepository.create_resource(
        db, test_weekly_plan.id, "video", "Summary", "https://example.com"
    )

    # actually delete the resource
    ResourceRepository.delete_resource(db, created)

    result = ResourceRepository.get_by_id(db, created.id)

    # make sure fully deleted
    assert result is None
