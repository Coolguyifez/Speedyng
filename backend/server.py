import os
import httpx
import logging
import json 
import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from urllib.parse import quote
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text

import resend

# Import shared components
from database import get_db, engine, Base
from models import User, Vehicle, Contact, ChatMessage
from auth import ( 
    get_password_hash, verify_password, create_access_token,  
    get_current_user, get_current_admin
)
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse, ForgotPasswordRequest, ResetPasswordSubmit,
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
        "https://speedy-bsvq.onrender.com",
        "http://localhost:3000", # Common for React local dev
        "http://localhost:5173"  # Common for Vite local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Email Setup (Resend) --------------------
resend.api_key = os.getenv("RESEND_API_KEY")

async def send_reset_email(email_to: str, reset_link: str):
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center">
                    <div style="position: relative; display: inline-block; width: 54px; height: 54px;">
                        <div style="width: 48px; height: 48px; background-color: #dc2626; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #ffffff; font-weight: bold; font-size: 24px; font-family: Arial, sans-serif;">S</span>
                        </div>
                        <div style="position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; background-color: #000000; border-radius: 50%; border: 2px solid #ffffff;">
                            <table width="100%" height="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" valign="middle">
                                        <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <h2 style="text-align: center;">Password Reset</h2>
        <p>Hello User,</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    try:
        # Note: 'from' must be 'onboarding@resend.dev' on the Free Tier
        params = {
            "from": "Speedy Support <onboarding@resend.dev>",
            "to": [email_to],
            "subject": "Speedy - Reset Your Password",
            "html": html_content,
        }
        resend.Emails.send(params)
        logger.info(f"Resend Success: Reset email triggered for {email_to}")
    except Exception as e:
        logger.error(f"Resend Error: {str(e)}")
        raise e
    
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
    
    # Ensure there are exactly 4 spaces before 'if'
    if not user:
        user = User(
            name=name, 
            email=email, 
            role="user", 
            password=get_password_hash(f"SOCIAL_AUTH_{provider.upper()}_{email}"),
           
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# -------------------- Auth Routes --------------------

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generates a reset token and simulates sending an email"""
    # Use request.email instead of just email
    result = await db.execute(select(User).filter(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "If this email is registered, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)

    await db.commit()

    reset_link = f"https://speedy-bsvq.onrender.com/reset-password?token={token}"

    try:
        await send_reset_email(user.email, reset_link)
        return {"message": "Reset link sent successfully."}
    except Exception:
        logger.info(f"BACKUP RESET PASSWORD LINK: {reset_link}")
        raise HTTPException(status_code=500, detail="Mail not sent")


@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordSubmit, db: AsyncSession = Depends(get_db)):
    """Verifies the token and updates the password"""
    result = await db.execute(
        select(User).filter(
            User.reset_token == data.token, # Use data.token
            User.reset_token_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Use data.new_password
    user.password = get_password_hash(data.new_password)
    user.reset_token = None 
    user.reset_token_expires = None
    
    await db.commit()
    return {"message": "Password updated successfully. You can now login."}


# -------------------- Social Callback Routes --------------------

@api_router.get("/auth/google/callback") 
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    try: 
        async with httpx.AsyncClient() as client:
            res = await client.post("https://oauth2.googleapis.com/token", data={
                "code": code,
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
                "grant_type": "authorization_code",
            })
            token_data = res.json()
            if res.status_code != 200:
                logger.error(f"Google Token Exchange Failed: {token_data}")
                raise HTTPException(status_code=400, detail="Auth failed")

            profile_res = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo", 
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            data = profile_res.json()
            
        auth_data = await handle_social_user(db, data['email'], data.get('name', 'Speedy Agent'), "google")
        
        user_info = {
            "id": auth_data['user'].id,
            "name": auth_data['user'].name,
            "email": auth_data['user'].email,
            "role": auth_data['user'].role
        }
        user_json = quote(json.dumps(user_info))
        token = auth_data['access_token']
        
        frontend_url = "https://speedy-bsvq.onrender.com/auth/callback/google"
        return RedirectResponse(url=f"{frontend_url}?token={token}&user={user_json}")

    except Exception as e:
        logger.error(f"Callback Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@api_router.get("/auth/facebook/callback")
async def facebook_callback(code: str, db: AsyncSession = Depends(get_db)):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get("https://graph.facebook.com/v12.0/oauth/access_token", params={
                "client_id": os.getenv("FB_CLIENT_ID"),
                "client_secret": os.getenv("FB_CLIENT_SECRET"),
                "redirect_uri": os.getenv("FB_REDIRECT_URI"),
                "code": code,
            })
            fb_token = res.json().get('access_token')
            if not fb_token:
                raise HTTPException(status_code=400, detail="Facebook auth failed")

            profile = await client.get(f"https://graph.facebook.com/me?fields=email,name&access_token={fb_token}")
            data = profile.json()
        
        auth_data = await handle_social_user(db, data['email'], data.get('name', 'Speedy Agent'), "facebook")
        
        user_info = {"id": auth_data['user'].id, "name": auth_data['user'].name, "email": auth_data['user'].email, "role": auth_data['user'].role}
        user_json = quote(json.dumps(user_info))
        token = auth_data['access_token']
        
        frontend_url = "https://speedy-bsvq.onrender.com/auth/callback/facebook"
        return RedirectResponse(url=f"{frontend_url}?token={token}&user={user_json}")
    except Exception as e:
        logger.error(f"Facebook Callback Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Facebook Auth Failed")

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

BUILD_DIR = os.path.join(os.getcwd(), "frontend", "dist")

# Mount Static Assets (CSS/JS)
if os.path.exists(os.path.join(BUILD_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(BUILD_DIR, "assets")), name="assets")

@app.get("/{catchall:path}")
async def serve_react_app(catchall: str):
    # Don't let the catchall swallow missing API calls
    if catchall.startswith("api"):
        raise HTTPException(status_code=404)
        
    index_path = os.path.join(BUILD_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Speedy API is running. Frontend build not found."}

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/ready")
 
            
            

@app.get("/")
async def root():
    return {"message": "Speedy Vehicle Dealership API", "status": "running"}
