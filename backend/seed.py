"""
Seed script to populate PostgreSQL database with initial data
"""
import asyncio
import os
import logging
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

# Import your shared project components
from database import AsyncSessionLocal, engine, Base
from models import User, Vehicle, ChatMessage
from auth import get_password_hash

# Setup basic logging for the seed process
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_database():
    logger.info("Connecting to database for seeding...")
    async with AsyncSessionLocal() as session:
        # 1. Ensure tables exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # ----------------- INITIALIZATION CHECK -----------------
        # We check for the Admin. If the Admin exists, it means the 
        # system has been seeded before. We will NOT add cars again.
        admin_email = "infospeedyng360@gmail.com"
        admin_check = await session.execute(select(User).where(User.email == admin_email))
        admin_exists = admin_result.scalar_one_or_none()

        if not admin_exists:
            users_to_create = [
                {
                    "name": "Admin User",
                    "email": "infospeedyng360@gmail.com",
                    "phone": "08135877104",
                    "password": "admin123",
                    "role": "admin"
                },
                {
                    "name": "Test User",
                    "email": "user@test.com",
                    "phone": "08123456789",
                    "password": "password123",
                    "role": "user"
                }
            ]

            for u_data in users_to_create:
                new_user = User(
                    name=u_data["name"],
                    email=u_data["email"],
                    phone=u_data["phone"],
                    password=get_password_hash(u_data["password"]),
                    role=u_data["role"],
                    favorites=[]
                )
                session.add(new_user)
                logger.info(f"✓ Created {u_data['role']}: {u_data['email']}")
            await session.commit()
        else:
            logger.info("✓ Users already initialized.")

        # ----------------- Vehicles -----------------
        # Use a count check to prevent ResourceClosedError
        count_stmt = await session.execute(select(func.count()).select_from(Vehicle))
        vehicle_count = count_stmt.scalar()
        
        if vehicle_count == 0:
            vehicles = [
                Vehicle(
                    name="Toyota Camry 2024",
                    make= "Toyota", model= "Camry",
                    type="Car", service="For Sale", # FIXED
                    category="Sedans", price=18500000,
                    condition="Foreign Used", location="Lagos", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="123 Lekki Phase 1, Lagos",
                    phone_number="08135877104",
                    image="https://images.pexels.com/photos/33693281/pexels-photo-33693281.jpeg",
                    images=["https://images.pexels.com/photos/33693281/pexels-photo-33693281.jpeg", "https://images.pexels.com/photos/28688908/pexels-photo-28688908.jpeg"],
                    year=2024, mileage="15,000 km", transmission="Automatic",
                    fuel_type="Petrol", description="Clean foreign used Toyota Camry.",
                    features=["Leather Seats", "Sunroof"], verified=True
                ),
                Vehicle(
                    name="Honda Accord 2023",
                    make= "Honda", model= "Accord",
                    type="Car", service="For Sale", # FIXED
                    category="Sedans", price=16800000,
                    condition="Foreign Used", location="Abuja", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="Abuja,Nigeria", phone_number="08135877104",
                    image="https://images.pexels.com/photos/16350067/pexels-photo-16350067.jpeg",
                    images=["https://images.pexels.com/photos/16350067/pexels-photo-16350067.jpeg"],
                    year=2023, mileage="22,000 km", transmission="Automatic",
                    fuel_type="Petrol", description="Excellent Honda Accord.",
                    features=["Apple CarPlay", "Lane Assist"], verified=True
                ),
                Vehicle(
                    name="Toyota Prado 2022",
                    make= "Toyota", model= "Prado",
                    type="Car", service="For Sale", # FIXED
                    category="SUV", price=42000000,
                    condition="Brand New", location="Lagos", acceleration= "7.2", color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="123 Lekki Phase 1, Lagos",
                    phone_number="08135877104",
                    image="https://images.pexels.com/photos/34166836/pexels-photo-34166836.jpeg",
                    images=["https://images.pexels.com/photos/34166836/pexels-photo-34166836.jpeg"],
                    year=2022, mileage="0 km", transmission="Automatic",
                    fuel_type="Diesel", description="Brand new Toyota Prado.",
                    features=["4WD", "7 Seats"], verified=True
                ),
                Vehicle(
                    name="Lexus RX 350 2023", make= "Lexus", model= "Rx 350",
                    type="car", service="For Sale", # FIXED
                    category="SUV", price=38500000,
                    condition="Foreign Used", location="Port Harcourt", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", phone_number="08135877104",
                    image="https://images.pexels.com/photos/15011309/pexels-photo-15011309.jpeg",
                    images=["https://images.pexels.com/photos/15011309/pexels-photo-15011309.jpeg"],
                    year=2023, mileage="18,000 km", transmission="Automatic",
                    fuel_type="Petrol", description="Luxury SUV condition.",
                    features=["Panoramic Sunroof"], verified=True
                ),
                Vehicle(
                    name="Mercedes-Benz C300 2023", make= "Mercedes-Benz", model= "C300",
                    type="Car", service="For Sale", # FIXED
                    category="Sedan", price=45000000,
                    condition="Foreign Used", location="Lagos", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="123 Lekki Phase 1, Lagos",
                    phone_number="08135877104",
                    image="https://images.unsplash.com/photo-1485291571150-772bcfc10da5",
                    images=["https://images.unsplash.com/photo-1485291571150-772bcfc10da5"],
                    year=2023, mileage="12,000 km", transmission="Automatic",
                    fuel_type="Petrol", description="Sophisticated Mercedes.",
                    features=["AMG Package"], verified=True
                ),
                Vehicle(
                    name="Toyota Hilux 2023",
                    make= "Toyota", model= "Hilux",
                    type="Pickup", service="For Sale", # FIXED
                    category="Trucks", price=28000000,
                    condition="Brand New", location="Lagos", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="123 Lekki Phase 1, Lagos",
                    phone_number="08135877104",
                    image="https://images.pexels.com/photos/937668/pexels-photo-937668.jpeg",
                    images=["https://images.pexels.com/photos/937668/pexels-photo-937668.jpeg"],
                    year=2023, mileage="0 km", transmission="Automatic",
                    fuel_type="Diesel", description="Rugged pickup truck.",
                    features=["4x4", "Tow Package"], verified=True
                ),
                Vehicle(
                    name="Hyundai Elantra 2024",
                    make= "Hyundai", model= "Elantra",
                    type="car", service="For Sale", # FIXED
                    category="Budget", price=8500000,
                    condition="Brand New", location="Lagos",  acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="123 Lekki Phase 1, Lagos",
                    phone_number="08135877104",
                    image="https://images.unsplash.com/photo-1748214547306-360d11024747",
                    images=["https://images.unsplash.com/photo-1748214547306-360d11024747"],
                    year=2024, mileage="0 km", transmission="Automatic",
                    fuel_type="Petrol", description="Affordable sedan.",
                    features=["Fuel Efficient"], verified=True
                ),
                Vehicle(
                    name="Fiat 500 2021",
                    make= "Fiat", model= "500",
                    type="Car", service="For Sale", # FIXED
                    category="Budget", price=6200000,
                    condition="Foreign Used", location="Abuja", acceleration= 7.2, color= "Pearl White",
                    owner_name="Speedy Official Dealer", address="Abuja,Nigeria", phone_number="08135877104",
                    image="https://images.pexels.com/photos/7469142/pexels-photo-7469142.jpeg",
                    images=["https://images.pexels.com/photos/7469142/pexels-photo-7469142.jpeg"],
                    year=2021, mileage="32,000 km", transmission="Automatic",
                    fuel_type="Petrol", description="Compact city car.",
                    features=["Low Maintenance"], verified=True
                )
            ]
            session.add_all(vehicles)
            await session.commit()
            logger.info(f"✓ {len(vehicles)} sample vehicles added successfully.")
        else:
            logger.info("✓ Vehicles already exist.")

        logger.info("✅ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
