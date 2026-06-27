"""
threat_scorer.py — Aggregates scores from all detectors and determines the final decision.
"""
import time
from dataclasses import dataclass
from typing import List

try:
    from detector.pattern_detector import PatternDetector
    from heuristics.heuristic_analyzer import HeuristicAnalyzer
    from embeddings.similarity_detector import SimilarityDetector
    from classifier.ai_classifier import AISecurityClassifier
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from detector.pattern_detector import PatternDetector
    from heuristics.heuristic_analyzer import HeuristicAnalyzer
    from embeddings.similarity_detector import SimilarityDetector
    from classifier.ai_classifier import AISecurityClassifier


@dataclass
class ThreatAssessment:
    threat_score: int
    decision: str
    detections: List[dict]
    triggered_detectors: List[str]
    primary_threat: str
    processing_time_ms: float


def make_decision(score: int) -> str:
    """Determine action based on threat score thresholds."""
    if score <= 25:
        return "allow"
    elif score <= 50:
        return "warn"
    elif score <= 70:
        return "sanitize"
    else:
        return "block"


class ThreatScorer:
    def __init__(self):
        self.pattern_detector = PatternDetector()
        self.heuristic_analyzer = HeuristicAnalyzer()
        self.similarity_detector = SimilarityDetector()

    async def assess(self, prompt: str, classifier: AISecurityClassifier) -> ThreatAssessment:
        start_time = time.perf_counter()

        pattern_result = self.pattern_detector.analyze(prompt)
        heuristic_result = self.heuristic_analyzer.analyze(prompt)
        similarity_result = self.similarity_detector.detect(prompt)
        classifier_result = await classifier.classify(prompt)

        # Aggregate raw scores from all detectors
        raw_score = (
            pattern_result.score_contribution
            + heuristic_result.score_contribution
            + classifier_result.score_contribution
            + similarity_result.score_contribution
        )

        threat_score = min(100, max(0, raw_score))
        decision = make_decision(threat_score)

        # Hard override: a high-confidence regex pattern match always blocks,
        # regardless of whether the AI classifier or embeddings agree.
        # This prevents a failing classifier from downgrading a clear injection.
        if pattern_result.triggered and pattern_result.score_contribution >= 60:
            decision = "block"
            threat_score = max(threat_score, 85)

        # Collect detections
        detections = []
        triggered_detectors = []

        def add_detection(result, name):
            if result.triggered or result.score_contribution > 0:
                detections.append({
                    "detector_name": name,
                    "score_contribution": result.score_contribution,
                    "category": getattr(result, "category", getattr(result, "closest_category", "unknown")),
                    "matched_pattern": getattr(result, "matched_patterns", None),
                    "findings": getattr(result, "findings", None),
                    "confidence": getattr(result, "confidence", getattr(result, "similarity_score", None)),
                })
                triggered_detectors.append(name)
                return (
                    getattr(result, "category", getattr(result, "closest_category", "unknown")),
                    result.score_contribution,
                )
            return None, 0

        cats = {}

        c, s = add_detection(pattern_result, "pattern_detector")
        if c:
            cats[c] = cats.get(c, 0) + s

        c, s = add_detection(heuristic_result, "heuristic_analyzer")
        if c:
            cats[c] = cats.get(c, 0) + s

        c, s = add_detection(similarity_result, "embedding_similarity")
        if c:
            cats[c] = cats.get(c, 0) + s

        if classifier_result.score_contribution > 0:
            detections.append({
                "detector_name": "ai_classifier",
                "score_contribution": classifier_result.score_contribution,
                "category": classifier_result.category,
                "confidence": classifier_result.confidence,
                "reasoning": classifier_result.reasoning,
            })
            triggered_detectors.append("ai_classifier")
            cats[classifier_result.category] = (
                cats.get(classifier_result.category, 0) + classifier_result.score_contribution
            )

        primary_threat = "safe"
        if cats:
            if "safe" in cats and len(cats) > 1:
                del cats["safe"]
            if cats:
                primary_threat = max(cats.items(), key=lambda x: x[1])[0]

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        return ThreatAssessment(
            threat_score=threat_score,
            decision=decision,
            detections=detections,
            triggered_detectors=triggered_detectors,
            primary_threat=primary_threat,
            processing_time_ms=elapsed_ms,
        )
