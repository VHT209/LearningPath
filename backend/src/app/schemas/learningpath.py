from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

from app.schemas.weeklyPlan import WeeklyPlanWithResources


# this would be things that are used within multiple schemas, think of it like the base for the response and create schemas that will also be created later
# this will include the
class LearningPathBase(BaseModel):
    """base schmea that will be utilized for both create and response"""

    topic: str

    # literal makes it so that only certain values can come through, with those being the proficency level, whcih is not required, by default make it none if nothing is picked
    proficency: Optional[Literal["beginner", "intermediate", "advanced"]] = None

    # learning type is optional but can be picked out of these options, multiple options utilizes list
    learning_type: Optional[
        List[Literal["video", "audio", "article", "problems", "course"]]
    ] = None

    # sets min amd max to >= 1 and <= 52 while ... makes it required
    weeks: int = Field(..., ge=1, le=6)


class LearningPathCreate(LearningPathBase):
    """what needs to be sent when you need to create a learning path"""

    # pass means just take from base, dont need to give anything else to create learning path
    pass


class LearningPath(LearningPathBase):
    """waht is sent from the backend to the front after creation/viewing of learningpath"""

    id: int

    created_at: datetime

    user_id: int

    # makes it so that pydantic can understand sqlalchemy
    model_config = {"from_attributes": True}

# full learning path response with nested weekly plans
class LearningPathWithDetails(LearningPath):
    weekly_plans: List[WeeklyPlanWithResources] = []
