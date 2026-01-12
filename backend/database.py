# backend/database.py
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Ensure the protocol is exactly this for Render
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://auto:GmWWjA1MizxgRk00D749VwIZb6EP9BYG@dpg-d5gptj24d50c738j1u20-a.oregon-postgres.render.com/speedy_db_2wha"
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
