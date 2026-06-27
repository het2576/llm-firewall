"""
logs.py — API Endpoints for retrieving request logs.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Request
from logger.event_logger import EventLogger

router = APIRouter()

@router.get("/logs")
async def get_logs_endpoint(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    decision: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    logger = EventLogger(db)
    result = await logger.get_logs(page=page, limit=limit, decision=decision)
    
    # We want to truncate prompts for the list view
    for req in result["requests"]:
        if req["prompt"] and len(req["prompt"]) > 200:
            req["prompt"] = req["prompt"][:197] + "..."
            
    return result


@router.get("/logs/{request_id}")
async def get_log_detail_endpoint(request_id: str, db: AsyncSession = Depends(get_db)):
    try:
        req_uuid = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID format")
        
    stmt = select(Request).where(Request.id == req_uuid)
    result = await db.execute(stmt)
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return request.to_dict()
