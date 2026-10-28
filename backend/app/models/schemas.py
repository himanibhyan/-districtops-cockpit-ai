from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


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


class AlertStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    ACTION_TAKEN = "ACTION_TAKEN"
    RESOLVED = "RESOLVED"


class InterventionStatus(str, Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"


class InterventionPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


# --- Health & Dashboard Models ---
class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    is_synthetic: bool = True
    ai_service_ready: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DepartmentSummary(BaseModel):
    department: Department
    risk_score: float
    risk_level: RiskLevel
    active_alerts_count: int
    primary_bottleneck: str


class DashboardKPIs(BaseModel):
    overall_health_score: float
    active_high_alerts: int
    active_medium_alerts: int
    open_interventions: int
    resolved_today: int


class DashboardResponse(BaseModel):
    is_synthetic: bool = True
    dataset_tag: str = "[SYNTHETIC-DEMO]"
    district_name: str = "Central District"
    kpis: DashboardKPIs
    department_summaries: List[DepartmentSummary]


# --- Alert Models ---
class AlertEvidence(BaseModel):
    previous_complaints: float
    current_complaints: float
    complaint_delta_pct: float
    previous_resolution_days: float
    current_resolution_days: float
    resolution_delta_pct: float
    previous_maintenance_teams: float
    current_maintenance_teams: float
    capacity_pressure_pct: float


class AlertItem(BaseModel):
    id: str
    department: Department
    title: str
    district_zone: str
    risk_score: float
    risk_level: RiskLevel
    status: AlertStatus
    created_at: datetime
    evidence: AlertEvidence


class AlertListResponse(BaseModel):
    is_synthetic: bool = True
    total: int
    alerts: List[AlertItem]


class AlertDetailResponse(AlertItem):
    is_synthetic: bool = True
    summary: str


# --- AI Explanation Models ---
class ExplainRequest(BaseModel):
    focus_area: Optional[str] = "RESOURCE_ALLOCATION"
    user_note: Optional[str] = None


class RecommendedAction(BaseModel):
    action_type: str
    title: str
    priority: InterventionPriority
    estimated_impact: str
    resource_required: str


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
    confidence_score: float = 0.95
    disclaimer: str = (
        "Prototype heuristic decision support for demonstration; "
        "verify against municipal dispatch protocol."
    )


# --- Intervention & Tracking Models ---
class InterventionCreate(BaseModel):
    alert_id: str
    title: str
    action_type: str
    priority: InterventionPriority = InterventionPriority.MEDIUM
    assigned_to: str
    notes: Optional[str] = None


class InterventionUpdate(BaseModel):
    status: Optional[InterventionStatus] = None
    notes: Optional[str] = None


class InterventionItem(BaseModel):
    is_synthetic: bool = True
    id: str
    alert_id: str
    title: str
    action_type: str
    priority: InterventionPriority
    status: InterventionStatus
    assigned_to: str
    created_at: datetime
    updated_at: datetime
    notes: Optional[str] = None


class InterventionListResponse(BaseModel):
    is_synthetic: bool = True
    total: int
    interventions: List[InterventionItem]
