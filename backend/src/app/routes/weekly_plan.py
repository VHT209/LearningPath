# creates router, injects dependencies, gives you status codes
from fastapi import APIRouter, Depends, status

# database session types
from sqlalchemy.orm import Session

# function that provides the db connection
from app.core.database import get_db

# handles business logic
from app.services.weekly_plan import weekly_plan_service

# schemas for validation
from app.schemas.weeklyPlan import WeeklyPlanCreate, WeeklyPlanResponse

# authentication
from app.models.user import User as UserModel
from app.services.user import user_service

# general pattern: route takes your request and sends the response, not actually doing any of the work but hands it off
# service receives the request and does the business logic and validation of the response and handles problems
# schem defines whats allowed, tells you what data can be sent and waht the response looks like

# frontend sends request with data -> schema validates data -> route hands off to service -> service does work
# all endpoints for this fule start with weekly-plan, make this the prefix
api_router = APIRouter(prefix="/weekly-plans", tags=["weekly-plans"])


# this is for creating the weekly plan itself
# post req to weekly plans, response_model = WeeklyPlanResponse would tell fast api what the response would look like while status code tells us were creating something
@api_router.post(
    "/", response_model=WeeklyPlanResponse, status_code=status.HTTP_201_CREATED
)
def create_weekly_plan(
    # FastAPI reads request body and validates it using schema to make sure its fine
    data: WeeklyPlanCreate,
    # get db connection
    db: Session = Depends(get_db),
    # checks the user if they are logged in
    current_user: UserModel = Depends(user_service.get_current_user),
):

    # gives to service and returns the response
    return weekly_plan_service.create_weekly_plan(db, data)


# get all weekly plans for a learning path
# get req, url with path params, list of weekly plans that will be given
@api_router.get(
    "/learning-path/{learning_path_id}", response_model=list[WeeklyPlanResponse]
)
def get_all_weekly_plans(
    # takes the learning path id to get the weekly plans
    learning_path_id: int,
    # database connection and authentication again
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    # gives db and learning path to service so that all weekly plans can be returned back
    return weekly_plan_service.get_all_by_learning_path(db, learning_path_id)


# get req meant to get the specific details for the weekly plan you choose
@api_router.get("/{weekly_plan_id}", response_model=WeeklyPlanResponse)
def get_individual_weekly_plan(
    # specific weekly plan id used to view its info, gets matched with the path parameter in the URL
    weekly_plan_id: int,
    # same thing as others, database connection + authentication for user
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    # gets the specific week by id to return the info, if not return 404
    return weekly_plan_service.get_by_id(db, weekly_plan_id)


# put, updating the weekly plan give
@api_router.put("/{weekly_plan_id}", response_model=WeeklyPlanResponse)
def update_weekly_plan(
    weekly_plan_id: int,
    # request body, user sends what they want updated from a dictionary, changes variables like goal for example
    updates: dict,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    # passes database, week, and changes to service where it will apply these updates and give it back as a response
    return weekly_plan_service.update_weekly_plan(db, weekly_plan_id, updates)


# used for deleting a weekly plan
# 204 = success but nothing to send back
@api_router.delete("/{weekly_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weekly_plan(
    weekly_plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(user_service.get_current_user),
):
    # call service to do deletion then just return nothing
    weekly_plan_service.delete_weekly_plan(db, weekly_plan_id)

    # nothing to send back so ofc return nothing
    return None
