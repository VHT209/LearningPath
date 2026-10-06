import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "postgresql+psycopg://learning_app:12345678@localhost:5432/learning_paths_test"

# Settings now refuses to start without DATABASE_URL; the test suite drives
# the DB through the fixtures below, so make that env var present on import.
os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)

from app.main import app
from app.core.database import Base, get_db

""" Shared fixtures for all tests in this folder. Pytest automatically loads this file
so db and client are available in every test file without importing them. """

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)
