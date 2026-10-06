from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.resource import resource_service
from app.schemas.resource import (
    Resource as ResourceSchema,
    ResourceUpdate,
    ResourceCreate,
)

from app.services.weekly_plan import weekly_plan_service
from app.models.user import User as UserModel
from app.services.user import user_service

api_router = APIRouter(prefix="/resources", tags=["resources"])


"""Creating the resourca tied to plan"""


# FIXME: Does not check whether the weekly_plan exist or not
@api_router.post(
    "/", response_model=ResourceSchema, status_code=status.HTTP_201_CREATED
)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    weekly_plan_service.get_by_id(db, payload.weekly_plan_id)
    return resource_service.create_resource(
        db,
        payload.weekly_plan_id,
        payload.resource_type,
        payload.resource_summary,
        str(payload.url),
    )


"""Get all resources weekly plan for disp"""


@api_router.get("/weekly-plan/{weekly_plan_id}", response_model=list[ResourceSchema])
def get_all(
    weekly_plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    weekly_plan_service.get_by_id(db, weekly_plan_id)
    return resource_service.get_all_by_weekly_plan(db, weekly_plan_id)


"""Get using resource id for view or edit"""


@api_router.get("/{resource_id}", response_model=ResourceSchema)
def get_using_specificid(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return resource_service.get_by_id(db, resource_id)


"""Updating the resource, Todo:(can change updates if schema is updated)"""


@api_router.put("/{resource_id}", response_model=ResourceSchema)
def updating_resource(
    resource_id: int,
    updates: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return resource_service.update_resource(
        db,
        resource_id,
        # Convert pydantic model into dictionary, but only includes fields the user atually provided
        updates.model_dump(exclude_unset=True),
    )


"""Delete the resource, return 204 no content"""


@api_router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def del_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    resource_service.delete_resource(db, resource_id)
    return None
