from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update, delete, func
from datetime import datetime
import os
import logging

from db import database, metadata, engine
from models import *
from auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_admin

metadata.create_all(engine)

app = FastAPI(title="Speedy Car Dealership API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ----------------- Startup / Shutdown -----------------
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# ----------------- Auth Routes -----------------
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    query = select(users).where(users.c.email == user_data.email)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "phone": user_data.phone,
        "password": hashed_password,
        "role": "user",
        "favorites": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    query = users.insert().values(**user_doc)
    user_id = await database.execute(query)
    user_doc["id"] = user_id

    token_data = {"sub": user_data.email, "role": "user"}
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_doc)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    query = select(users).where(users.c.email == credentials.email)
    user = await database.fetch_one(query)
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": credentials.email, "role": user['role']}
    access_token = create_access_token(token_data)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    query = select(users).where(users.c.email == current_user['sub'])
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

# ----------------- Car Routes -----------------
@api_router.get("/cars", response_model=list[CarResponse])
async def get_cars(
    category: str | None = None,
    location: str | None = None,
    condition: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    search: str | None = None,
    limit: int = Query(100, le=100)
):
    query = select(cars)
    if category:
        query = query.where(cars.c.category == category)
    if location:
        query = query.where(cars.c.location == location)
    if condition:
        query = query.where(cars.c.condition == condition)
    if min_price is not None:
        query = query.where(cars.c.price >= min_price)
    if max_price is not None:
        query = query.where(cars.c.price <= max_price)
    if search:
        query = query.where(cars.c.name.ilike(f"%{search}%"))

    query = query.limit(limit)
    result = await database.fetch_all(query)
    return [CarResponse(**car) for car in result]

@api_router.post("/cars", response_model=CarResponse)
async def create_car(car_data: CarCreate, current_admin: dict = Depends(get_current_admin)):
    car_doc = car_data.dict()
    car_doc['created_at'] = datetime.utcnow()
    car_doc['updated_at'] = datetime.utcnow()
    query = cars.insert().values(**car_doc)
    car_id = await database.execute(query)
    car_doc["id"] = car_id
    return CarResponse(**car_doc)

# ----------------- Include Router -----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
