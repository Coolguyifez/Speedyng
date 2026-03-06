# backend/schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# -------------------- User Schemas --------------------

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordSubmit(BaseModel):
    token: str
    new_password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    favorites: List[int] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------- Token Schema --------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# -------------------- Vehicle Schemas --------------------
class VehicleBase(BaseModel):
    name: str
    type: str        
    service: str 
    category: str
    price: int
    condition: str
    location: str
    acceleration: Optional[float] = None
    color: Optional[str] = None
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    owner_name: Optional[str] = None
    address: Optional[str] = None       
    phone_number: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = []
    year: Optional[int] = None
    mileage: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = []
    verified: Optional[bool] = False

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] 
    type: Optional[str]        
    service: Optional[str] 
    category: Optional[str] 
    price: Optional[int]
    condition: Optional[str] 
    location: Optional[str] 
    acceleration: Optional[float] 
    color: Optional[str]
    vin: Optional[str]
    make: Optional[str] 
    model: Optional[str] 
    owner_name: Optional[str]
    address: Optional[str]    
    phone_number: Optional[str] 
    image: Optional[str]
    images: Optional[List[str]]
    year: Optional[int]
    mileage: Optional[str]
    transmission: Optional[str]
    fuel_type: Optional[str]
    description: Optional[str]
    features: Optional[List[str]]
    verified: Optional[bool]

class VehicleResponse(VehicleBase):
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
    phone: str # Updated from 'subject' to match models.py
    message: str

class ContactResponse(ContactCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------- Chat Schemas --------------------
# Updated to match the storage needs of Speedy Assist
class ChatMessageCreate(BaseModel):
    sender: str # 'user' or 'bot'
    content: str   # Renamed from 'content' to match frontend logic
    timestamp: Optional[datetime] = None

class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class MessageHistory(BaseModel):
    messages: List[ChatMessageResponse]

# -------------------- Stats & Category Schemas --------------------
class StatsResponse(BaseModel):
    total_users: int
    total_vehicles: int
    total_sales: int

class CategoryResponse(BaseModel):
    name: str
    count: int
    icon: str
