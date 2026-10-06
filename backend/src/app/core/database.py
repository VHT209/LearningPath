from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.settings import settings


# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
# Professor example using TYPE_CHECKING, but it cause error in our code
# Need to know if we need to use TYPE_CHECKING or not
from collections.abc import Generator

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args=(
        {"check_same_thread": False}
        if settings.database_url.startswith("sqlite")
        else {}
    ),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Function to create the database
#putting it here since it will cause problem if it's in main
#for pytest, where app.main hit main database too early
def create_db_tb() -> None:
    Base.metadata.create_all(bind=engine)