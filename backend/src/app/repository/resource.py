from sqlalchemy.orm import Session

from app.models.resource import Resource


class ResourceRepository:
    """Repository class for resource-related database operations."""

    "Read"

    @staticmethod
    def get_by_id(db: Session, resource_id: int) -> Resource | None:
        """Get a resource by ID."""
        return db.query(Resource).filter(Resource.id == resource_id).first()

    @staticmethod
    def get_all_by_weekly_plan(db: Session, weekly_plan_id: int) -> list[Resource]:
        """Get all resources for a specific weekly plan."""
        return db.query(Resource).filter(Resource.weeklyplan_id == weekly_plan_id).all()

    "Create"

    @staticmethod
    def create_resource(
        db: Session,
        weekly_plan_id: int,
        resource_type: str,
        resource_summary: str,
        url: str,
    ) -> Resource:
        """Create a new resource in the database."""
        db_resource = Resource(
            weeklyplan_id=weekly_plan_id,
            resource_type=resource_type,
            resource_summary=resource_summary,
            url=url,
        )
        db.add(db_resource)
        db.commit()
        db.refresh(db_resource)
        return db_resource

    "Update"

    @staticmethod
    def update_resource(db: Session, db_resource: Resource, updates: dict) -> Resource:
        """Update a resource with the given fields."""
        allowed_fields = {"resource_type", "resource_summary", "url"}

        for key, value in updates.items():
            if key in allowed_fields:
                setattr(db_resource, key, value)
        db.commit()
        db.refresh(db_resource)
        return db_resource

    "Delete"

    @staticmethod
    def delete_resource(db: Session, db_resource: Resource) -> None:
        """Delete a resource from the database."""
        db.delete(db_resource)
        db.commit()
