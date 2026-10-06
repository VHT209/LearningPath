import pytest
from app.models.user import User
from app.models.learningpath import LearningPath


# weekly plan also needs a user -> user -> learning path -> weekly plan
@pytest.fixture
def test_user(db):
    # same thing, creating a new user
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="fakehashedpassword",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# whats different from here to learning path is the fact that we need to make a learning path for weekly plan too
@pytest.fixture
def test_learning_path(db, test_user):
    # creating. a learning path
    learning_path = LearningPath(
        user_id=test_user.id,
        topic="Python",
        weeks=8,
    )
    db.add(learning_path)
    db.commit()
    db.refresh(learning_path)
    return learning_path
