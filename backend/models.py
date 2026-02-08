from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from database import Base



# ================== User Model ==================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    favorites = Column(ARRAY(Integer), default=[])  # stores car IDs
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
    price = Column(Integer, nullable=False)
    condition = Column(String(50), nullable=False)  # Brand New / Foreign Used / Nigerian Used
    location = Column(String(50), nullable=False)
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


# ================== Contact Model ==================
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, resolved
    created_at = Column(DateTime, default=datetime.utcnow)

# ================== AI Chat Message Model ==================
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    sender = Column(String(20), nullable=False)  # 'user' or 'bot'
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", backref="chat_messages")
