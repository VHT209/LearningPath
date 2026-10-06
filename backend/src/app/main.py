from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

from app.core.settings import settings
from app.core.database import Base, engine
import app.models
import logging
import time

from app.core.database import create_db_tb
from app.routes.user import api_router as user_router
from app.routes.learning_path import api_router as learning_path_router
from app.routes.weekly_plan import api_router as weekly_plan_router
from app.routes.resource import api_router as resource_router
from app.routes.health import api_router as health_router


app = FastAPI(
    title=settings.app_name,
    description="An API for generating a schedule for personal learning",
    version=settings.app_version,
)


#create database when real app start up
@app.on_event("startup")
def on_startup() -> None:
    create_db_tb()

# adding the user router to the main app
app.include_router(health_router)
app.include_router(user_router)
app.include_router(learning_path_router)
app.include_router(weekly_plan_router)
app.include_router(resource_router)

# configure CORRS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ],
    allow_credentials=True,
    # listing methods explicitly because "*" can break preflight on DELETE when allow_credentials is True
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
# Configure logging to output INFO level logs to the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Middleware that runs on every HTTP request
# Logs the method, path, status code, and response time for each request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)"
    )
    return response

