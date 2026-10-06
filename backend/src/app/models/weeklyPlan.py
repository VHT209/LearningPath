from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    String,
    CheckConstraint,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class WeeklyPlan(Base):
    """Still hasn't included topic, make sure to access topics from the relationship
    between the plan and learning_path when implementing endpoints"""

    __tablename__ = "weekly_plans"

    id = Column(Integer, primary_key=True, index=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    week_number = Column(
        Integer,
        CheckConstraint(
            "week_number >= 1 AND week_number <= 52", name="check_valid_week"
        ),
        nullable=False,
    )
    goal = Column(JSON)
    completion_status = Column(Boolean, default=False, nullable=False)
    plan_description = Column(String(1000))

    # Connect to the relationship in LearningPath
    learning_path = relationship("LearningPath", back_populates="weekly_plans")
    # cascade so deleting a weekly plan also removes its resources
    resources = relationship(
        "Resource", back_populates="weekly_plan", cascade="all, delete-orphan"
    )
