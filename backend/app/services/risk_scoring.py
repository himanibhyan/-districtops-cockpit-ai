"""Risk Engine Service.
Computes prototype risk scores using the defined formula:
Risk Score = 0.40 * I_backlog + 0.35 * I_delay + 0.25 * I_capacity
"""
from app.models.schemas import RiskLevel


def calculate_risk_score(
    i_backlog: float,
    i_delay: float,
    i_capacity: float
) -> float:
    """Calculate normalized risk score (0-100)."""
    score = (0.40 * i_backlog) + (0.35 * i_delay) + (0.25 * i_capacity)
    return round(min(100.0, max(0.0, score)), 1)


def get_risk_level(score: float) -> RiskLevel:
    if score >= 70.0:
        return RiskLevel.HIGH
    elif score >= 40.0:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW
