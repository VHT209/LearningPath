from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repository.weekly_plan import WeeklyPlanRepository
from app.schemas.weeklyPlan import WeeklyPlanCreate
from app.models.weeklyPlan import WeeklyPlan


class WeeklyPlanService:
    """Service class for weekly-plan-related operations."""

    def __init__(self) -> None:
        """Initialize the WeeklyPlanService with a WeeklyPlanRepository instance."""
        self.repository = WeeklyPlanRepository()

    """Read functions"""

    def get_by_id(self, db: Session, weekly_plan_id: int) -> WeeklyPlan:
        """Get a weekly plan by ID, raising 404 if not found."""
        weekly_plan = self.repository.get_by_id(db, weekly_plan_id)
        if weekly_plan is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weekly plan not found",
            )
        return weekly_plan

    def get_all_by_learning_path(
        self, db: Session, learning_path_id: int
    ) -> list[WeeklyPlan]:
        """Get all weekly plans for a specific learning path."""
        return self.repository.get_all_by_learning_path(db, learning_path_id)

    """Create functions"""

    def create_weekly_plan(
        self, db: Session, weekly_plan_data: WeeklyPlanCreate
    ) -> WeeklyPlan:
        """Create a new weekly plan.

        Arguments:
            db: Database session
            weekly_plan_data: Weekly plan creation data

        Returns:
            WeeklyPlan: The created weekly plan.

        Raises:
            HTTPException: If a plan with the same week number already exists
                for this learning path.
        """
        # Check if a plan with this week number already exists for this learning path
        existing_plans = self.repository.get_all_by_learning_path(
            db, weekly_plan_data.learning_path_id
        )
        for plan in existing_plans:
            if plan.week_number == weekly_plan_data.week_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A plan for this week number already exists",
                )
        return self.repository.create_weekly_plan(db, weekly_plan_data)

    """Update functions"""

    def update_weekly_plan(
        self, db: Session, weekly_plan_id: int, updates: dict
    ) -> WeeklyPlan:
        """Update a weekly plan.

        Arguments:
            db: Database session
            weekly_plan_id: ID of the weekly plan to update
            updates: Dictionary of fields to update

        Returns:
            WeeklyPlan: The updated weekly plan.

        Raises:
            HTTPException: If weekly plan not found.
        """
        weekly_plan = self.get_by_id(db, weekly_plan_id)
        return self.repository.update_weekly_plan(db, weekly_plan, updates)

    """Delete functions"""

    def delete_weekly_plan(self, db: Session, weekly_plan_id: int) -> None:
        """Delete a weekly plan.

        Arguments:
            db: Database session
            weekly_plan_id: ID of the weekly plan to delete

        Raises:
            HTTPException: If weekly plan not found.
        """
        weekly_plan = self.get_by_id(db, weekly_plan_id)
        self.repository.delete_weekly_plan(db, weekly_plan)


weekly_plan_service = WeeklyPlanService()
