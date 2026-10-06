# importing from sqlalchemy the data types and things needed for the model
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func, UniqueConstraint

# links between all the models made
from sqlalchemy.orm import relationship

from app.core.database import Base


# model named LearningPath
class LearningPath(Base):
    __tablename__ = "learning_paths"

    # combo of user_id and topic has to be unique, cant have the same user id and same topic
    __table_args__ = (
        UniqueConstraint("user_id", "topic", name="uq_user_topic"),
    )

    # new column named ID, primary key for learning path -> auto increment comes with primary key and every column is required by default
    id = Column(Integer, primary_key=True, index=True)

    # user id thats considered the foreign key -> points to users.id which is primary key of users, nullable = false makes it required
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # setting it for now to a max of 30 characters for topic and making sure its unique and required
    topic = Column(String(30), nullable=False)

    # still debating on using this one
    proficency = Column(String, nullable=True)

    # optional also, using JSON for the array of strings
    learning_type = Column(JSON, nullable=True)

    # taking care of the min and max cojnstraint within the schema
    weeks = Column(Integer, nullable=False)

    # this will make sure that when created it will set the time to what it currently is
    created_at = Column(DateTime, server_default=func.now())

    # connecting back and matching to the relationship called in User.py
    user = relationship("User", back_populates="learning_paths")

    # cascade so deleting a learning path also removes its weekly plans (and their resources)
    weekly_plans = relationship(
        "WeeklyPlan", back_populates="learning_path", cascade="all, delete-orphan"
    )
