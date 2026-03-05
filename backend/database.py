# backend/database.py
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Ensure the protocol is exactly this for Render
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://speedydb:H20p3tL2svSxecAf5fxS0S71nANq921g@dpg-d6kknas50q8c73e6aa3g-a.oregon-postgres.render.com/speedy_db_mlf1"
)

# 2. Async engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True, pool_pre_ping=True)

# 3. Async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# 4. Central Base - Models MUST import this from here
Base = declarative_base()

# 5. Dependency
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session  # Let FastAPI handle the cleanup
