"""
firewall.py — Main orchestrator that runs the full pipeline for every incoming prompt.
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
        """Process a prompt through the entire firewall pipeline."""
        
        # Step 1: Normalize basic text
        clean_prompt = prompt.strip()
        
        # Step 2: Run ThreatScorer
        assessment = await self.scorer.assess(clean_prompt, self.classifier)
        
        # Step 3: Determine final prompt based on decision
        final_prompt = clean_prompt
        blocked = False
        sanitization_result = None
        
        if assessment.decision == "block":
            final_prompt = None
            blocked = True
        elif assessment.decision == "sanitize":
            sanitization_result = self.sanitizer.sanitize(clean_prompt)
            if sanitization_result.was_modified:
                final_prompt = sanitization_result.sanitized_prompt
        # For "allow" and "warn", final_prompt stays as original clean_prompt

        # Step 4: Log to DB
        logger = EventLogger(db_session)
        request_id = await logger.log_request(
            prompt=clean_prompt,
            threat_assessment=assessment,
            sanitization_result=sanitization_result,
            response=None, # Response will be filled later by the API route
            user_id=user_id
        )

        return FirewallResult(
            original_prompt=clean_prompt,
            final_prompt=final_prompt,
            blocked=blocked,
            decision=assessment.decision,
            threat_score=assessment.threat_score,
            threat_assessment=assessment,
            sanitization_result=sanitization_result,
            request_id=request_id
        )
