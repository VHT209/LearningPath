import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.learning_path import learning_path_service
from app.schemas.learningpath import LearningPathCreate

# tests made for service functions of learning paths


def test_get_by_id_exists(db: Session, test_user):
    data = LearningPathCreate(
        topic="cooking",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    result = learning_path_service.get_by_id(db, created.id)
    assert result is not None
    assert result.id == created.id


def test_get_by_id_not_found(db: Session):
    with pytest.raises(HTTPException) as error:
        learning_path_service.get_by_id(db, 9999)
    assert error.value.status_code == 404


def test_get_all_by_user(db: Session, test_user):
    data1 = LearningPathCreate(
        topic="fortnite",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    data2 = LearningPathCreate(
        topic="67",
        proficency="intermediate",
        learning_type=["article"],
        weeks=4,
    )
    learning_path_service.create_learning_path(db, data1, test_user.id)
    learning_path_service.create_learning_path(db, data2, test_user.id)
    results = learning_path_service.get_all_by_user(db, test_user.id)
    assert len(results) == 2


def test_create_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="you wont see this",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    result = learning_path_service.create_learning_path(db, data, test_user.id)
    assert result.id is not None
    assert result.topic == "you wont see this"
    assert result.user_id == test_user.id


def test_update_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="csgo",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    result = learning_path_service.update_learning_path(
        db, created.id, test_user.id, {"weeks": 12}
    )
    assert result.weeks == 12


def test_update_not_found(db: Session, test_user):
    with pytest.raises(HTTPException) as error:
        learning_path_service.update_learning_path(
            db, 9999, test_user.id, {"weeks": 12}
        )
    assert error.value.status_code == 404


def test_update_wrong_user(db: Session, test_user):
    data = LearningPathCreate(
        topic="valorant",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    with pytest.raises(HTTPException) as error:
        learning_path_service.update_learning_path(db, created.id, 9999, {"weeks": 12})
    assert error.value.status_code == 403


def test_delete_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="rocket league",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    learning_path_service.delete_learning_path(db, created.id, test_user.id)
    with pytest.raises(HTTPException) as error:
        learning_path_service.get_by_id(db, created.id)
    assert error.value.status_code == 404


def test_delete_not_found(db: Session, test_user):
    with pytest.raises(HTTPException) as error:
        learning_path_service.delete_learning_path(db, 9999, test_user.id)
    assert error.value.status_code == 404


def test_delete_wrong_user(db: Session, test_user):
    data = LearningPathCreate(
        topic="kernels",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = learning_path_service.create_learning_path(db, data, test_user.id)
    with pytest.raises(HTTPException) as error:
        learning_path_service.delete_learning_path(db, created.id, 9999)
    assert error.value.status_code == 403
