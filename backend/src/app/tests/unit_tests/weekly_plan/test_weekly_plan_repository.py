from sqlalchemy.orm import Session
from app.repository.weekly_plan import WeeklyPlanRepository
from app.schemas.weeklyPlan import WeeklyPlanCreate
# this would be the tests made for functions in repositories


def test_create_weekly_plan(db: Session, test_learning_path):

    # creating the test data used for the weekly plan
    weekly_plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["GET GOOD AT PYTHON PLEASEEEE"],
        plan_description="intro to data types",
    )

    # this is the result of what were testing, call what were testing and store it here
    test_result = WeeklyPlanRepository.create_weekly_plan(db, weekly_plan_data)

    # using assert here in order to check the result and see if it matches the expectations wanted for it
    # assert fail = test fail
    assert test_result.id is not None
    assert test_result.week_number == 1
    assert test_result.goal == ["GET GOOD AT PYTHON PLEASEEEE"]
    assert test_result.plan_description == "intro to data types"
    assert test_result.learning_path_id == test_learning_path.id


# same flow as last check but checking new function, create a weekly plan store the results and check against whats expected
def test_get_by_id_check(db: Session, test_learning_path):

    weekly_plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=2,
        goal=["Learn conditionals"],
        plan_description="Week 2",
    )

    created = WeeklyPlanRepository.create_weekly_plan(db, weekly_plan_data)

    results = WeeklyPlanRepository.get_by_id(db, created.id)

    assert results is not None
    assert results.id == created.id
    assert results.week_number == 2


def test_get_by_id_not_found_check(db: Session):
    # gives them an id that does not exist to make sure the result would be None
    result = WeeklyPlanRepository.get_by_id(db, 9999)
    assert result is None


def test_get_all_by_learning_path(db: Session, test_learning_path):
    # CREATING TWO SPECIFIC WEEKLY PLANS TO SHOW THAT IT SHOWS THEM
    plan1 = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["learn something"],
        plan_description="Week 1 stuff",
    )
    plan2 = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=2,
        goal=["Learn something newer from week 1"],
        plan_description="Week 2 stuff",
    )

    WeeklyPlanRepository.create_weekly_plan(db, plan1)
    WeeklyPlanRepository.create_weekly_plan(db, plan2)

    result = WeeklyPlanRepository.get_all_by_learning_path(db, test_learning_path.id)

    # MAKE SURE FROM THE TESTS THAT THERE ARE ONLY 2 PLANS SINCE WE MADE TWO
    assert len(result) == 2


# case of if there are no weekly plans inside the learning path
def test_get_all_by_learning_path_empty(db: Session, test_learning_path):
    results = WeeklyPlanRepository.get_all_by_learning_path(db, test_learning_path.id)

    # nothing in there so should be empty, if not test failed
    assert len(results) == 0


# same old same old testing
def test_update_weekly_plan(db: Session, test_learning_path):
    weekly_plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["gonna update later"],
        plan_description="outdated",
    )
    created = WeeklyPlanRepository.create_weekly_plan(db, weekly_plan_data)

    # making an update and storing the result of the update to see if it worked
    update = {"goal": ["new goal nice"]}
    result = WeeklyPlanRepository.update_weekly_plan(db, created, update)

    assert result.goal == ["new goal nice"]
    assert result.plan_description == "outdated"


# test for deleting a weekly plan
def test_delete_weekly_plan(db: Session, test_learning_path):
    # making data to test
    weekly_plan_data = WeeklyPlanCreate(
        learning_path_id=test_learning_path.id,
        week_number=1,
        goal=["learn nothing"],
        plan_description="week 1",
    )
    created = WeeklyPlanRepository.create_weekly_plan(db, weekly_plan_data)

    # actually delete the plan
    WeeklyPlanRepository.delete_weekly_plan(db, created)

    result = WeeklyPlanRepository.get_by_id(db, created.id)

    # make sure fully deleted
    assert result is None
