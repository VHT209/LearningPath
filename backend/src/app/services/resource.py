from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repository.resource import ResourceRepository
from app.models.resource import Resource


class ResourceService:
    """Service class for resource-related operations."""

    def __init__(self) -> None:
        """Initialize the ResourceService with a ResourceRepository instance."""
        self.repository = ResourceRepository()

    """Read functions"""

    def get_by_id(self, db: Session, resource_id: int) -> Resource:
        """Get a resource by ID, raising 404 if not found."""
        resource = self.repository.get_by_id(db, resource_id)
        if resource is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found",
            )
        return resource

    def get_all_by_weekly_plan(
        self, db: Session, weekly_plan_id: int
    ) -> list[Resource]:
        """Get all resources for a specific weekly plan."""
        return self.repository.get_all_by_weekly_plan(db, weekly_plan_id)

    """Create functions"""

    def create_resource(
        self,
        db: Session,
        weekly_plan_id: int,
        resource_type: str,
        resource_summary: str,
        url: str,
    ) -> Resource:
        """Create a new resource.

        Arguments:
            db: Database session
            weekly_plan_id: ID of the weekly plan to attach this resource to
            resource_type: Type of resource (video, article, etc.)
            resource_summary: Short summary of the resource
            url: URL link for the resource

        Returns:
            Resource: The created resource.

        Raises:
            HTTPException: If a resource with the same URL already exists
                for this weekly plan.
        """
        # Check for duplicate URL within the same weekly plan
        existing_resources = self.repository.get_all_by_weekly_plan(db, weekly_plan_id)
        for resource in existing_resources:
            if resource.url == url:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A resource with this URL already exists for this weekly plan",
                )
        return self.repository.create_resource(
            db, weekly_plan_id, resource_type, resource_summary, url
        )

    """Update functions"""

    def update_resource(self, db: Session, resource_id: int, updates: dict) -> Resource:
        """Update a resource.

        Arguments:
            db: Database session
            resource_id: ID of the resource to update
            updates: Dictionary of fields to update

        Returns:
            Resource: The updated resource.

        Raises:
            HTTPException: If resource not found.
        """
        resource = self.get_by_id(db, resource_id)
        # extract HttpUrl type as string
        if "url" in updates and updates["url"] is not None:
            updates["url"] = str(updates["url"])

        return self.repository.update_resource(db, resource, updates)

    """Delete functions"""

    def delete_resource(self, db: Session, resource_id: int) -> None:
        """Delete a resource.

        Arguments:
            db: Database session
            resource_id: ID of the resource to delete

        Raises:
            HTTPException: If resource not found.
        """
        resource = self.get_by_id(db, resource_id)
        self.repository.delete_resource(db, resource)


resource_service = ResourceService()
