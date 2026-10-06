from sqlalchemy.orm import Session
from app.repository.learning_path import LearningPathRepository
from app.schemas.learningpath import LearningPathCreate


# tests made for the repository functions of learning path, same as others, not really commented since explained already in weekly plans
def test_create_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="compe",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )

    result = LearningPathRepository.create_learning_path(db, data, test_user.id)
    assert result.id is not None
    assert result.topic == "compe"
    assert result.proficency == "beginner"
    assert result.weeks == 8
    assert result.user_id == test_user.id


def test_get_by_id_exists(db: Session, test_user):
    data = LearningPathCreate(
        topic="singing",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = LearningPathRepository.create_learning_path(db, data, test_user.id)
    result = LearningPathRepository.get_by_id(db, created.id)
    assert result is not None
    assert result.id == created.id
    assert result.topic == "singing"


def test_get_by_id_not_found(db: Session):
    result = LearningPathRepository.get_by_id(db, 9999)
    assert result is None


def test_get_all_by_user(db: Session, test_user):
    data1 = LearningPathCreate(
        topic="dancing",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    data2 = LearningPathCreate(
        topic="guitar",
        proficency="intermediate",
        learning_type=["article"],
        weeks=4,
    )
    LearningPathRepository.create_learning_path(db, data1, test_user.id)
    LearningPathRepository.create_learning_path(db, data2, test_user.id)
    results = LearningPathRepository.get_all_by_user(db, test_user.id)
    assert len(results) == 2


def test_get_all_by_user_empty(db: Session, test_user):
    results = LearningPathRepository.get_all_by_user(db, test_user.id)
    assert len(results) == 0


def test_update_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="c++",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = LearningPathRepository.create_learning_path(db, data, test_user.id)
    result = LearningPathRepository.update_learning_path(db, created, {"weeks": 12})
    assert result.weeks == 12
    assert result.topic == "c++"


def test_delete_learning_path(db: Session, test_user):
    data = LearningPathCreate(
        topic="computer basics",
        proficency="beginner",
        learning_type=["video"],
        weeks=8,
    )
    created = LearningPathRepository.create_learning_path(db, data, test_user.id)
    LearningPathRepository.delete_learning_path(db, created)
    result = LearningPathRepository.get_by_id(db, created.id)
    assert result is None
