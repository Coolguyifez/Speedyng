"""
Seed script to populate PostgreSQL database with initial data
"""
import asyncio
from datetime import datetime
from auth import get_password_hash
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal
from models import User, Car

async def seed_database():
    async with AsyncSessionLocal() as session:
        print("Starting database seeding...")

        # ----------------- Admin user -----------------
        result = await session.execute(select(User).where(User.email == "admin@speedy.ng"))
        admin_exists = result.scalars().first()
        if not admin_exists:
            admin_user = User(
                name="Admin User",
                email="admin@speedy.ng",
                phone="08154675347",
                password=get_password_hash("admin123"),
                role="admin",
                favorites=[]
            )
            session.add(admin_user)
            await session.commit()
            print("✓ Admin user created (email: admin@speedy.ng, password: admin123)")
        else:
            print("✓ Admin user already exists")

        # ----------------- Test user -----------------
        result = await session.execute(select(User).where(User.email == "user@test.com"))
        user_exists = result.scalars().first()
        if not user_exists:
            test_user = User(
                name="Test User",
                email="user@test.com",
                phone="08123456789",
                password=get_password_hash("password123"),
                role="user",
                favorites=[]
            )
            session.add(test_user)
            await session.commit()
            print("✓ Test user created (email: user@test.com, password: password123)")
        else:
            print("✓ Test user already exists")

        # ----------------- Cars -----------------
        result = await session.execute(select(Car))
        car_count = len(result.scalars().all())
        if car_count == 0:
            cars = [
                Car(
                    name="Toyota Camry 2024",
                    category="Sedans",
                    price=18500000,
                    condition="Foreign Used",
                    location="Lagos",
                    image="https://images.pexels.com/photos/33693281/pexels-photo-33693281.jpeg",
                    images=[
                        "https://images.pexels.com/photos/33693281/pexels-photo-33693281.jpeg",
                        "https://images.pexels.com/photos/28688908/pexels-photo-28688908.jpeg"
                    ],
                    year=2024,
                    mileage="15,000 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Clean foreign used Toyota Camry with full options. Perfect condition, accident-free.",
                    features=["Leather Seats", "Sunroof", "Navigation System", "Backup Camera", "Bluetooth"],
                    verified=True
                ),
                Car(
                    name="Honda Accord 2023",
                    category="Sedans",
                    price=16800000,
                    condition="Foreign Used",
                    location="Abuja",
                    image="https://images.pexels.com/photos/16350067/pexels-photo-16350067.jpeg",
                    images=[
                        "https://images.pexels.com/photos/16350067/pexels-photo-16350067.jpeg",
                        "https://images.pexels.com/photos/6128305/pexels-photo-6128305.jpeg"
                    ],
                    year=2023,
                    mileage="22,000 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Excellent Honda Accord in pristine condition. Well maintained with service history.",
                    features=["Apple CarPlay", "Lane Assist", "Cruise Control", "Keyless Entry"],
                    verified=True
                ),
                Car(
                    name="Toyota Prado 2022",
                    category="SUVs",
                    price=42000000,
                    condition="Brand New",
                    location="Lagos",
                    image="https://images.pexels.com/photos/34166836/pexels-photo-34166836.jpeg",
                    images=[
                        "https://images.pexels.com/photos/34166836/pexels-photo-34166836.jpeg",
                        "https://images.pexels.com/photos/34166839/pexels-photo-34166839.jpeg"
                    ],
                    year=2022,
                    mileage="0 km",
                    transmission="Automatic",
                    fuel_type="Diesel",
                    description="Brand new Toyota Prado. Perfect for Nigerian roads with exceptional off-road capability.",
                    features=["4WD", "Leather Interior", "7 Seats", "Premium Sound System", "Climate Control"],
                    verified=True
                ),
                Car(
                    name="Lexus RX 350 2023",
                    category="SUVs",
                    price=38500000,
                    condition="Foreign Used",
                    location="Port Harcourt",
                    image="https://images.pexels.com/photos/15011309/pexels-photo-15011309.jpeg",
                    images=[
                        "https://images.pexels.com/photos/15011309/pexels-photo-15011309.jpeg",
                        "https://images.pexels.com/photos/1005632/pexels-photo-1005632.jpeg"
                    ],
                    year=2023,
                    mileage="18,000 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Luxury SUV in excellent condition. Smooth ride with premium features.",
                    features=["Panoramic Sunroof", "Mark Levinson Sound", "Adaptive Cruise", "Heated Seats"],
                    verified=True
                ),
                Car(
                    name="Mercedes-Benz C300 2023",
                    category="Luxury",
                    price=45000000,
                    condition="Foreign Used",
                    location="Lagos",
                    image="https://images.unsplash.com/photo-1485291571150-772bcfc10da5",
                    images=["https://images.unsplash.com/photo-1485291571150-772bcfc10da5"],
                    year=2023,
                    mileage="12,000 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Sophisticated Mercedes-Benz with cutting-edge technology and luxury.",
                    features=["AMG Package", "Burmester Sound", "Massage Seats", "Night Vision"],
                    verified=True
                ),
                Car(
                    name="BMW M3 2022",
                    category="Luxury",
                    price=52000000,
                    condition="Brand New",
                    location="Abuja",
                    image="https://images.unsplash.com/photo-1601929862217-f1bf94503333",
                    images=["https://images.unsplash.com/photo-1601929862217-f1bf94503333"],
                    year=2022,
                    mileage="0 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="High-performance luxury sedan with incredible power and style.",
                    features=["M Sport Package", "Carbon Fiber Trim", "Performance Brakes", "Track Mode"],
                    verified=True
                ),
                Car(
                    name="Toyota Hilux 2023",
                    category="Trucks",
                    price=28000000,
                    condition="Brand New",
                    location="Lagos",
                    image="https://images.pexels.com/photos/937668/pexels-photo-937668.jpeg",
                    images=["https://images.pexels.com/photos/937668/pexels-photo-937668.jpeg"],
                    year=2023,
                    mileage="0 km",
                    transmission="Automatic",
                    fuel_type="Diesel",
                    description="Rugged and reliable pickup truck. Perfect for business and personal use.",
                    features=["4x4", "Tow Package", "Bed Liner", "Heavy Duty Suspension"],
                    verified=True
                ),
                Car(
                    name="Ford Ranger 2022",
                    category="Trucks",
                    price=24500000,
                    condition="Foreign Used",
                    location="Benin",
                    image="https://images.pexels.com/photos/10842901/pexels-photo-10842901.jpeg",
                    images=["https://images.pexels.com/photos/10842901/pexels-photo-10842901.jpeg"],
                    year=2022,
                    mileage="25,000 km",
                    transmission="Automatic",
                    fuel_type="Diesel",
                    description="Powerful Ford Ranger with excellent capabilities. Well maintained.",
                    features=["Crew Cab", "Tonneau Cover", "Off-Road Tires", "Rear Diff Lock"],
                    verified=True
                ),
                Car(
                    name="Hyundai Elantra 2024",
                    category="Budget",
                    price=8500000,
                    condition="Brand New",
                    location="Lagos",
                    image="https://images.unsplash.com/photo-1748214547306-360d11024747",
                    images=["https://images.unsplash.com/photo-1748214547306-360d11024747"],
                    year=2024,
                    mileage="0 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Affordable and reliable sedan. Perfect for first-time car buyers.",
                    features=["Fuel Efficient", "Modern Design", "Safety Features", "Warranty"],
                    verified=True
                ),
                Car(
                    name="Fiat 500 2021",
                    category="Budget",
                    price=6200000,
                    condition="Foreign Used",
                    location="Abuja",
                    image="https://images.pexels.com/photos/7469142/pexels-photo-7469142.jpeg",
                    images=["https://images.pexels.com/photos/7469142/pexels-photo-7469142.jpeg"],
                    year=2021,
                    mileage="32,000 km",
                    transmission="Automatic",
                    fuel_type="Petrol",
                    description="Compact and economical car. Great for city driving.",
                    features=["Excellent Fuel Economy", "Easy Parking", "Low Maintenance"],
                    verified=True
                )
            ]
            session.add_all(cars)
            await session.commit()
            print(f"✓ {len(cars)} cars added to database")
        else:
            print(f"✓ Database already has {car_count} cars")

        print("\n✅ Database seeding completed!")
        print("\nLogin credentials:")
        print("  Admin: admin@speedy.ng / admin123")
        print("  User:  user@test.com / password123")


if __name__ == "__main__":
    asyncio.run(seed_database())
