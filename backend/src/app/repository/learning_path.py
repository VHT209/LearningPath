from sqlalchemy.orm import Session, joinedload

from app.models.learningpath import LearningPath
from app.schemas.learningpath import LearningPathCreate
from app.models.weeklyPlan import WeeklyPlan


class LearningPathRepository:
    """Repository class for learning-path-related database operations."""

    "Read"

    @staticmethod
    def get_by_id(db: Session, learning_path_id: int) -> LearningPath | None:
        """Get a learning path by ID."""
        return (
            db.query(LearningPath).filter(LearningPath.id == learning_path_id).first()
        )
    
    # joins path and weekly plans and also joins the resources for each plan. Basically fetches path weekly plans and resources for each plan in one query
    @staticmethod
    def get_by_id_with_details(db: Session, learning_path_id: int) -> LearningPath | None:
        """get by id but comes with weekly plans and resources now"""
        return(db.query(LearningPath).options(joinedload(LearningPath.weekly_plans).joinedload(WeeklyPlan.resources))
               .filter(LearningPath.id == learning_path_id)
               .first()
               )

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> list[LearningPath]:
        """Get all learning paths for a specific user."""
        return db.query(LearningPath).filter(LearningPath.user_id == user_id).all()

    "Create"

    @staticmethod
    def create_learning_path(
        db: Session, learning_path_data: LearningPathCreate, user_id: int
    ) -> LearningPath:
        """Create a new learning path in the database."""
        db_learning_path = LearningPath(
            user_id=user_id,
            topic=learning_path_data.topic,
            proficency=learning_path_data.proficency,
            learning_type=learning_path_data.learning_type,
            weeks=learning_path_data.weeks,
        )
        db.add(db_learning_path)
        db.commit()
        db.refresh(db_learning_path)
        return db_learning_path

    "Update"

    @staticmethod
    def update_learning_path(
        db: Session, db_learning_path: LearningPath, updates: dict
    ) -> LearningPath:
        """Update a learning path with the given fields."""
        allowed_fields = {"topic", "proficiency", "learning_type", "weeks"}

        for key, value in updates.items():
            if key in allowed_fields:
                setattr(db_learning_path, key, value)

        db.commit()
        db.refresh(db_learning_path)
        return db_learning_path

    "Delete"

    @staticmethod
    def delete_learning_path(db: Session, db_learning_path: LearningPath) -> None:
        """Delete a learning path from the database."""
        db.delete(db_learning_path)
        db.commit()
