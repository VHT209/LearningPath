import pytest
from app.models.user import User
from app.models.learningpath import LearningPath
from app.models.weeklyPlan import WeeklyPlan


# resource needs a user -> learning path -> weekly plan -> resource
@pytest.fixture
def test_user(db):
    # creates a new user with fake data
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="fakehashedpassword",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# learning path needed for weekly plan
@pytest.fixture
def test_learning_path(db, test_user):
    learning_path = LearningPath(
        user_id=test_user.id,
        topic="Python",
        weeks=8,
    )
    db.add(learning_path)
    db.commit()
    db.refresh(learning_path)
    return learning_path


# weekly plan needed for resource
@pytest.fixture
def test_weekly_plan(db, test_learning_path):
    weekly_plan = WeeklyPlan(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["Learn basics"],
        plan_description="Intro week",
    )
    db.add(weekly_plan)
    db.commit()
    db.refresh(weekly_plan)
    return weekly_plan
