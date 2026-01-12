import os
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Import shared components
from database import get_db, engine, Base
from models import User, Car, Contact, ChatSession
from auth import ( 
    get_password_hash, verify_password, create_access_token, 
    get_current_user, get_current_admin
)
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    CarCreate, CarUpdate, CarResponse,
    ContactCreate, ContactResponse,
    ChatMessage, ChatResponse, ChatSessionResponse, MessageHistory,
    StatsResponse, CategoryResponse
)

# -------------------- Logging Setup --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- App Setup --------------------
app = FastAPI(title="Speedy Car Dealership API")
api_router = APIRouter()

# Secure CORS configuration for Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://speedyng.onrender.com",
        "http://localhost:3000", # Common for React local dev
        "http://localhost:5173"  # Common for Vite local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Helper to serialize car data for the frontend
# Added .isoformat() to prevent JSON 500 errors
def serialize_car(car):
    return {
        "id": getattr(car, 'id', None),
        "name": getattr(car, 'name', 'Unknown'),
        "category": getattr(car, 'category', 'Uncategorized'),
        "price": getattr(car, 'price', 0),
        "condition": getattr(car, 'condition', 'Used'),
        "location": getattr(car, 'location', 'Unknown'),
        "image": getattr(car, 'image', ''),
        "images": getattr(car, 'images', []) or [],
        "year": getattr(car, 'year', None),
        "mileage": getattr(car, 'mileage', '0'),
        "transmission": getattr(car, 'transmission', 'Automatic'),
        "fuel_type": getattr(car, 'fuel_type', 'Petrol'),
        "description": getattr(car, 'description', ''),
        "features": getattr(car, 'features', []) or [],
        "verified": getattr(car, 'verified', False),
        "created_at": car.created_at.isoformat() if car.created_at else None,
        "updated_at": car.updated_at.isoformat() if car.updated_at else None
    }
    
# -------------------- Auth Routes --------------------
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password=get_password_hash(user_data.password),
        role="user"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email, "role": "user"})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": new_user
    }

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

# -------------------- Car Routes (Public) --------------------
@api_router.get("/cars", response_model=List[CarResponse])
async def get_cars(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    new_car = Car(**car_data.dict(), verified=True) 
    db.add(new_car)
    await db.commit()
    await db.refresh(new_car)
    return serialize_car(new_car)
    
    try:
        query = select(Car)
        if category:
            query = query.filter(Car.category == category)
        result = await db.execute(query)
        cars = result.scalars().all()
        return [serialize_car(car) for car in cars]
    except Exception as e:
        logger.error(f"Error fetching cars: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@api_router.get("/cars/{car_id}", response_model=CarResponse)
async def get_car(car_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).filter(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return serialize_car(car)

# -------------------- Car Management (Admin Only) --------------------
@api_router.post("/cars", response_model=CarResponse)
async def create_car(
    car_data: CarCreate, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    new_car = Car(**car_data.dict())
    db.add(new_car)
    await db.commit()
    await db.refresh(new_car)
    return serialize_car(new_car)

@api_router.put("/cars/{car_id}", response_model=CarResponse)
async def update_car(
    car_id: int, 
    car_data: CarUpdate, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Car).filter(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    for key, value in car_data.dict(exclude_unset=True).items():
        setattr(car, key, value)
    
    car.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(car)
    return serialize_car(car)

@api_router.delete("/cars/{car_id}")
async def delete_car(
    car_id: int, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Car).filter(Car.id == car_id))
    car = result.scalar_one_or_none()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    await db.delete(car)
    await db.commit()
    return {"message": "Car deleted successfully"}

# -------------------- Final Setup --------------------
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/ready")

@app.get("/")
async def root():
    return {"message": "Speedy Car Dealership API", "status": "running"}
