# backend/schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# -------------------- User Schemas --------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    favorites: List[int] = []
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------- Token Schema --------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# -------------------- Car Schemas --------------------
class CarBase(BaseModel):
    name: str
    category: str
    price: int
    condition: str
    location: str
    image: Optional[str] = None
    images: Optional[List[str]] = []
    year: Optional[int] = None
    mileage: Optional[int] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = []

class CarCreate(CarBase):
    pass

class CarUpdate(BaseModel):
    name: Optional[str]
    category: Optional[str]
    price: Optional[int]
    condition: Optional[str]
    location: Optional[str]
    image: Optional[str]
    images: Optional[List[str]]
    year: Optional[int]
    mileage: Optional[int]
    transmission: Optional[str]
    fuel_type: Optional[str]
    description: Optional[str]
    features: Optional[List[str]]
    verified: Optional[bool]

class CarResponse(CarBase):
    id: int
    verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# -------------------- Contact Schemas --------------------
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(ContactCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------- Chat Schemas --------------------
class ChatMessage(BaseModel):
    sender: str
    content: str
    timestamp: datetime

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    messages: List[ChatMessage]
    created_at: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    session_id: int
    message: ChatMessage

class MessageHistory(BaseModel):
    messages: List[ChatMessage]

# -------------------- Stats & Category Schemas --------------------
class StatsResponse(BaseModel):
    total_users: int
    total_cars: int
    total_sales: int

class CategoryResponse(BaseModel):
    name: str
    count: int
    icon: str
