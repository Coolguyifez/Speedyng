import os
import httpx
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from jose import jwt as apple_jwt
# Import shared components
from database import get_db, engine, Base
from models import User, Vehicle, Contact, ChatMessage
from auth import ( 
    get_password_hash, verify_password, create_access_token, 
    get_current_user, get_current_admin, generate_apple_client_secret
)
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    VehicleCreate, VehicleUpdate, VehicleResponse,  
    ContactCreate, ContactResponse,
    ChatMessageCreate, ChatMessageResponse, MessageHistory,
    StatsResponse, CategoryResponse
)
# -------------------- Logging Setup --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- App Setup --------------------
app = FastAPI(title="Speedy Vehicle Dealership API")
api_router = APIRouter()

# Secure CORS configuration for Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://speedyng-c5gq.onrender.com",
        "https://speedy-car-agent.vercel.app", # Vercel Production
        "http://localhost:3000", # Common for React local dev
        "http://localhost:5173"  # Common for Vite local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Helper to serialize vehicle data for the frontend
# Added .isoformat() to prevent JSON 500 errors
def serialize_vehicle(vehicle):
    return {
        "id": getattr(vehicle, 'id', None),
        "name": getattr(vehicle, 'name', 'Unknown'),
        "type": getattr(vehicle, 'type', 'Unknown'),
        "service": getattr(vehicle, 'service', 'Unknown'),
        "category": getattr(vehicle, 'category', 'Uncategorized'),
        "price": getattr(vehicle, 'price', 0),
        "condition": getattr(vehicle, 'condition', 'Used'),
        "location": getattr(vehicle, 'location', 'Unknown'),
        "acceleration": getattr(vehicle, 'acceleration', None), 
        "color": getattr(vehicle, 'color', 'Unknown'),
        "owner_name": getattr(vehicle, 'owner_name', ''),
        "address": getattr(vehicle, 'address', ''),          
        "phone_number": getattr(vehicle, 'phone_number', ''),
        "image": getattr(vehicle, 'image', ''),
        # Ensures these return [] if None to prevent .map() errors in React
        "images": getattr(vehicle, 'images', []) or [],
        "features": getattr(vehicle, 'features', []) or [],
        "year": getattr(vehicle, 'year', None),
        "mileage": getattr(vehicle, 'mileage', '0'),
        "transmission": getattr(vehicle, 'transmission', 'Automatic'),
        "fuel_type": getattr(vehicle, 'fuel_type', 'Petrol'),
        "description": getattr(vehicle, 'description', ''),
        "verified": getattr(vehicle, 'verified', False),
        # Convert datetime to ISO string for JSON compatibility
        "created_at": vehicle.created_at.isoformat() if hasattr(vehicle, 'created_at') and vehicle.created_at else None,
        "updated_at": vehicle.updated_at.isoformat() if hasattr(vehicle, 'updated_at') and vehicle.updated_at else None
    }



# -------------------- Social Auth Helper --------------------
async def handle_social_user(db: AsyncSession, email: str, name: str, provider: str):
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            name=name, email=email, role="user", 
            password=f"SOCIAL_AUTH_{provider.upper()}", # Safe placeholder
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

# -------------------- Social Callback Routes --------------------

@api_router.get("/auth/google/callback") 
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # 1. Exchange the code for an access token
        res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"), # This MUST match what's in Google Console
            "grant_type": "authorization_code",
        })
        
        token_data = res.json()
        if "error" in token_data:
            logger.error(f"Google Token Error: {token_data}")
            raise HTTPException(status_code=400, detail=token_data.get("error_description"))

        # 2. Get user info using the token
        profile = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo", 
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        data = profile.json()
        
    return await handle_social_user(db, data['email'], data.get('name', 'Speedy Agent'), "google")
    
@api_router.get("/auth/facebook/callback")
async def facebook_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        res = await client.get("https://graph.facebook.com/v12.0/oauth/access_token", params={
            "client_id": os.getenv("FB_CLIENT_ID"),
            "client_secret": os.getenv("FB_CLIENT_SECRET"),
            "redirect_uri": os.getenv("FB_REDIRECT_URI"),
            "code": code,
        })
        profile = await client.get(f"https://graph.facebook.com/me?fields=email,name&access_token={res.json()['access_token']}")
        data = profile.json()
    return await handle_social_user(db, data['email'], data['name'], "facebook")

@api_router.get("/auth/apple/callback")
async def apple_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        res = await client.post("https://appleid.apple.com/auth/token", data={
            "client_id": os.getenv("APPLE_SERVICE_ID"),
            "client_secret": generate_apple_client_secret(),
            "code": code,
            "grant_type": "authorization_code",
        })
        decoded = apple_jwt.get_unverified_claims(res.json().get("id_token"))
    return await handle_social_user(db, decoded['email'], "Apple User", "apple")

    
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

# -------------------- Vehicle Routes (Public) --------------------
@api_router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    category: Optional[str] = Query(None), # Handles ?type=Luxury Sedan
    v_type: Optional[str] = Query(None, alias="type"), # Handles ?type=Truck
    service: Optional[str] = Query(None),             # Handles ?service=Rent
    color: Optional[str] = Query(None),  
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(Vehicle)
        
        # 1. Filter by Category (e.g., Luxury Sedan, Compact SUV)
        if category:
            query = query.filter(Vehicle.category == category)
            
        # 2. Filter by Type (e.g., Car, Truck, Bus, Motorcycle)
        if v_type:
            query = query.filter(Vehicle.type == v_type)
            
        # 3. Filter by Service (e.g., Sales, Rent, Auction)
        if service:
            query = query.filter(Vehicle.service == service)
            
        # 4. Filter by Color (e.g., Black, Red, White)
        if color:
            query = query.filter(Vehicle.color.ilike(f"%{color}%"))    
            
        # Order by newest first so Speedy always looks fresh
        query = query.order_by(Vehicle.id.desc())
        
        result = await db.execute(query)
        vehicles = result.scalars().all()
        
        return [serialize_vehicle(v) for v in vehicles]
        
    except Exception as e:
        logger.error(f"Error fetching vehicles with filters: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# .......SINGLE Admin Vehicle Creation Route.................

@api_router.post("/vehicles", response_model=VehicleResponse)
async def create_Vehicle(
    vehicle_data: VehicleCreate, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Convert the incoming schema to a dictionary
        vehicle_dict = vehicle_data.dict()
        
        # 2. Remove 'verified' if it exists in the incoming data to avoid conflicts
        vehicle_dict.pop('verified', None)
        
        # 3. Create the Vehicle with the dictionary and explicitly set verified=True
        new_vehicle = Vehicle(**vehicle_dict, verified=True)
        
        db.add(new_vehicle)
        await db.commit()
        await db.refresh(new_vehicle)
        return serialize_vehicle(new_vehicle)
    except Exception as e:
        logger.error(f"Creation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))        

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return serialize_vehicle(vehicle)

# -------------------- Vehicle Management (Admin Only) --------------------

@api_router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int, 
    vehicle_data: VehicleUpdate, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for key, value in vehicle_data.dict(exclude_unset=True).items():
        setattr(vehicle, key, value)
    
    vehicle.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(vehicle)
    return serialize_vehicle(vehicle)

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int, 
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    await db.delete(vehicle)
    await db.commit()
    return {"message": "Vehicle deleted successfully"}
    

# -------------------- Chat Routes --------------------

@api_router.post("/chat/save")
async def save_chat_message(
    message_data: ChatMessageCreate, # Use the schema from schemas.py
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        new_msg = ChatMessage(
            user_id=current_user.id,
            text=message_data.content,
            sender=message_data.sender,
            timestamp=datetime.utcnow()
        )
        db.add(new_msg)
        await db.commit()
        await db.refresh(new_msg)
        return {"status": "saved"}
    except Exception as e:
        logger.error(f"Chat save error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{user_id}")
async def get_chat_history(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Security check: Users can only see their own history unless admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.timestamp.asc())
    )
    messages = result.scalars().all()
    return [{"sender": m.sender, "content": m.text, "timestamp": m.timestamp} for m in messages]
    

# -------------------- Final Setup --------------------
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/ready")
 
            
            

@app.get("/")
async def root():
    return {"message": "Speedy Vehicle Dealership API", "status": "running"}
