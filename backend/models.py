from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, ARRAY, Float
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from database import Base



# ================== User Model ==================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ================== Car Model ==================
class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    service = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False)
    vin = Column(String(50), nullable=True)
    price = Column(Integer, nullable=False)
    make = Column(String(50), nullable=True) 
    model = Column(String(50), nullable=True) 
    condition = Column(String(50), nullable=False)  
    location = Column(String(50), nullable=False)
    acceleration = Column(Float, nullable=True)  
    color = Column(String, nullable=True)
    owner_name = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)     
    phone_number = Column(String(20), nullable=True)
    image = Column(String(255), nullable=False)
    images = Column(ARRAY(String), default=[])
    year = Column(Integer, nullable=False)
    mileage = Column(String(50), nullable=False)
    transmission = Column(String(50), nullable=False)
    fuel_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    features = Column(ARRAY(String), default=[])
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ================== AI Chat Message Model ==================
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    sender = Column(String(20), nullable=False)  # 'user' or 'bot'
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", backref="chat_messages")

# ================== Favourite Model ==================
class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    # Links to the Agent/User
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Links to the specific Vehicle
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # CRITICAL: This ensures a user can't like the same car multiple times
    __table_args__ = (UniqueConstraint('user_id', 'vehicle_id', name='_user_vehicle_uc'),)
