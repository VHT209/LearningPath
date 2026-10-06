from sqlalchemy.orm import Session
from app.schemas.user import UserDB
from app.models.user import User


class UserRepository:
    """Repository class for user-related database operations."""

    "Read"

    @staticmethod
    def get_by_mail(db: Session, email: str) -> User | None:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> User | None:
        """Get a user by username."""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    "Create"

    @staticmethod
    def create_user(db: Session, user_db: UserDB) -> User:
        """Create a new user in the database.
        transfering the user data from the UserDB schema to the User model and saving it to the database."""
        db_user = User(
            username=user_db.username,
            email=user_db.email,
            hashed_password=user_db.hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    "Update"

    @staticmethod
    def update_user(db: Session, db_user: User) -> User:
        """Update an existing user in the database."""
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def token_revoke(db: Session, db_user: User) -> User:
        """Revoke all existing tokens for a user by incrementing the token version."""
        db_user.token_version += 1
        db.commit()
        db.refresh(db_user)
        return db_user

    "DELETE"

    @staticmethod
    def delete_user(db: Session, db_user: User) -> None:
        """Delete a user from the database."""
        db.delete(db_user)
        db.commit()
