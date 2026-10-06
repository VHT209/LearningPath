from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repository.learning_path import LearningPathRepository
from app.schemas.learningpath import LearningPathCreate
from app.models.learningpath import LearningPath




class LearningPathService:
    """Service class for learning-path-related operations."""

    def __init__(self) -> None:
        """Initialize the LearningPathService with a LearningPathRepository instance."""
        self.repository = LearningPathRepository()

    """Read functions"""

    def get_by_id(self, db: Session, learning_path_id: int) -> LearningPath:
        """Get a learning path by ID, raising 404 if not found."""
        learning_path = self.repository.get_by_id(db, learning_path_id)
        if learning_path is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning path not found",
            )
        return learning_path
    
    def get_by_id_with_details(self, db: Session, learning_path_id: int) -> LearningPath:
        """Get a learning path by ID, raising 404 if not found."""
        learning_path = self.repository.get_by_id_with_details(db, learning_path_id)
        if learning_path is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning path not found",
            )
        return learning_path
    

    def get_all_by_user(self, db: Session, user_id: int) -> list[LearningPath]:
        """Get all learning paths for a specific user."""
        return self.repository.get_all_by_user(db, user_id)

    """Create functions"""

    def create_learning_path(
        self, db: Session, learning_path_data: LearningPathCreate, user_id: int
    ) -> LearningPath:
        """Create a new learning path for a user using AI.

        Arguments:
            db: Database session
            learning_path_data: Learning path creation data
            user_id: ID of the user creating the learning path

        Returns:
            learning_path: The created learning path.

        Raises:
            HTTPException: If creation fails.
        """

        from app.repository.weekly_plan import WeeklyPlanRepository
        from app.repository.resource import ResourceRepository
        from app.services.ai import generatingWeeklyPlans, moderateTopic

        moderation = moderateTopic(learning_path_data.topic, learning_path_data.weeks)

        # make sure that the topic is appropriate
        if not moderation["appropriate"]:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail=moderation["reason"] or "This topic is not allowed"
            )
        
        # make sure if its too broad, so cant do  that and maybe give suggestions?
        if not moderation["specific_enough"]:
            # gives suggestions
            suggestion = moderation.get("suggestion", "")
            message = moderation["reason"] or "Topic is too broad."
            if suggestion:
                message = f"{message} {suggestion}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # create learning path so an ID is given
        learning_path = self.repository.create_learning_path(db, learning_path_data, user_id)

        # generates the plan u want with resources now
        new_plan = generatingWeeklyPlans(topic = learning_path.topic, proficency = learning_path.proficency, weeks = learning_path.weeks, learning_path_id= learning_path.id)


        # saving weekly plan + resources associated with it into the db
        weekly_plan_repo = WeeklyPlanRepository()
        resource_repo = ResourceRepository()

        for item in new_plan:
            # save weekly plan so you have an id for it 
            savedPlan = weekly_plan_repo.create_weekly_plan(db, item["plan"])

            # for each resource in the plan
            for resource in item["resources"]:
                # save the resources
                try:
                    resource_repo.create_resource(db = db, weekly_plan_id= savedPlan.id, resource_type= resource["resource_type"], resource_summary= resource["resource_summary"], url = resource["url"])

                except Exception as e:
                    # if the resource is bad, skip the resource
                    print(f"Failed to save resource: {e}")
                    continue

        return learning_path
    

    """Update functions"""

    def update_learning_path(
        self, db: Session, learning_path_id: int, user_id: int, updates: dict
    ) -> LearningPath:
        """Update a learning path, verifying ownership.

        Arguments:
            db: Database session
            learning_path_id: ID of the learning path to update
            user_id: ID of the current user (for ownership check)
            updates: Dictionary of fields to update

        Returns:
            LearningPath: The updated learning path.

        Raises:
            HTTPException: If learning path not found or user doesn't own it.
        """
        learning_path = self.get_by_id(db, learning_path_id)
        if learning_path.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this learning path",
            )
        return self.repository.update_learning_path(db, learning_path, updates)

    """Delete functions"""

    def delete_learning_path(
        self, db: Session, learning_path_id: int, user_id: int
    ) -> None:
        """Delete a learning path, verifying ownership.

        Arguments:
            db: Database session
            learning_path_id: ID of the learning path to delete
            user_id: ID of the current user (for ownership check)

        Raises:
            HTTPException: If learning path not found or user doesn't own it.
        """
        learning_path = self.get_by_id(db, learning_path_id)
        if learning_path.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this learning path",
            )
        self.repository.delete_learning_path(db, learning_path)


learning_path_service = LearningPathService()
