from sqlalchemy.orm import Session

from app.models.weeklyPlan import WeeklyPlan
from app.schemas.weeklyPlan import WeeklyPlanCreate


class WeeklyPlanRepository:
    """Repository class for weekly-plan-related database operations."""

    "Read"

    @staticmethod
    def get_by_id(db: Session, weekly_plan_id: int) -> WeeklyPlan | None:
        """Get a weekly plan by ID."""
        return db.query(WeeklyPlan).filter(WeeklyPlan.id == weekly_plan_id).first()

    @staticmethod
    def get_all_by_learning_path(
        db: Session, learning_path_id: int
    ) -> list[WeeklyPlan]:
        """Get all weekly plans for a specific learning path."""
        return (
            db.query(WeeklyPlan)
            .filter(WeeklyPlan.learning_path_id == learning_path_id)
            .all()
        )

    "Create"

    @staticmethod
    def create_weekly_plan(
        db: Session, weekly_plan_data: WeeklyPlanCreate
    ) -> WeeklyPlan:
        """Create a new weekly plan in the database."""
        db_weekly_plan = WeeklyPlan(
            learning_path_id=weekly_plan_data.learning_path_id,
            week_number=weekly_plan_data.week_number,
            goal=weekly_plan_data.goal,
            plan_description=weekly_plan_data.plan_description,
        )
        db.add(db_weekly_plan)
        db.commit()
        db.refresh(db_weekly_plan)
        return db_weekly_plan

    "Update"

    @staticmethod
    def update_weekly_plan(
        db: Session, db_weekly_plan: WeeklyPlan, updates: dict
    ) -> WeeklyPlan:
        """Update a weekly plan with the given fields."""
        allowed_fields = {"week_number", "goal", "plan_description"}

        for key, value in updates.items():
            if key in allowed_fields:
                setattr(db_weekly_plan, key, value)
        db.commit()
        db.refresh(db_weekly_plan)
        return db_weekly_plan

    "Delete"

    @staticmethod
    def delete_weekly_plan(db: Session, db_weekly_plan: WeeklyPlan) -> None:
        """Delete a weekly plan from the database."""
        db.delete(db_weekly_plan)
        db.commit()
