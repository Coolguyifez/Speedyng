import os
import httpx
import logging
import json 
import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from urllib.parse import quote
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, Body, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text

import resend
import cloudinary
import cloudinary.uploader
# Import shared components
from seed import seed_database # Import your seed function
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

# -------------------- Cloudinary Configuration --------------------
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

# --- CRITICAL FIX: Ensure static directories exist before mounting ---
UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Secure CORS configuration for Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://speedy-bsvq.onrender.com",
        "https://speedy-backend-fb9s.onrender.com",
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
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Speedy Password Reset</title>
      <style>
        :root {{
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }}
        /* Forces Dark Mode users to see a dark background but keeps our card white or legible */
        @media (prefers-color-scheme: dark) {{
          .email-body {{ background-color: #1a1a1a !important; }}
          .email-card {{ background-color: #2d2d2d !important; border-color: #444444 !important; }}
          .text-main {{ color: #ffffff !important; }}
          .text-muted {{ color: #a1a1a1 !important; }}
        }}
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;" class="email-body">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <div class="email-card" style="font-family: Arial, sans-serif; max-width: 600px; width: 100%; border: 1px solid #eeeeee; padding: 40px; border-radius: 12px; background-color: #ffffff; text-align: center;">
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 25px;">
                    <img src="https://i.imgur.com/niaQKv1.png" width="80" height="80" alt="Speedy Logo" style="display: block; border: 0;">
                  </td>
                </tr>
              </table>
              
              <h2 class="text-main" style="color: #111827; font-size: 24px; margin: 0 0 20px 0;">Password Reset</h2>
              
              <div class="text-main" style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                <p>Hello User,</p>
                <p>We received a request to reset your password for <strong>Speedy Auto Broker Hub</strong>. Click the button below to choose a new one.</p>
              </div>
    
              <div style="margin: 35px 0;">
                <a href="{reset_link}" style="background-color: #dc2626; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Reset Password
                </a>
              </div>
    
              <p class="text-muted" style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                If you didn't request this, you can safely ignore this email. This link expires in 30 minutes.
              </p>
            </div>
    
            <div class="text-muted" style="text-align: center; color: #9ca3af; font-size: 12px; font-family: Arial, sans-serif; padding-top: 20px;">
                © 2026 Speedy Auto Broker Hub.
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
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


        # -------------------- Helper Functions --------------------

async def upload_to_cloudinary(file: UploadFile, folder: str = "speedy"):
    """Helper to upload files directly to Cloudinary and return the secure URL"""
    try:
        # Seek to the beginning of the file to ensure we read everything
        file.file.seek(0)
        
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"speedy/{folder}",
            resource_type="auto"
        )
        # We return the secure_url which starts with https://
        return result.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary Upload Failed: {e}")
        return None


def get_cloudinary_public_id(url: str):
    """
    Extracts the public_id from a Cloudinary URL.
    Input: https://res.cloudinary.com/demo/image/upload/v1/speedy/main/car.jpg
    Output: speedy/main/car
    """
    if not url or "res.cloudinary.com" not in url:
        return None
    
    try:
        # 1. Split by 'upload/' to get the path after the base URL
        parts = url.split('upload/')
        if len(parts) < 2:
            return None
        
        # 2. Remove the versioning (the part starting with 'v' followed by numbers)
        path_parts = parts[1].split('/')
        if path_parts[0].startswith('v') and path_parts[0][1:].isdigit():
            path_parts = path_parts[1:]
            
        # 3. Join back and strip the file extension (.jpg, .png, etc)
        public_id_with_ext = "/".join(path_parts)
        public_id = public_id_with_ext.rsplit('.', 1)[0]
        return public_id
    except Exception as e:
        logger.error(f"Failed to extract Public ID: {e}")
        return None

async def delete_from_cloudinary(url: str):
    """Utility to delete image from Cloudinary by its URL"""
    public_id = get_cloudinary_public_id(url)
    if public_id:
        try:
            # Simple direct call to the Cloudinary SDK
            cloudinary.uploader.destroy(public_id)
            logger.info(f"Cloudinary Deleted: {public_id}")
        except Exception as e:
            logger.error(f"Cloudinary Destruction Error: {e}")
        
    
# Helper to serialize vehicle data for the frontend
# Added .isoformat() to prevent JSON 500 errors
def serialize_vehicle(v):
    return {
        "id": v.id, "name": v.name, "type": v.type, "service": v.service,
        "category": v.category, "price": v.price, "condition": v.condition,
        "location": v.location, "acceleration": v.acceleration, "color": v.color,
        "make": v.make, "model": v.model, "owner_name": v.owner_name,
        "address": v.address, "phone_number": v.phone_number, "image": v.image,
        "images": v.images or [], "features": v.features or [], "year": v.year,
        "mileage": v.mileage, "transmission": v.transmission, "fuel_type": v.fuel_type,
        "description": v.description, "verified": v.verified,
        "created_at": v.created_at.isoformat() if v.created_at else None,
        "updated_at": v.updated_at.isoformat() if v.updated_at else None
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
# -------------------- reset route database --------------------
@app.get("/api/admin/reset-db-secret-99")
async def reset_database():
    try:
        async with engine.begin() as conn:
            # This wipes everything!
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        
        # Now run your seed script logic
        await seed_database()
        return {"status": "success", "message": "Database wiped and re-seeded!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
        

# -------------------- Vehicle Routes (Public) --------------------
@api_router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    category: Optional[str] = Query(None),
    v_type: Optional[str] = Query(None, alias="type"),
    service: Optional[str] = Query(None),
    make: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Vehicle)
    if category: query = query.filter(Vehicle.category == category)
    if v_type: query = query.filter(Vehicle.type == v_type)
    if service: query = query.filter(Vehicle.service == service)
    if make: query = query.filter(Vehicle.make == make)
    
    result = await db.execute(query.order_by(Vehicle.id.desc()))
    return [serialize_vehicle(v) for v in result.scalars().all()]

@api_router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    name: str = Form(...), 
    type: str = Form("Car"), 
    price: int = Form(...),
    category: str = Form("Sedan"), 
    location: str = Form("Lagos"),
    year: int = Form(2026),
    description: str = Form(""),
    features: str = Form("[]"),
    image: Optional[UploadFile] = File(None), 
    images: Optional[List[UploadFile]] = File(None), # FIXED: Optional to prevent 422
    db: AsyncSession = Depends(get_db), 
    current_admin: User = Depends(get_current_admin)
):
    # Upload main image
    main_url = await upload_to_cloudinary(image, "main_images") if image else "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"
    
    # Upload gallery images
    gallery = []
    if images:
        for img in images:
            if img.filename:
                url = await upload_to_cloudinary(img, "gallery")
                if url: gallery.append(url)

    try: f_list = json.loads(features)
    except: f_list = []

    new_v = Vehicle(
        name=name, type=type, price=price, category=category, location=location,
        year=year, description=description, features=f_list, 
        image=main_url, images=gallery, verified=True
    )
    db.add(new_v)
    await db.commit()
    await db.refresh(new_v)
    return serialize_vehicle(new_v)

@api_router.put("/vehicles/{v_id}", response_model=VehicleResponse)
async def update_vehicle(
    v_id: int,
    name: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == v_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle: raise HTTPException(status_code=404, detail="Vehicle not found")

    # FIXED: Only update if the value is not an empty string (prevents accidental wiping)
    if name and name.strip(): vehicle.name = name
    if price and price.strip(): vehicle.price = int(float(price))
    if category and category.strip(): vehicle.category = category
    if description and description.strip(): vehicle.description = description
    
    if features and features.strip():
        try: vehicle.features = json.loads(features)
        except: pass

    # Handle New Image Overwrites
    if image and image.filename:
        url = await upload_to_cloudinary(image, "main_images")
        if url: vehicle.image = url

    # Append to existing gallery
    if images:
        current_gallery = list(vehicle.images or [])
        for img in images:
            if img.filename:
                url = await upload_to_cloudinary(img, "gallery")
                if url: current_gallery.append(url)
        vehicle.images = current_gallery

    await db.commit()
    await db.refresh(vehicle)
    return serialize_vehicle(vehicle)
    

@api_router.delete("/vehicles/{v_id}")
async def delete_vehicle(
    v_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == v_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Clean up Main Image
    if vehicle.image:
        await delete_from_cloudinary(vehicle.image)

    # Clean up Gallery Images (stored as a list of URLs)
    if vehicle.images:
        for img_url in vehicle.images:
            await delete_from_cloudinary(img_url)

    await db.delete(vehicle)
    await db.commit()
    return {"message": "Vehicle and all assets deleted from Cloudinary and DB."}

@api_router.get("/vehicles/{v_id}", response_model=VehicleResponse)
async def get_vehicle(v_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).filter(Vehicle.id == v_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        logger.error(f"Vehicle with ID {v_id} not found in database.")
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    return serialize_vehicle(vehicle)

    
    

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

# Static files for uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

BUILD_DIR = os.path.join(os.getcwd(), "frontend", "dist")
if os.path.exists(os.path.join(BUILD_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(BUILD_DIR, "assets")), name="assets")

@app.get("/{catchall:path}")
async def serve_react_app(catchall: str):
    if catchall.startswith("api"): raise HTTPException(status_code=404)
    index_path = os.path.join(BUILD_DIR, "index.html")
    if os.path.exists(index_path): return FileResponse(index_path)
    return {"message": "Speedy API running. Frontend not found."}

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database synced withwith Cloudinary integration.")


@app.get("/")
async def root():
    return {"message": "Speedy Vehicle Dealership API", "status": "running"}
