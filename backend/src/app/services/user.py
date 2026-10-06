from app.core.auth import get_password_hash
from app.repository.user import UserRepository
from sqlalchemy.orm import Session
from app.utils.email import normalize_email

from app.schemas.user import UserDB, UserCreate, UserResponse, UserUpdate
from fastapi import HTTPException, status

from app.core.auth import verify_password, verify_token
from app.core.auth import oauth2_scheme
from app.core.database import get_db
from fastapi import Depends
from typing import Annotated


class UserService:
    """Service class for user-related operations."""

    def __init__(self) -> None:
        """Initialize the UserService with a UserRepository instance."""
        self.repository = UserRepository()

    """Get functions or Read functions"""

    def get_by_mail(self, db: Session, email: str) -> UserResponse | None:
        user_email = self.repository.get_by_mail(db, email)
        if user_email is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user_email

    def get_by_id(self, db: Session, user_id: int) -> UserResponse | None:
        user_id = self.repository.get_by_id(db, user_id)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user_id

    def is_email_taken(self, db: Session, email: str) -> bool:
        """Check if a user with the given email already exists in the database."""
        return self.repository.get_by_mail(db, email) is not None

    def is_username_taken(self, db: Session, username: str) -> bool:
        """Check if a user with the given username already exists in the database."""
        return self.repository.get_by_username(db, username) is not None

    def get_current_user(
        self,
        db: Annotated[Session, Depends(get_db)],
        token: Annotated[str, Depends(oauth2_scheme)],
    ) -> UserResponse | None:
        """Get the current user based on the provided access token."""
        payload = verify_token(token)
        # Extract the user ID from the token payload and retrieve the user from the database
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # extract the token version from the token payload
        token_version = payload.get("token_version")
        if token_version is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = self.repository.get_by_id(db, int(user_id))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        if user.token_version != token_version:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    """Post functions or Create functions"""

    def register_user(self, db: Session, user_db: UserCreate) -> UserResponse:
        """Register a new user.
        create a new user in the database with validation.

        Arguments:
            db: Database session
            user_db: User creation data

        Returns:
            UserResponse: The created user.

        Raises:
            HTTPException: If the username or email is already exists.
        """

        # making sure to normalize email so emails with stuff like . and + would count as same for google, stops waht professor was talking about 
        normalized_email = normalize_email(user_db.email)

        if self.is_email_taken(db, normalized_email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        if self.is_username_taken(db, user_db.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        # Hash the password before creating the user
        hashed_password = get_password_hash(user_db.password)
        user_db = UserDB(
            username=user_db.username,
            email=normalized_email,
            hashed_password=hashed_password,
        )
        return self.repository.create_user(db, user_db)

    def authenticate(
        self, db: Session, email: str, password: str
    ) -> UserResponse | None:
        """Authenticate user with email and password.

        Arguments:
            db: Database session
            email: User's email
            password: User's plaintext password
        Returns:
            UserResponse | None: The authenticated user if credentials are valid, None otherwise.
        """
        normalized_email = normalize_email(email)
        user = self.repository.get_by_mail(db, normalized_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not verify_password(password, str(user.hashed_password)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return user

    # Update User by provide hashed password, email, username. Only update the field that is provided by the user, if not provided, keep the old value.
    def update_user(
        self, db: Session, db_user: UserResponse, user_db: UserUpdate
    ) -> UserResponse:
        """Update an existing user in the database."""
        if user_db.username:
            db_user.username = user_db.username
        if user_db.email:
            db_user.email = normalize_email(user_db.email)
        if user_db.password:
            db_user.hashed_password = get_password_hash(user_db.password)
        return self.repository.update_user(db, db_user)

    def revoke_tokens(self, db: Session, db_user: UserResponse) -> UserResponse:
        """Revoke all existing tokens for a user by incrementing the token version."""
        return self.repository.token_revoke(db, db_user)


user_service = UserService()
