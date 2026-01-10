from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://auto:GmWWjA1MizxgRk00D749VwIZb6EP9BYG@dpg-d5gptj24d50c738j1u20-a.oregon-postgres.render.com/speedy_db_2wha")

# Get the database URL from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://username:password@localhost:5432/dbname"
)

# Create the SQLAlchemy engine
# psycopg2 is used here, works with Python 3.12
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # optional, helps keep connections alive
)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Dependency to get DB session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
