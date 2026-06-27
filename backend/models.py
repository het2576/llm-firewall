"""
models.py — SQLAlchemy ORM models.
Tables: requests, detections, users
Compatible with Python 3.9+
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator, CHAR

from database import Base


# ---------------------------------------------------------------------------
# Custom UUID type — works with PostgreSQL (native) and SQLite (CHAR(36))
# ---------------------------------------------------------------------------
class GUID(TypeDecorator):
    """Platform-independent GUID. Uses native UUID on PostgreSQL,
    falls back to CHAR(36) for SQLite."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return str(value)
        if not isinstance(value, uuid.UUID):
            return str(uuid.UUID(str(value)))
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(str(value))


# ---------------------------------------------------------------------------
# Request — every prompt that passes through the firewall
# ---------------------------------------------------------------------------
class Request(Base):
    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    user_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    sanitized_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    threat_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    processing_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_false_positive: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationship → detections
    detections: Mapped[List["Detection"]] = relationship(
        "Detection",
        back_populates="request",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def to_dict(self) -> dict:
        import datetime as _dt
        ts = self.timestamp
        if ts and ts.tzinfo is None:
            # SQLite returns naive datetimes; treat as UTC
            ts = ts.replace(tzinfo=_dt.timezone.utc)
        return {
            "id": str(self.id),
            "timestamp": ts.isoformat() if ts else None,
            "user_id": self.user_id,
            "prompt": self.prompt,
            "sanitized_prompt": self.sanitized_prompt,
            "response": self.response,
            "threat_score": self.threat_score,
            "decision": self.decision,
            "processing_time": self.processing_time,
            "is_false_positive": self.is_false_positive,
            "detections": [d.to_dict() for d in (self.detections or [])],
        }


# ---------------------------------------------------------------------------
# Detection — one row per module that fired for a request
# ---------------------------------------------------------------------------
class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    request_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("requests.id", ondelete="CASCADE"), nullable=False
    )
    detector_name: Mapped[str] = mapped_column(String(64), nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_contribution: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    matched_pattern: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relationship → parent request
    request: Mapped["Request"] = relationship("Request", back_populates="detections")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "request_id": str(self.request_id),
            "detector_name": self.detector_name,
            "confidence": self.confidence,
            "score_contribution": self.score_contribution,
            "matched_pattern": self.matched_pattern,
            "category": self.category,
        }


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="user")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "username": self.username,
            "role": self.role,
        }
