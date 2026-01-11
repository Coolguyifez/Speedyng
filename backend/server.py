import os
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from auth import ( 
    get_password_hash, verify_password, create_access_token, get_current_user, get_current_admin
)
from models import Base, User, Car, Contact, ChatSession
from database import Base, engine, get_db
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    CarCreate, CarUpdate, CarResponse,
    ContactCreate, ContactResponse,
    ChatMessage, ChatResponse, ChatSessionResponse, MessageHistory,
    StatsResponse, CategoryResponse
)
# -------------------- App Setup --------------------
app = FastAPI(title="Speedy Car Dealership API")

# REMOVED: prefix="/api" here because your frontend api.js 
# already adds '/api' to the base URL.
api_router = APIRouter()

# UPDATED: Secure CORS configuration for Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://speedyng.onrender.com", # Your frontend URL
        "http://localhost:3000"           # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)


# -------------------- Helper --------------------
def serialize_car(car: Car):
    return CarResponse(
        id=car.id,
        name=car.name,
        category=car.category,
        price=car.price,
        condition=car.condition,
        location=car.location,
        image=car.image,
        images=car.images,
        year=car.year,
        mileage=car.mileage,
        transmission=car.transmission,
        fuel_type=car.fuel_type,
        description=car.description,
        features=car.features,
        verified=car.verified,
        created_at=car.created_at,
        updated_at=car.updated_at
    )


# -------------------- Auth Routes --------------------
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password=get_password_hash(user_data.password),
        role="user"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token_data = {"sub": user.email, "role": "user"}
    access_token = create_access_token(token_data)

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        favorites=[],
        created_at=user.created_at
    )
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(token_data)

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        favorites=user.favorites or [],
        created_at=user.created_at
    )
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == current_user['sub']))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        favorites=user.favorites or [],
        created_at=user.created_at
    )


# -------------------- Car Routes --------------------
@api_router.get("/cars", response_model=List[CarResponse])
async def get_cars(
    category: Optional[str] = None,
    location: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Car)
    if category:
        query = query.filter(Car.category == category)
    if location:
        query = query.filter(Car.location == location)
    if condition:
        query = query.filter(Car.condition == condition)
    if min_price is not None:
        query = query.filter(Car.price >= min_price)
    if max_price is not None:
        query = query.filter(Car.price <= max_price)
    if search:
        query = query.filter(Car.name.ilike(f"%{search}%"))

    result = await db.execute(query.limit(limit))
    cars = result.scalars().all()
    return [serialize_car(car) for car in cars]


@api_router.post("/cars", response_model=CarResponse)
async def create_car(car_data: CarCreate, current_admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    car = Car(**car_data.dict())
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return serialize_car(car)


@api_router.put("/cars/{car_id}", response_model=CarResponse)
async def update_car(car_id: int, car_data: CarUpdate, current_admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).filter(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    for key, value in car_data.dict(exclude_unset=True).items():
        setattr(car, key, value)
    car.updated_at = datetime.utcnow()
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return serialize_car(car)


@api_router.delete("/cars/{car_id}")
async def delete_car(car_id: int, current_admin: dict = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).filter(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    await db.delete(car)
    await db.commit()
    return {"message": "Car deleted successfully"}


# -------------------- Include Router --------------------
app.include_router(api_router)

# -------------------- Root --------------------
@app.get("/")
async def root():
    return {"message": "Speedy Car Dealership API", "status": "running"}


# -------------------- Create tables --------------------
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/ready")
