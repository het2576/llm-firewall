"""
firewall.py — Main orchestrator that runs the full pipeline for every incoming prompt.

Sanitize flow:
  1. Score the prompt with all detectors.
  2. If decision == "block" → reject immediately.
  3. Otherwise, ALWAYS run the input sanitizer.
     - If the sanitizer actually changed the prompt (removed XML tags, invisible chars,
       base64 payloads, etc.) the decision is promoted to "sanitize" so the cleaned
       version is passed to the LLM and the dashboard reflects the count.
     - If the sanitizer made no changes, the original decision (allow/warn) is kept.
"""
from dataclasses import dataclass
from typing import Optional

try:
    from scoring.threat_scorer import ThreatScorer, ThreatAssessment
    from sanitizer.input_sanitizer import InputSanitizer, SanitizationResult
    from classifier.ai_classifier import AISecurityClassifier
    from logger.event_logger import EventLogger
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from scoring.threat_scorer import ThreatScorer, ThreatAssessment
    from sanitizer.input_sanitizer import InputSanitizer, SanitizationResult
    from classifier.ai_classifier import AISecurityClassifier
    from logger.event_logger import EventLogger


@dataclass
class FirewallResult:
    original_prompt: str
    final_prompt: Optional[str]      # None if blocked
    blocked: bool
    decision: str
    threat_score: int
    threat_assessment: ThreatAssessment
    sanitization_result: Optional[SanitizationResult]
    request_id: str


class LLMSecurityFirewall:
    def __init__(self):
        self.scorer = ThreatScorer()
        self.sanitizer = InputSanitizer()
        self.classifier = AISecurityClassifier()

    async def process(self, prompt: str, user_id: Optional[str], db_session) -> FirewallResult:
        """Process a prompt through the full firewall pipeline."""

        clean_prompt = prompt.strip()

        # ── Step 1: Score ────────────────────────────────────────────────────
        assessment = await self.scorer.assess(clean_prompt, self.classifier)

        # ── Step 2: Route based on score ─────────────────────────────────────
        final_prompt: Optional[str] = clean_prompt
        blocked = False
        sanitization_result: Optional[SanitizationResult] = None
        decision = assessment.decision

        if decision == "block":
            # Hard block — never pass to LLM
            final_prompt = None
            blocked = True

        else:
            # Always attempt sanitization on non-blocked prompts.
            # This catches obfuscated payloads (invisible chars, XML injection,
            # base64 encoded instructions, HTML comments, oversized prompts)
            # that the score-based routing might classify as "warn" or "allow"
            # but that still contain removable malicious structure.
            sanitization_result = self.sanitizer.sanitize(clean_prompt)

            if sanitization_result.was_modified:
                final_prompt = sanitization_result.sanitized_prompt
                # Promote allow/warn → sanitize so the dashboard count increases
                # and the chat UI shows the "Sanitized" badge.
                if decision in ("allow", "warn"):
                    decision = "sanitize"
            else:
                # Nothing to clean — keep original decision
                sanitization_result = None

        # Sync the assessment decision so the DB record matches what we return
        assessment.decision = decision

        # ── Step 3: Log to DB ────────────────────────────────────────────────
        logger = EventLogger(db_session)
        request_id = await logger.log_request(
            prompt=clean_prompt,
            threat_assessment=assessment,
            sanitization_result=sanitization_result,
            response=None,
            user_id=user_id,
        )

        return FirewallResult(
            original_prompt=clean_prompt,
            final_prompt=final_prompt,
            blocked=blocked,
            decision=decision,
            threat_score=assessment.threat_score,
            threat_assessment=assessment,
            sanitization_result=sanitization_result,
            request_id=request_id,
        )
