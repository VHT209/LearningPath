"""User schemas.
This module defines Pydantic Schemas for user data validation and serialization.

Basically, the modeling of various response A user could do for a specific request.
"""

from pydantic import BaseModel, EmailStr
from pydantic import field_validator


class UserBase(BaseModel):
    """Base schema for user data.
    All user must have an email address.
    """

    username: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user.
    Only requires the email, username, and password fields, to create a new user.
    """

    password: str

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class UserDB(UserBase):
    """Schema for user data stored in the database.
    This schema includes the hashed password, which is not exposed to the client.
    """

    hashed_password: str


class UserResponse(UserBase):
    """Schema for user response.
    Two purposes for return id and email:
        1. Confirmation of the user creation for client.
        2. Using id for future reference, such as authentication or user management.
    Model config to allow communication between database and Pydantic.
    """

    id: int
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Schema for updating user information.
    This schema allows partial updates, where only the fields provided by the client will be updated.
    """

    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class Token(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str
