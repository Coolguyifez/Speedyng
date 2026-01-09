from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    CarCreate, CarUpdate, CarResponse,
    ContactCreate, ContactResponse,
    ChatMessage, ChatResponse, ChatSessionResponse, MessageHistory,
    StatsResponse, CategoryResponse
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_admin
)
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Speedy Car Dealership API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ Helper Functions ============
def serialize_doc(doc):
    """Convert MongoDB document to dict with string ID"""
    if doc:
        doc['id'] = str(doc['_id'])
        doc.pop('_id', None)
    return doc


# ============ Authentication Routes ============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
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
    
    result = await db.users.insert_one(user_doc)
    user_doc['_id'] = result.inserted_id
    
    # Create token
    token_data = {"sub": user_data.email, "role": "user"}
    access_token = create_access_token(token_data)
    
    user_response = UserResponse(
        id=str(result.inserted_id),
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role="user",
        favorites=[],
        created_at=user_doc['created_at']
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token_data = {"sub": credentials.email, "role": user['role']}
    access_token = create_access_token(token_data)
    
    user_response = UserResponse(
        id=str(user['_id']),
        name=user['name'],
        email=user['email'],
        phone=user['phone'],
        role=user['role'],
        favorites=[str(fav) for fav in user.get('favorites', [])],
        created_at=user['created_at']
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"email": current_user['sub']})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user['_id']),
        name=user['name'],
        email=user['email'],
        phone=user['phone'],
        role=user['role'],
        favorites=[str(fav) for fav in user.get('favorites', [])],
        created_at=user['created_at']
    )


# ============ Car Routes (Public) ============
@api_router.get("/cars", response_model=List[CarResponse])
async def get_cars(
    category: Optional[str] = None,
    location: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=100)
):
    query = {}
    
    if category:
        query['category'] = category
    if location:
        query['location'] = location
    if condition:
        query['condition'] = condition
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    if search:
        query['name'] = {'$regex': search, '$options': 'i'}
    
    cars = await db.cars.find(query).limit(limit).to_list(limit)
    return [CarResponse(**serialize_doc(car)) for car in cars]


@api_router.get("/cars/featured", response_model=List[CarResponse])
async def get_featured_cars():
    cars = await db.cars.find().limit(6).to_list(6)
    return [CarResponse(**serialize_doc(car)) for car in cars]


@api_router.get("/cars/{car_id}", response_model=CarResponse)
async def get_car(car_id: str):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=400, detail="Invalid car ID")
    
    car = await db.cars.find_one({"_id": ObjectId(car_id)})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return CarResponse(**serialize_doc(car))


# ============ Car Routes (Admin) ============
@api_router.post("/cars", response_model=CarResponse)
async def create_car(car_data: CarCreate, current_admin: dict = Depends(get_current_admin)):
    car_doc = car_data.dict()
    car_doc['created_at'] = datetime.utcnow()
    car_doc['updated_at'] = datetime.utcnow()
    
    result = await db.cars.insert_one(car_doc)
    car_doc['_id'] = result.inserted_id
    
    return CarResponse(**serialize_doc(car_doc))


@api_router.put("/cars/{car_id}", response_model=CarResponse)
async def update_car(car_id: str, car_data: CarUpdate, current_admin: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=400, detail="Invalid car ID")
    
    update_data = {k: v for k, v in car_data.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.cars.find_one_and_update(
        {"_id": ObjectId(car_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return CarResponse(**serialize_doc(result))


@api_router.delete("/cars/{car_id}")
async def delete_car(car_id: str, current_admin: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=400, detail="Invalid car ID")
    
    result = await db.cars.delete_one({"_id": ObjectId(car_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return {"message": "Car deleted successfully"}


# ============ Favorites Routes ============
@api_router.get("/favorites", response_model=List[CarResponse])
async def get_favorites(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"email": current_user['sub']})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorite_ids = [ObjectId(fav_id) for fav_id in user.get('favorites', [])]
    cars = await db.cars.find({"_id": {"$in": favorite_ids}}).to_list(100)
    
    return [CarResponse(**serialize_doc(car)) for car in cars]


@api_router.post("/favorites/{car_id}")
async def add_favorite(car_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=400, detail="Invalid car ID")
    
    car = await db.cars.find_one({"_id": ObjectId(car_id)})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    await db.users.update_one(
        {"email": current_user['sub']},
        {"$addToSet": {"favorites": ObjectId(car_id)}}
    )
    
    return {"message": "Car added to favorites"}


@api_router.delete("/favorites/{car_id}")
async def remove_favorite(car_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=400, detail="Invalid car ID")
    
    await db.users.update_one(
        {"email": current_user['sub']},
        {"$pull": {"favorites": ObjectId(car_id)}}
    )
    
    return {"message": "Car removed from favorites"}


# ============ Contact Routes ============
@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(contact_data: ContactCreate):
    contact_doc = contact_data.dict()
    contact_doc['status'] = 'pending'
    contact_doc['created_at'] = datetime.utcnow()
    
    result = await db.contacts.insert_one(contact_doc)
    contact_doc['_id'] = result.inserted_id
    
    return ContactResponse(**serialize_doc(contact_doc))


@api_router.get("/contact", response_model=List[ContactResponse])
async def get_contacts(current_admin: dict = Depends(get_current_admin)):
    contacts = await db.contacts.find().to_list(100)
    return [ContactResponse(**serialize_doc(contact)) for contact in contacts]


# ============ AI Chat Routes ============
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_data: ChatMessage):
    try:
        # Initialize Gemini chat
        system_message = """You are Speedy Assist, an AI car advisor for Speedy Car Dealership in Nigeria.
        
Your role:
- Help users find cars based on their budget and preferences
- Answer questions about car features, fuel efficiency, and maintenance
- Recommend the best cars for Nigerian roads (consider ground clearance, durability)
- Compare different vehicles when asked
- Guide users to contact an agent (08154675347) or book an inspection
- Be friendly, professional, and trustworthy

Available car categories:
- Sedans (Toyota Camry, Honda Accord, Hyundai Elantra)
- SUVs (Toyota Prado, Lexus RX)
- Trucks & Pickups (Toyota Hilux, Ford Ranger)
- Luxury Cars (Mercedes-Benz, BMW, Audi)
- Budget Cars (Affordable options for first-time buyers)
- Foreign Used and Brand New vehicles

Locations: Lagos, Abuja, Port Harcourt, Benin

Always be helpful and encourage users to call 08154675347 or chat for more details."""

        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=chat_data.session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.5-pro")
        
        user_message = UserMessage(text=chat_data.message)
        response = await chat.send_message(user_message)
        
        # Store message in database
        await db.chat_sessions.update_one(
            {"session_id": chat_data.session_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "content": chat_data.message, "timestamp": datetime.utcnow()},
                            {"role": "assistant", "content": response, "timestamp": datetime.utcnow()}
                        ]
                    }
                },
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        return ChatResponse(response=response, session_id=chat_data.session_id)
    
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")


@api_router.get("/chat/{session_id}", response_model=ChatSessionResponse)
async def get_chat_history(session_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    messages = [MessageHistory(**msg) for msg in session.get('messages', [])]
    return ChatSessionResponse(
        session_id=session_id,
        messages=messages,
        created_at=session['created_at']
    )


# ============ Stats & Categories Routes ============
@api_router.get("/stats", response_model=StatsResponse)
async def get_stats():
    total_cars = await db.cars.count_documents({})
    brand_new = await db.cars.count_documents({"condition": "Brand New"})
    foreign_used = await db.cars.count_documents({"condition": "Foreign Used"})
    nigerian_used = await db.cars.count_documents({"condition": "Nigerian Used"})
    
    categories = await db.cars.distinct("category")
    
    return StatsResponse(
        total_cars=total_cars,
        brand_new=brand_new,
        foreign_used=foreign_used,
        nigerian_used=nigerian_used,
        categories_count=len(categories)
    )


@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$project": {"name": "$_id", "count": 1, "_id": 0}}
    ]
    
    categories = await db.cars.aggregate(pipeline).to_list(100)
    return [CategoryResponse(**cat) for cat in categories]


# ============ Root Route ============
@api_router.get("/")
async def root():
    return {"message": "Speedy Car Dealership API", "status": "running"}


# Include the router in the main app
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