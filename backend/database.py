"""
database.py — Async SQLAlchemy engine, session factory, and Base declarative.
Uses asyncpg for PostgreSQL in production, aiosqlite for SQLite in development.
Compatible with Python 3.9+
"""
from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from config import get_settings

settings = get_settings()

# Build engine kwargs — SQLite needs check_same_thread disabled
_extra_kwargs = {}
if "sqlite" in settings.DATABASE_URL:
    _extra_kwargs["connect_args"] = {"check_same_thread": False}

# --- Engine -----------------------------------------------------------
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    pool_pre_ping=True,
    **_extra_kwargs,
)

# --- Session Factory --------------------------------------------------
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# --- Base ORM class ---------------------------------------------------
class Base(DeclarativeBase):
    pass


# --- FastAPI Dependency -----------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields an async DB session per request.
    Usage:  db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
