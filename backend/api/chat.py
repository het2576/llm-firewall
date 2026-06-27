"""
chat.py — API Endpoints for chat and firewall testing.
"""
import uuid
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from database import get_db
from models import Request
from firewall.firewall import LLMSecurityFirewall
from config import get_settings

settings = get_settings()
router = APIRouter()

# Instantiate the firewall orchestrator
firewall = LLMSecurityFirewall()

# Set up Gemini model for chat responses
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
chat_model = genai.GenerativeModel(
    "gemini-2.5-flash",
    system_instruction="You are a helpful AI assistant. Answer the user's question clearly and concisely."
)

from typing import Optional, List

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=8000)
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: Optional[str]
    blocked: bool
    decision: str
    threat_score: int
    request_id: str
    triggered_detectors: List[str]
    warning_message: Optional[str] = None

class FeedbackRequest(BaseModel):
    request_id: str
    is_false_positive: bool

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    # 1. Process prompt through firewall
    result = await firewall.process(req.prompt, req.user_id, db)
    
    # 2. Handle blocked prompts
    if result.blocked:
        return ChatResponse(
            response=None,
            blocked=True,
            decision="block",
            threat_score=result.threat_score,
            request_id=result.request_id,
            triggered_detectors=result.threat_assessment.triggered_detectors,
            warning_message="⛔ This message was blocked by the LLM Security Firewall due to detected malicious content."
        )
        
    # 3. Call Gemini if not blocked
    response_text = None
    try:
        llm_response = await chat_model.generate_content_async(result.final_prompt)
        response_text = llm_response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")
        
    # 4. Update the DB record with the response
    try:
        stmt = (
            update(Request)
            .where(Request.id == uuid.UUID(result.request_id))
            .values(response=response_text)
        )
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        # We don't fail the request if logging the response fails
        print(f"Failed to update request with response: {e}")
        
    # Build a descriptive warning/info message
    warning_message = None
    if result.decision == "warn":
        warning_message = "⚠️ This prompt triggered security alerts but was allowed through."
    elif result.decision == "sanitize":
        changes = result.sanitization_result.changes_made if result.sanitization_result else []
        changes_str = "; ".join(changes) if changes else "malicious content removed"
        warning_message = f"🔧 Prompt sanitized before processing — {changes_str}."

    return ChatResponse(
        response=response_text,
        blocked=False,
        decision=result.decision,
        threat_score=result.threat_score,
        request_id=result.request_id,
        triggered_detectors=result.threat_assessment.triggered_detectors,
        warning_message=warning_message,
    )

@router.post("/analyze")
async def analyze_endpoint(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Analyze a prompt without consuming LLM tokens for a response."""
    result = await firewall.process(req.prompt, req.user_id, db)
    
    # Convert dataclasses to dict manually since pydantic models aren't defined for them yet
    # or just return the assessment dict
    import dataclasses
    return dataclasses.asdict(result.threat_assessment)

@router.post("/sanitize")
async def sanitize_endpoint(req: ChatRequest):
    """Sanitize a prompt directly."""
    result = firewall.sanitizer.sanitize(req.prompt)
    import dataclasses
    return dataclasses.asdict(result)

@router.post("/feedback")
async def feedback_endpoint(req: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """Mark a request as a false positive."""
    from logger.event_logger import EventLogger
    logger = EventLogger(db)
    success = await logger.mark_false_positive(req.request_id)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"ok": True}
