from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.learning_path import learning_path_service
from app.schemas.learningpath import (
    LearningPathCreate,
    LearningPath as LearningPathSchema,
    LearningPathWithDetails
)
from app.models.user import User as UserModel
from app.services.user import user_service

api_router = APIRouter(prefix="/learning-paths", tags=["learning-paths"])

"""Creating new learning path for user"""


@api_router.post(
    "/", response_model=LearningPathSchema, status_code=status.HTTP_201_CREATED
)
def create_learning_path(
    data: LearningPathCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return learning_path_service.create_learning_path(db, data, current_user.id)


"""Get all learning path for current user"""


@api_router.get("/", response_model=list[LearningPathSchema])
def get_all(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return learning_path_service.get_all_by_user(db, current_user.id)


"""Get by specific id, Todo:(can implement security check if needed)"""


@api_router.get("/{learning_path_id}", response_model=LearningPathWithDetails)
def get_using_specfic(
    learning_path_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return learning_path_service.get_by_id_with_details(db, learning_path_id)


"""Update learning path, Todo:(can change updates if schema is updated)"""


@api_router.put("/{learning_path_id}", response_model=LearningPathSchema)
def update_path(
    learning_path_id: int,
    updates: dict,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    return learning_path_service.update_learning_path(
        db, learning_path_id, current_user.id, updates
    )


"""Delete learning path, return 204 no content inside"""


@api_router.delete("/{learning_path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_path(
    learning_path_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    learning_path_service.delete_learning_path(db, learning_path_id, current_user.id)
    return None
