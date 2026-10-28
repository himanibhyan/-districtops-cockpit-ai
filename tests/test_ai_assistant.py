"""
Integration & Unit Tests for DistrictOps Cockpit AI — AI Decision Assistant
File: tests/test_ai_assistant.py
Role: Member 3 (AI & Testing Lead)
"""

import sys
from pathlib import Path
import pytest

# Ensure repository root is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.services.ai_assistant import (
    AIAssistant,
    Department,
    ExplainRequest,
    ExplainResponse,
    InterventionPriority,
    RiskLevel,
    explain_alert,
)


# --- Fixtures ---

@pytest.fixture
def benchmark_water_alert():
    """
    Standard illustrative benchmark Water Supply alert as defined in API_CONTRACT.md.
    Metrics:
    - Previous complaints: 100, Current complaints: 138 (+38%)
    - Previous resolution: 2.0 days, Current resolution: 3.2 days (+60%)
    - Previous maintenance teams: 8, Current maintenance teams: 5 (-37.5%)
    - Risk score: 78.9 (HIGH)
    """
    return {
        "id": "alt-water-001",
        "department": "WATER_SUPPLY",
        "title": "Severe Water Delivery & Maintenance Backlog",
        "district_zone": "Zone 4 - North Sector",
        "risk_score": 78.9,
        "risk_level": "HIGH",
        "status": "OPEN",
        "evidence": {
            "previous_complaints": 100.0,
            "current_complaints": 138.0,
            "complaint_delta_pct": 38.0,
            "previous_resolution_days": 2.0,
            "current_resolution_days": 3.2,
            "resolution_delta_pct": 60.0,
            "previous_maintenance_teams": 8.0,
            "current_maintenance_teams": 5.0,
            "capacity_pressure_pct": 37.5,
        },
    }


# --- Tests ---

def test_water_supply_benchmark_scenario(benchmark_water_alert):
    """Verifies that the benchmark Water Supply scenario generates grounded explanations."""
    response = explain_alert(benchmark_water_alert)

    # 1. Schema Validation
    assert isinstance(response, ExplainResponse)
    assert response.alert_id == "alt-water-001"
    assert response.department == Department.WATER_SUPPLY
    assert response.risk_level == RiskLevel.HIGH
    assert response.risk_score == 78.9
    assert response.engine_mode == "DETERMINISTIC_FALLBACK"
    assert response.is_synthetic is True

    # 2. Executive Summary checks
    summary = response.executive_summary
    assert "HIGH" in summary
    assert "Water Supply" in summary
    assert "38" in summary or "+38" in summary
    assert "60" in summary or "+60" in summary

    # 3. Root Causes grounded in real metrics
    assert len(response.root_causes) >= 3
    root_text = " ".join(response.root_causes)
    assert "100" in root_text and "138" in root_text  # complaint count evidence
    assert "2.0" in root_text and "3.2" in root_text  # resolution turnaround evidence
    assert "8" in root_text and "5" in root_text      # team count evidence
    assert "37.5%" in root_text

    # 4. Actionable recommendations with explicit assumption labelling
    assert len(response.recommended_interventions) >= 1
    top_action = response.recommended_interventions[0]
    assert top_action.action_type == "DEPLOY_RESERVE_TEAMS"
    assert top_action.priority in [InterventionPriority.HIGH, InterventionPriority.URGENT]
    assert "Zone 4 - North Sector" in top_action.title
    assert "3" in top_action.title  # 8 - 5 = 3 crews lost from baseline
    assert "assumes" in top_action.title.lower()  # Explicitly labelled as assumption
    assert "projected operational assumption" in top_action.estimated_impact.lower()

    # 5. Metadata & Disclaimers
    assert response.confidence_score >= 0.90
    assert "synthetic" in response.disclaimer.lower()


def test_deterministic_output_reproducibility(benchmark_water_alert):
    """Ensures that identical alert inputs produce strictly identical, deterministic outputs."""
    res1 = explain_alert(benchmark_water_alert)
    res2 = explain_alert(benchmark_water_alert)

    assert res1.model_dump() == res2.model_dump()


def test_missing_and_incomplete_evidence_handling():
    """Verifies graceful degradation when evidence telemetry is partial or missing."""
    alert_incomplete = {
        "id": "alt-san-099",
        "department": "SANITATION",
        "title": "Irregular Waste Collection",
        "district_zone": "Zone 2",
        "risk_score": 45.0,
        "risk_level": "MEDIUM",
        "status": "OPEN",
        "evidence": {
            # Only resolution time is available; complaints and teams are missing
            "previous_resolution_days": 1.5,
            "current_resolution_days": 2.8,
        },
    }

    response = explain_alert(alert_incomplete)

    assert isinstance(response, ExplainResponse)
    assert response.alert_id == "alt-san-099"
    assert response.risk_level == RiskLevel.MEDIUM
    assert response.confidence_score < 0.90  # Lowered due to incomplete evidence
    assert any("limitation" in rc.lower() for rc in response.root_causes)
    assert len(response.recommended_interventions) >= 1


def test_completely_empty_evidence():
    """Verifies that an alert with evidence=None does not raise an exception and reports low confidence."""
    alert_no_evidence = {
        "id": "alt-empty-000",
        "department": "ELECTRICITY",
        "risk_score": 30.0,
        "risk_level": "LOW",
        "evidence": None,
    }

    response = explain_alert(alert_no_evidence)

    assert isinstance(response, ExplainResponse)
    assert response.confidence_score <= 0.50  # Strongly lowered confidence for empty evidence
    assert "Incomplete operational telemetry" in response.executive_summary


def test_empty_evidence_does_not_fabricate_metrics():
    """Confirms that empty or missing evidence does not produce fabricated factual claims in recommendations."""
    alert_empty_water = {
        "id": "alt-water-empty",
        "department": "WATER_SUPPLY",
        "district_zone": "Zone 1",
        "risk_score": 35.0,
        "risk_level": "LOW",
        "evidence": {},
    }

    response = explain_alert(alert_empty_water)

    # Check top action
    top_action = response.recommended_interventions[0]
    # Should not fabricate a hardcoded crew count or specific day metrics
    assert "3.2" not in top_action.estimated_impact
    assert "unavailable" in top_action.estimated_impact.lower()
    assert "subject to on-site audit" in top_action.title.lower()
    assert response.confidence_score <= 0.50


def test_client_metrics_cannot_tamper_evidence(benchmark_water_alert):
    """
    Confirms that client request bodies cannot override backend authoritative metrics.
    Even if client tries to pass fake metrics in the request, backend evidence is preserved.
    """
    tampered_request = {
        "focus_area": "CONTAINMENT",
        "user_note": "Operator notice: high urgency",
        "previous_complaints": 99999,  # Malicious/tampered client field
        "risk_score": 0.0,             # Malicious/tampered client field
    }

    response = explain_alert(benchmark_water_alert, request=tampered_request)

    # Risk score and evidence must remain from authoritative alert
    assert response.risk_score == 78.9
    assert response.risk_level == RiskLevel.HIGH
    root_text = " ".join(response.root_causes)
    assert "138" in root_text
    assert "99999" not in root_text
    assert "CONTAINMENT" in response.executive_summary  # Operator focus accepted safely


def test_pydantic_model_input_compatibility(benchmark_water_alert):
    """Confirms compatibility when Member 2 passes a Pydantic object instead of a dict."""
    from pydantic import BaseModel

    class DummyAlertModel(BaseModel):
        id: str
        department: str
        risk_score: float
        risk_level: str
        district_zone: str
        evidence: dict

    pydantic_alert = DummyAlertModel(**benchmark_water_alert)
    response = explain_alert(pydantic_alert)

    assert response.alert_id == "alt-water-001"
    assert response.risk_score == 78.9
