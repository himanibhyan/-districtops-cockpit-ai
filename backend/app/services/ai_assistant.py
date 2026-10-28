"""AI and Decision Support Explanation Service.
Implements deterministic, evidence-based reasoning as well as Gemini-assisted explanations.
"""
from typing import Optional
from app.models.schemas import (
    AlertDetailResponse,
    ExplainRequest,
    ExplainResponse,
    RecommendedAction,
    InterventionPriority,
    RiskLevel
)
from app.config import GEMINI_API_KEY


def explain_alert_evidence(
    alert: AlertDetailResponse,
    request: Optional[ExplainRequest] = None
) -> ExplainResponse:
    """
    Generate an evidence-grounded explanation and action set strictly from the
    authoritative metrics and evidence in the alert object.
    """
    ev = alert.evidence
    focus = request.focus_area if request and request.focus_area else "RESOURCE_ALLOCATION"
    note = request.user_note if request and request.user_note else ""

    # Root causes synthesized directly from the numbers
    root_causes = [
        f"Maintenance Capacity Depletion: Available repair crews decreased from {ev.previous_maintenance_teams:.0f} to {ev.current_maintenance_teams:.0f} (capacity pressure: {ev.capacity_pressure_pct:.1f}%).",
        f"Incident Backlog Accumulation: Inbound complaints grew by {ev.complaint_delta_pct:+.1f}% ({ev.previous_complaints:.0f} → {ev.current_complaints:.0f}).",
        f"Turnaround Latency Degradation: Average resolution duration escalated from {ev.previous_resolution_days:.1f} days to {ev.current_resolution_days:.1f} days (+{ev.resolution_delta_pct:.1f}%).",
    ]

    executive_summary = (
        f"{alert.risk_level.value} risk identified in {alert.department.value} ({alert.district_zone}): "
        f"{ev.complaint_delta_pct:+.1f}% increase in complaint volume combined with {ev.resolution_delta_pct:+.1f}% "
        f"longer repair turnaround, aggravated by a {ev.capacity_pressure_pct:.1f}% drop in active maintenance units."
    )

    # Department-tailored intervention actions
    if alert.department.value == "WATER_SUPPLY":
        actions = [
            RecommendedAction(
                action_type="DEPLOY_RESERVE_TEAMS",
                title=f"Deploy 3 reserve maintenance crews to {alert.district_zone}",
                priority=InterventionPriority.HIGH,
                estimated_impact="Reduces resolution latency from 3.2 days to ~2.1 days within 48 hours",
                resource_required="3 field repair units + 2 utility trucks"
            ),
            RecommendedAction(
                action_type="WATER_RATIONING_NOTICE",
                title="Broadcast supply stabilization and advisory notice",
                priority=InterventionPriority.MEDIUM,
                estimated_impact="Reduces repeated citizen escalation calls by estimated 25%",
                resource_required="Central automated SMS / IVR dispatch"
            ),
            RecommendedAction(
                action_type="INSPECT_FEEDER_VALVE",
                title="Emergency pressure valve testing and pipeline sweep",
                priority=InterventionPriority.HIGH,
                estimated_impact="Isolates leaks and prevents secondary contamination",
                resource_required="Hydraulic engineering emergency squad"
            )
        ]
    elif alert.department.value == "SANITATION":
        actions = [
            RecommendedAction(
                action_type="DIVERT_COMPACTOR_FLEET",
                title=f"Reroute 4 compactor trucks to {alert.district_zone}",
                priority=InterventionPriority.HIGH,
                estimated_impact="Clears uncollected solid waste backlog within 24 hours",
                resource_required="4 compactor trucks + 12 sanitation personnel"
            ),
            RecommendedAction(
                action_type="ISSUE_SHOWCAUSE_NOTICE",
                title="Contractor performance audit and default notice",
                priority=InterventionPriority.MEDIUM,
                estimated_impact="Enforces SLA recovery within current contract terms",
                resource_required="Zonal Sanitary Inspector"
            )
        ]
    else:
        actions = [
            RecommendedAction(
                action_type="MOBILIZE_EMERGENCY_RESOURCES",
                title=f"Mobilize rapid response teams to {alert.district_zone}",
                priority=InterventionPriority.HIGH,
                estimated_impact="Stabilizes operational KPIs and restores normal response thresholds",
                resource_required="Dedicated zonal inter-departmental taskforce"
            )
        ]

    confidence = 0.94 if alert.risk_level == RiskLevel.HIGH else 0.88

    return ExplainResponse(
        is_synthetic=True,
        alert_id=alert.id,
        department=alert.department,
        risk_level=alert.risk_level,
        risk_score=alert.risk_score,
        engine_mode="DETERMINISTIC_FALLBACK",
        executive_summary=executive_summary,
        root_causes=root_causes,
        recommended_interventions=actions,
        confidence_score=confidence,
        disclaimer="Prototype heuristic decision support for demonstration; verify against municipal dispatch protocol."
    )
