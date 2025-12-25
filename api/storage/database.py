"""
Database connection management for Goblin Assistant
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from contextlib import asynccontextmanager
from typing import AsyncGenerator

# Get database URL from environment or use local sqlite fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./goblin_assistant.db")

# Fix for Heroku/Supabase postgres URLs if they start with postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif (
    DATABASE_URL
    and DATABASE_URL.startswith("postgresql://")
    and not DATABASE_URL.startswith("postgresql+asyncpg://")
):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Handle sslmode parameter for PostgreSQL connections
connect_args = {}
if DATABASE_URL and "postgresql" in DATABASE_URL:
    from urllib.parse import urlparse, parse_qs

    parsed = urlparse(DATABASE_URL)
    query_params = parse_qs(parsed.query)
    if "sslmode" in query_params:
        sslmode = query_params["sslmode"][0]
        connect_args["ssl"] = sslmode
        # Remove sslmode from URL as it's now in connect_args
        DATABASE_URL = DATABASE_URL.split("?")[0]

# Security: Ensure sensitive information is not logged
if "password" in DATABASE_URL.lower():
    print(
        "WARNING: Database URL contains password. Ensure this is not logged in production."
    )

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    # Use NullPool for PostgreSQL to avoid connection pooler issues
    poolclass=NullPool if "postgresql" in DATABASE_URL else None,
    # Use connect_args for PostgreSQL SSL configuration
    connect_args=connect_args,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional scope around a series of operations."""
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def init_db():
    """Initialize database tables"""
    try:
        from .models import Base

        async with engine.begin() as conn:
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
        return True
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("   Continuing without database - some features may be limited")
        return False
