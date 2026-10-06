import pytest
from app.models.user import User


# learning path needs a user
@pytest.fixture
def test_user(db):
    # creates a new user woith fake data
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="fakehashedpassword",
    )
    # adds, commits, and refreshes so that the user has an id
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
