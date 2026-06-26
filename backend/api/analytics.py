"""
analytics.py — API Endpoints for dashboard metrics.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_db
from models import Request
from logger.event_logger import EventLogger

router = APIRouter()

@router.get("/analytics")
async def get_analytics_endpoint(
    days: int = Query(7, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    logger = EventLogger(db)
    return await logger.get_analytics(days=days)


@router.get("/dashboard")
async def get_dashboard_endpoint(db: AsyncSession = Depends(get_db)):
    logger = EventLogger(db)
    
    # We could fetch 24h, 7d, 30d here. For simplicity based on PRD, 
    # we'll fetch 7d analytics and append the recent blocked requests.
    analytics = await logger.get_analytics(days=7)
    
    # Fetch recent blocked
    stmt = (
        select(Request)
        .where(Request.decision == "block")
        .order_by(desc(Request.timestamp))
        .limit(10)
    )
    result = await db.execute(stmt)
    recent_blocked = result.scalars().all()
    
    analytics["recent_blocked"] = [r.to_dict() for r in recent_blocked]
    
    return analytics
