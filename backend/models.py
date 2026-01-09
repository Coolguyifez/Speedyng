from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    favorites: List[str] = []
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Car Models
class CarCreate(BaseModel):
    name: str
    category: str
    price: int
    condition: str
    location: str
    image: str
    images: List[str]
    year: int
    mileage: str
    transmission: str
    fuel_type: str
    description: str
    features: List[str]
    verified: bool = True


class CarUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[int] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    year: Optional[int] = None
    mileage: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    verified: Optional[bool] = None


class CarResponse(BaseModel):
    id: str
    name: str
    category: str
    price: int
    condition: str
    location: str
    image: str
    images: List[str]
    year: int
    mileage: str
    transmission: str
    fuel_type: str
    description: str
    features: List[str]
    verified: bool
    created_at: datetime
    updated_at: datetime


# Contact Models
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str


class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    message: str
    status: str
    created_at: datetime


# Chat Models
class ChatMessage(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str


class MessageHistory(BaseModel):
    role: str
    content: str
    timestamp: datetime


class ChatSessionResponse(BaseModel):
    session_id: str
    messages: List[MessageHistory]
    created_at: datetime


# Stats Models
class StatsResponse(BaseModel):
    total_cars: int
    brand_new: int
    foreign_used: int
    nigerian_used: int
    categories_count: int


class CategoryResponse(BaseModel):
    name: str
    count: int
