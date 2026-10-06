from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    # rule setup so that the same URL cant appear within the same week in the weeklyplan
    __table_args__ = (UniqueConstraint("weeklyplan_id", "url"),)

    # id thats an integer and the pruimary key
    id = Column(Integer, primary_key=True, index=True)

    # waiting for weekly plan name
    weeklyplan_id = Column(Integer, ForeignKey("weekly_plans.id"), nullable=False)

    # type of resouce that is chosen earlier, make sure that it is required
    resource_type = Column(String, nullable=False)

    # summary of what the resource is giving, maxing out at 300 characters
    resource_summary = Column(String(300), nullable=False)

    # URL link for the resource that is given to you
    url = Column(String(2000), nullable=False)

    # relationship with weeklyplan, one resource per weekly plan so singular, many resources in a weekly plan so back_populates is resources
    weekly_plan = relationship("WeeklyPlan", back_populates="resources")
