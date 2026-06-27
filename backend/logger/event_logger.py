"""
event_logger.py — Logs every firewall event to the database.
"""
import uuid
import datetime
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
import sqlalchemy as sa

try:
    from models import Request, Detection
    from scoring.threat_scorer import ThreatAssessment
    from sanitizer.input_sanitizer import SanitizationResult
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from models import Request, Detection
    from scoring.threat_scorer import ThreatAssessment
    from sanitizer.input_sanitizer import SanitizationResult


class EventLogger:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    async def log_request(
        self,
        prompt: str,
        threat_assessment: ThreatAssessment,
        sanitization_result: Optional[SanitizationResult],
        response: Optional[str],
        user_id: Optional[str]
    ) -> str:
        
        request_id = uuid.uuid4()
        
        # Create Request ORM object
        request_record = Request(
            id=request_id,
            user_id=user_id,
            prompt=prompt,
            sanitized_prompt=sanitization_result.sanitized_prompt if sanitization_result and sanitization_result.was_modified else None,
            response=response,
            threat_score=threat_assessment.threat_score,
            decision=threat_assessment.decision,
            processing_time=threat_assessment.processing_time_ms,
            is_false_positive=False
        )
        
        self.db.add(request_record)
        
        # Create Detection ORM objects
        detections = []
        for det in threat_assessment.detections:
            # matched_pattern could be a list, store it as string
            matched_pattern = det.get("matched_pattern")
            if isinstance(matched_pattern, list):
                matched_pattern = ", ".join(matched_pattern)
                
            detection_record = Detection(
                request_id=request_id,
                detector_name=det.get("detector_name", "unknown"),
                confidence=det.get("confidence"),
                score_contribution=det.get("score_contribution"),
                matched_pattern=matched_pattern,
                category=det.get("category")
            )
            detections.append(detection_record)
            
        if detections:
            self.db.add_all(detections)
            
        await self.db.commit()
        return str(request_id)

    async def mark_false_positive(self, request_id: str) -> bool:
        try:
            req_uuid = uuid.UUID(request_id)
            stmt = select(Request).where(Request.id == req_uuid)
            result = await self.db.execute(stmt)
            request = result.scalar_one_or_none()
            
            if request:
                request.is_false_positive = True
                await self.db.commit()
                return True
            return False
        except ValueError:
            return False

    async def get_logs(self, page: int = 1, limit: int = 50, decision: Optional[str] = None) -> Dict[str, Any]:
        offset = (page - 1) * limit
        
        # Base query
        stmt = select(Request).order_by(desc(Request.timestamp))
        count_stmt = select(func.count(Request.id))
        
        if decision:
            stmt = stmt.where(Request.decision == decision)
            count_stmt = count_stmt.where(Request.decision == decision)
            
        stmt = stmt.offset(offset).limit(limit)
        
        # Execute queries
        requests_result = await self.db.execute(stmt)
        requests = requests_result.scalars().all()
        
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar()
        
        return {
            "requests": [r.to_dict() for r in requests],
            "total": total,
            "page": page
        }

    async def get_analytics(self, days: int = 7) -> Dict[str, Any]:
        IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)

        stmt = select(Request).where(Request.timestamp >= cutoff_date)
        result = await self.db.execute(stmt)
        requests = result.scalars().all()

        total = len(requests)
        blocked = sum(1 for r in requests if r.decision == "block")
        sanitized = sum(1 for r in requests if r.decision == "sanitize")
        warned = sum(1 for r in requests if r.decision == "warn")
        safe = sum(1 for r in requests if r.decision == "allow")

        avg_score = sum(r.threat_score for r in requests) / total if total > 0 else 0

        by_type: Dict[str, int] = {}
        by_hour: Dict[str, int] = {}
        by_day: Dict[str, int] = {}

        for r in requests:
            # Convert stored timestamp to IST (assume UTC if naive)
            ts = r.timestamp
            if ts and ts.tzinfo is None:
                ts = ts.replace(tzinfo=datetime.timezone.utc)
            ts_ist = ts.astimezone(IST) if ts else None

            if ts_ist:
                day_str = ts_ist.strftime("%Y-%m-%d")
                by_day[day_str] = by_day.get(day_str, 0) + 1

                hour_str = ts_ist.strftime("%H:00")
                by_hour[hour_str] = by_hour.get(hour_str, 0) + 1

            for d in r.detections:
                if d.category and d.category != "safe":
                    by_type[d.category] = by_type.get(d.category, 0) + 1

        # Always return all 24 IST hours so the chart is never a single spike
        by_hour_arr = [
            {"hour": f"{h:02d}:00", "count": by_hour.get(f"{h:02d}:00", 0)}
            for h in range(24)
        ]
        by_day_arr = [{"date": k, "count": v} for k, v in sorted(by_day.items())]
        
        return {
            "summary": {
                "total": total,
                "safe": safe,
                "warned": warned,
                "sanitized": sanitized,
                "blocked": blocked,
                "avg_threat_score": round(avg_score, 1),
                "block_rate_percent": round((blocked / total) * 100, 1) if total > 0 else 0
            },
            "by_attack_type": by_type,
            "by_hour": by_hour_arr,
            "by_day": by_day_arr,
            "top_patterns": []  # Requires more complex aggregation
        }
