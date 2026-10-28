"""
DistrictOps Cockpit AI — AI Decision Assistant Service
File: backend/app/services/ai_assistant.py
Role: Member 3 (AI Decision Assistant & Integration)

Provides evidence-grounded, deterministic explanations and prioritized
actionable recommendations for operational alerts across municipal departments.

Key Guarantees:
1. Deterministic default fallback (no external API key required).
2. Authoritative backend evidence only — never trusts client-supplied metrics.
3. Graceful degradation when telemetry/evidence is incomplete.
4. Strict compliance with API_CONTRACT.md schemas.
5. Explicit synthetic demonstration disclosure.
"""

from __future__ import annotations

import os
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


# --- Internal Schemas (Fully aligned with API_CONTRACT.md) ---

class Department(str, Enum):
    WATER_SUPPLY = "WATER_SUPPLY"
    SANITATION = "SANITATION"
    ROADS_TRAFFIC = "ROADS_TRAFFIC"
    ELECTRICITY = "ELECTRICITY"
    PUBLIC_HEALTH = "PUBLIC_HEALTH"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class InterventionPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class AlertEvidenceModel(BaseModel):
    previous_complaints: Optional[float] = None
    current_complaints: Optional[float] = None
    complaint_delta_pct: Optional[float] = None
    previous_resolution_days: Optional[float] = None
    current_resolution_days: Optional[float] = None
    resolution_delta_pct: Optional[float] = None
    previous_maintenance_teams: Optional[float] = None
    current_maintenance_teams: Optional[float] = None
    capacity_pressure_pct: Optional[float] = None


class RecommendedAction(BaseModel):
    action_type: str
    title: str
    priority: InterventionPriority
    estimated_impact: str
    resource_required: str


class ExplainRequest(BaseModel):
    focus_area: Optional[str] = "RESOURCE_ALLOCATION"
    user_note: Optional[str] = None


class ExplainResponse(BaseModel):
    is_synthetic: bool = True
    alert_id: str
    department: Department
    risk_level: RiskLevel
    risk_score: float
    engine_mode: str = "DETERMINISTIC_FALLBACK"
    executive_summary: str
    root_causes: List[str]
    recommended_interventions: List[RecommendedAction]
    confidence_score: float = Field(default=0.95, ge=0.0, le=1.0)
    disclaimer: str = (
        "Prototype heuristic decision support for demonstration; "
        "verify against municipal dispatch protocol. All operational data is synthetic."
    )


# --- Heuristic Engine & Domain Catalogs ---

DEPARTMENT_RECOMMENDATION_CATALOG: Dict[Department, List[Dict[str, Any]]] = {
    Department.WATER_SUPPLY: [
        {
            "action_type": "DEPLOY_RESERVE_TEAMS",
            "title_template_complete": "Redeploy {teams_needed} reserve maintenance crews to {zone} (assumes restoring previous {prev_teams}-team baseline)",
            "title_template_incomplete": "Mobilize reserve maintenance crews to {zone} (staffing requirements subject to on-site audit)",
            "priority": InterventionPriority.HIGH,
            "impact_template_complete": "Projected operational assumption: Restoring baseline crew count aims to reduce resolution turnaround from {curr_res} days towards baseline {prev_res} days",
            "impact_template_incomplete": "Operational impact projection unavailable: turnaround metrics missing from telemetry feed",
            "resource_template_complete": "{teams_needed} field crews (to restore {prev_teams}-crew baseline) + 2 vacuum tankers",
            "resource_template_incomplete": "Field crew allocation to be determined via dispatch staffing audit",
        },
        {
            "action_type": "PRESSURE_REGULATION_CHECK",
            "title_template_complete": "Inspect pressure-reducing valves across {zone} feeder trunks",
            "title_template_incomplete": "Inspect pressure-reducing valves across {zone} feeder trunks",
            "priority": InterventionPriority.MEDIUM,
            "impact_template_complete": "Prevents secondary pipe ruptures during peak distribution hours",
            "impact_template_incomplete": "Prevents secondary pipe ruptures during peak distribution hours",
            "resource_template_complete": "Hydraulic engineering inspection squad",
            "resource_template_incomplete": "Hydraulic engineering inspection squad",
        },
        {
            "action_type": "COMMUNITY_ADVISORY",
            "title_template_complete": "Issue localized service restoration bulletin to affected consumers in {zone}",
            "title_template_incomplete": "Issue localized service restoration bulletin to affected consumers in {zone}",
            "priority": InterventionPriority.MEDIUM,
            "impact_template_complete": "Estimated heuristic reduction: May curb repeated inbound complaint surges by an estimated 20-30%",
            "impact_template_incomplete": "Estimated heuristic reduction: May curb repeated inbound complaint surges by an estimated 20-30%",
            "resource_template_complete": "Municipal SMS gateway and portal broadcast",
            "resource_template_incomplete": "Municipal SMS gateway and portal broadcast",
        },
    ],
    Department.ELECTRICITY: [
        {
            "action_type": "FEEDER_LOAD_BALANCING",
            "title_template_complete": "Reroute power feeder load to backup substation for {zone}",
            "title_template_incomplete": "Inspect power feeder load and evaluate backup routing for {zone}",
            "priority": InterventionPriority.HIGH,
            "impact_template_complete": "Alleviates transformer overload and prevents blackout trips",
            "impact_template_incomplete": "Alleviates transformer overload and prevents blackout trips",
            "resource_template_complete": "Substation switching crew",
            "resource_template_incomplete": "Substation switching crew",
        },
        {
            "action_type": "RAPID_LINE_PATROL",
            "title_template_complete": "Deploy mobile line patrol to inspect transmission corridors in {zone}",
            "title_template_incomplete": "Deploy mobile line patrol to inspect transmission corridors in {zone}",
            "priority": InterventionPriority.MEDIUM,
            "impact_template_complete": "Pinpoints phase faults within emergency response window",
            "impact_template_incomplete": "Pinpoints phase faults within emergency response window",
            "resource_template_complete": "2 high-voltage emergency repair trucks",
            "resource_template_incomplete": "Emergency repair patrol team",
        },
    ],
    Department.SANITATION: [
        {
            "action_type": "EMERGENCY_WASTE_CLEARANCE",
            "title_template_complete": "Dispatch high-capacity compactor fleet to {zone} transfer stations",
            "title_template_incomplete": "Mobilize waste clearance fleet to {zone} transfer stations",
            "priority": InterventionPriority.HIGH,
            "impact_template_complete": "Clears overflow backlog within 12 hours",
            "impact_template_incomplete": "Clears overflow backlog (timeline subject to fleet availability)",
            "resource_template_complete": "4 compactors + sanitation field team",
            "resource_template_incomplete": "Compactor fleet and sanitation field team",
        },
        {
            "action_type": "VECTOR_CONTROL_SPRAY",
            "title_template_complete": "Conduct prophylactic disinfectant spraying at major dump clusters",
            "title_template_incomplete": "Conduct prophylactic disinfectant spraying at major dump clusters",
            "priority": InterventionPriority.MEDIUM,
            "impact_template_complete": "Mitigates public health contagion risks",
            "impact_template_incomplete": "Mitigates public health contagion risks",
            "resource_template_complete": "Sanitary health unit squad",
            "resource_template_incomplete": "Sanitary health unit squad",
        },
    ],
    Department.ROADS_TRAFFIC: [
        {
            "action_type": "TRAFFIC_SIGNAL_OVERRIDE",
            "title_template_complete": "Deploy adaptive green-wave signal timing along {zone} arteries",
            "title_template_incomplete": "Evaluate traffic signal timing adjustments along {zone} arteries",
            "priority": InterventionPriority.HIGH,
            "impact_template_complete": "Eases vehicular gridlock delay by estimated 30-35%",
            "impact_template_incomplete": "Eases vehicular gridlock delay along congested corridors",
            "resource_template_complete": "Traffic management center operator override",
            "resource_template_incomplete": "Traffic management center operator override",
        },
        {
            "action_type": "EMERGENCY_POTHOLE_COLD_PATCH",
            "title_template_complete": "Mobilize road maintenance quick-fill asphalt unit to {zone}",
            "title_template_incomplete": "Mobilize road maintenance quick-fill asphalt unit to {zone}",
            "priority": InterventionPriority.MEDIUM,
            "impact_template_complete": "Restores transit lane usability by morning commute",
            "impact_template_incomplete": "Restores transit lane usability upon dispatch",
            "resource_template_complete": "1 mobile asphalt spreader crew",
            "resource_template_incomplete": "Mobile road repair crew",
        },
    ],
    Department.PUBLIC_HEALTH: [
        {
            "action_type": "MOBILE_CLINIC_DEPLOYMENT",
            "title_template_complete": "Deploy mobile primary health diagnostic van to {zone}",
            "title_template_incomplete": "Deploy mobile primary health diagnostic van to {zone}",
            "priority": InterventionPriority.URGENT,
            "impact_template_complete": "Provides early triage and reduces district hospital admission bottleneck",
            "impact_template_incomplete": "Provides early triage and reduces district hospital admission bottleneck",
            "resource_template_complete": "1 doctor, 2 nurses, and diagnostic test kits",
            "resource_template_incomplete": "Mobile medical clinical staff and diagnostic kits",
        },
        {
            "action_type": "DRINKING_WATER_SURVEILLANCE",
            "title_template_complete": "Sample and culture drinking water sources in {zone} catchment",
            "title_template_incomplete": "Sample and culture drinking water sources in {zone} catchment",
            "priority": InterventionPriority.HIGH,
            "impact_template_complete": "Identifies contamination vector within diagnostic window",
            "impact_template_incomplete": "Identifies contamination vector within diagnostic window",
            "resource_template_complete": "Epidemiology surveillance team",
            "resource_template_incomplete": "Epidemiology surveillance team",
        },
    ],
}


class AIAssistant:
    """
    AI Decision Assistant engine for municipal alerts.

    Provides deterministic heuristic reasoning grounded strictly in
    authoritative computed evidence.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DISTRICTOPS_AI_KEY") or os.getenv("GEMINI_API_KEY")

    def _extract_alert_data(self, alert: Union[BaseModel, Dict[str, Any]]) -> Dict[str, Any]:
        """Safely normalizes Pydantic models or dictionaries into a clean dict."""
        if hasattr(alert, "model_dump"):
            return alert.model_dump()
        elif hasattr(alert, "dict"):
            return alert.dict()
        elif isinstance(alert, dict):
            return dict(alert)
        raise ValueError("Alert must be a Pydantic model or dictionary.")

    def _extract_request_data(
        self, request: Optional[Union[BaseModel, Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Safely extracts optional request data without trusting client metrics."""
        if request is None:
            return {"focus_area": "RESOURCE_ALLOCATION", "user_note": None}
        if hasattr(request, "model_dump"):
            data = request.model_dump()
        elif hasattr(request, "dict"):
            data = request.dict()
        elif isinstance(request, dict):
            data = dict(request)
        else:
            data = {}
        # Explicitly sanitize: only accept non-authoritative operator hints
        return {
            "focus_area": data.get("focus_area") or "RESOURCE_ALLOCATION",
            "user_note": data.get("user_note"),
        }

    def _normalize_evidence(self, raw_evidence: Optional[Dict[str, Any]]) -> AlertEvidenceModel:
        """Parses and validates authoritative evidence, handling missing metrics gracefully."""
        if not raw_evidence or not isinstance(raw_evidence, dict):
            return AlertEvidenceModel()

        # Compute missing deltas if baseline values exist
        prev_comp = raw_evidence.get("previous_complaints")
        curr_comp = raw_evidence.get("current_complaints")
        comp_delta = raw_evidence.get("complaint_delta_pct")
        if comp_delta is None and prev_comp is not None and curr_comp is not None:
            if prev_comp > 0:
                comp_delta = round(((curr_comp - prev_comp) / prev_comp) * 100.0, 1)

        prev_res = raw_evidence.get("previous_resolution_days")
        curr_res = raw_evidence.get("current_resolution_days")
        res_delta = raw_evidence.get("resolution_delta_pct")
        if res_delta is None and prev_res is not None and curr_res is not None:
            if prev_res > 0:
                res_delta = round(((curr_res - prev_res) / prev_res) * 100.0, 1)

        prev_teams = raw_evidence.get("previous_maintenance_teams")
        curr_teams = raw_evidence.get("current_maintenance_teams")
        cap_pressure = raw_evidence.get("capacity_pressure_pct")
        if cap_pressure is None and prev_teams is not None and curr_teams is not None:
            if prev_teams > 0:
                cap_pressure = round(((prev_teams - curr_teams) / prev_teams) * 100.0, 1)

        return AlertEvidenceModel(
            previous_complaints=prev_comp,
            current_complaints=curr_comp,
            complaint_delta_pct=comp_delta,
            previous_resolution_days=prev_res,
            current_resolution_days=curr_res,
            resolution_delta_pct=res_delta,
            previous_maintenance_teams=prev_teams,
            current_maintenance_teams=curr_teams,
            capacity_pressure_pct=cap_pressure,
        )

    def explain_alert(
        self,
        alert: Union[BaseModel, Dict[str, Any]],
        request: Optional[Union[BaseModel, Dict[str, Any]]] = None,
    ) -> ExplainResponse:
        """
        Primary entry point: Generates an evidence-grounded explanation for an alert.
        Guarantees deterministic output and never relies on client-supplied metrics.
        """
        alert_dict = self._extract_alert_data(alert)
        req_dict = self._extract_request_data(request)

        alert_id = str(alert_dict.get("id") or "UNKNOWN_ALERT")
        dept_raw = str(alert_dict.get("department") or Department.WATER_SUPPLY.value)
        try:
            department = Department(dept_raw)
        except ValueError:
            department = Department.WATER_SUPPLY

        risk_score = float(alert_dict.get("risk_score") or 0.0)
        risk_level_raw = str(alert_dict.get("risk_level") or "LOW").upper()
        try:
            risk_level = RiskLevel(risk_level_raw)
        except ValueError:
            risk_level = RiskLevel.HIGH if risk_score >= 70 else RiskLevel.MEDIUM if risk_score >= 40 else RiskLevel.LOW

        zone = alert_dict.get("district_zone") or "Target Sector"

        # Authoritative evidence processing
        evidence = self._normalize_evidence(alert_dict.get("evidence"))

        # Root causes formulation
        root_causes: List[str] = []
        is_evidence_complete = True

        # 1. Capacity Pressure Analysis
        if evidence.previous_maintenance_teams is not None and evidence.current_maintenance_teams is not None:
            teams_lost = int(evidence.previous_maintenance_teams - evidence.current_maintenance_teams)
            pct = evidence.capacity_pressure_pct or (
                round((teams_lost / evidence.previous_maintenance_teams) * 100, 1) if evidence.previous_maintenance_teams else 0
            )
            if teams_lost > 0:
                root_causes.append(
                    f"Field team depletion: {teams_lost} out of {int(evidence.previous_maintenance_teams)} "
                    f"maintenance teams offline ({pct}% capacity reduction)."
                )
            else:
                root_causes.append(
                    f"Field team capacity nominal: {int(evidence.current_maintenance_teams)} teams active."
                )
        else:
            is_evidence_complete = False
            root_causes.append("Telemetry limitation: Field team staffing levels unavailable in telemetry feed.")

        # 2. Backlog / Complaint Analysis
        if evidence.previous_complaints is not None and evidence.current_complaints is not None:
            diff = int(evidence.current_complaints - evidence.previous_complaints)
            pct = evidence.complaint_delta_pct or (
                round((diff / evidence.previous_complaints) * 100, 1) if evidence.previous_complaints else 0
            )
            sign = "+" if pct >= 0 else ""
            root_causes.append(
                f"Backlog compounding: Unresolved ticket volume shifted from {int(evidence.previous_complaints)} "
                f"to {int(evidence.current_complaints)} cases ({sign}{pct}% delta)."
            )
        else:
            is_evidence_complete = False
            root_causes.append("Telemetry limitation: Baseline complaint history missing from alert evidence.")

        # 3. Resolution Turnaround Analysis
        if evidence.previous_resolution_days is not None and evidence.current_resolution_days is not None:
            pct = evidence.resolution_delta_pct or (
                round(((evidence.current_resolution_days - evidence.previous_resolution_days) / evidence.previous_resolution_days) * 100, 1)
                if evidence.previous_resolution_days else 0
            )
            sign = "+" if pct >= 0 else ""
            root_causes.append(
                f"Turnaround degradation: Mean repair duration lengthened from {evidence.previous_resolution_days:.1f} "
                f"to {evidence.current_resolution_days:.1f} days ({sign}{pct}% change)."
            )
        else:
            is_evidence_complete = False
            root_causes.append("Telemetry limitation: Resolution cycle duration unrecorded for this alert.")

        # Assess completeness of signals
        signals_present = sum([
            1 if (evidence.previous_complaints is not None or evidence.current_complaints is not None) else 0,
            1 if (evidence.previous_resolution_days is not None or evidence.current_resolution_days is not None) else 0,
            1 if (evidence.previous_maintenance_teams is not None or evidence.current_maintenance_teams is not None) else 0,
        ])

        # Executive Summary Generation
        dept_name = department.value.replace("_", " ").title()
        if signals_present == 3:
            summary_parts = [
                f"{risk_level.value} operational risk detected in {dept_name} ({zone}) with composite score {risk_score:.1f}/100."
            ]
            if evidence.complaint_delta_pct is not None:
                sign = "+" if evidence.complaint_delta_pct >= 0 else ""
                summary_parts.append(f"Complaint backlog rose {sign}{evidence.complaint_delta_pct}%.")
            if evidence.resolution_delta_pct is not None:
                sign = "+" if evidence.resolution_delta_pct >= 0 else ""
                summary_parts.append(f"Resolution duration increased {sign}{evidence.resolution_delta_pct}%.")
            if evidence.capacity_pressure_pct is not None and evidence.capacity_pressure_pct > 0:
                summary_parts.append(f"Operating under {evidence.capacity_pressure_pct}% maintenance team capacity deficit.")
            executive_summary = " ".join(summary_parts)
            confidence_score = 0.95
        elif signals_present > 0:
            executive_summary = (
                f"{risk_level.value} operational risk flagged for {dept_name} ({zone}) based on composite score {risk_score:.1f}/100. "
                "Warning: Partial operational telemetry received; recommendations reflect conservative baseline defaults."
            )
            confidence_score = 0.65
        else:
            executive_summary = (
                f"{risk_level.value} operational risk flagged for {dept_name} ({zone}) based on composite score {risk_score:.1f}/100. "
                "Warning: Incomplete operational telemetry received (no historical metrics available); baseline defaults applied."
            )
            confidence_score = 0.40

        # Incorporate operator focus hint if provided
        focus_area = req_dict.get("focus_area")
        if focus_area and focus_area != "RESOURCE_ALLOCATION":
            executive_summary += f" Analysis weighted for operator focus: {focus_area}."

        # Action Recommendations
        recommended_actions: List[RecommendedAction] = []
        catalog = DEPARTMENT_RECOMMENDATION_CATALOG.get(
            department, DEPARTMENT_RECOMMENDATION_CATALOG[Department.WATER_SUPPLY]
        )

        has_teams_evidence = (
            evidence.previous_maintenance_teams is not None
            and evidence.current_maintenance_teams is not None
        )
        has_resolution_evidence = (
            evidence.previous_resolution_days is not None
            and evidence.current_resolution_days is not None
        )

        prev_teams_val = int(evidence.previous_maintenance_teams) if has_teams_evidence else 0
        curr_teams_val = int(evidence.current_maintenance_teams) if has_teams_evidence else 0
        teams_diff = max(1, prev_teams_val - curr_teams_val) if has_teams_evidence else None

        prev_res_val = evidence.previous_resolution_days if has_resolution_evidence else None
        curr_res_val = evidence.current_resolution_days if has_resolution_evidence else None

        for template in catalog:
            # If this is a team deployment action, check if team evidence is present
            if template["action_type"] == "DEPLOY_RESERVE_TEAMS":
                if has_teams_evidence and teams_diff is not None:
                    action_title = template["title_template_complete"].format(
                        teams_needed=teams_diff,
                        prev_teams=prev_teams_val,
                        zone=zone,
                    )
                    impact = template["impact_template_complete"].format(
                        curr_res=curr_res_val or "elevated",
                        prev_res=prev_res_val or "baseline",
                    )
                    resources = template["resource_template_complete"].format(
                        teams_needed=teams_diff,
                        prev_teams=prev_teams_val,
                    )
                else:
                    action_title = template["title_template_incomplete"].format(zone=zone)
                    impact = template["impact_template_incomplete"]
                    resources = template["resource_template_incomplete"]
            else:
                # Other catalog actions
                use_complete = is_evidence_complete
                title_tpl = template["title_template_complete"] if use_complete else template["title_template_incomplete"]
                impact_tpl = template["impact_template_complete"] if use_complete else template["impact_template_incomplete"]
                res_tpl = template["resource_template_complete"] if use_complete else template["resource_template_incomplete"]
                action_title = title_tpl.format(zone=zone)
                impact = impact_tpl
                resources = res_tpl

            recommended_actions.append(
                RecommendedAction(
                    action_type=template["action_type"],
                    title=action_title,
                    priority=template["priority"],
                    estimated_impact=impact,
                    resource_required=resources,
                )
            )

        return ExplainResponse(
            is_synthetic=True,
            alert_id=alert_id,
            department=department,
            risk_level=risk_level,
            risk_score=risk_score,
            engine_mode="DETERMINISTIC_FALLBACK",
            executive_summary=executive_summary,
            root_causes=root_causes,
            recommended_interventions=recommended_actions,
            confidence_score=confidence_score,
            disclaimer=(
                "Prototype heuristic decision support for demonstration; "
                "verify against municipal dispatch protocol. All operational data is synthetic."
            ),
        )


# Singleton helper function for direct route mounting by Member 2
_assistant_instance = AIAssistant()


def explain_alert(
    alert: Union[BaseModel, Dict[str, Any]],
    request: Optional[Union[BaseModel, Dict[str, Any]]] = None,
) -> ExplainResponse:
    """Convenience function for FastAPI endpoint integration."""
    return _assistant_instance.explain_alert(alert=alert, request=request)


# Direct alias for Member 2's router compatibility (contract_api.py calls explain_alert_evidence)
explain_alert_evidence = explain_alert
