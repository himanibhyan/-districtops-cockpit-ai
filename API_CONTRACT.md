# DistrictOps Cockpit AI — API & Integration Contract

**Version:** 1.0.0-hackathon<br>
**Target:** 4-Hour Hackathon Delivery<br>
**Core Architecture Workflow:** `DATA → DETECTION → EXPLANATION → ACTION → TRACKING`<br>
**Data Integrity Notice:** All initial demonstration records are marked with `"is_synthetic": true` and `"dataset_tag": "[SYNTHETIC-DEMO]"`. Prototype risk scores are illustrative indicators, not calibrated epidemiological/actuarial probabilities.

---

## 1. Ownership & Boundary Matrix

| Role | Primary Owner | Scope & Deliverables | Shared Files / Interfaces |
| :--- | :--- | :--- | :--- |
| **Member 1 (Frontend)** | Frontend Developer | React / UI Cockpit, visual charts, action dispatch UI | Consumes `/api/*` endpoints |
| **Member 2 (Backend Core)** | Backend Developer | FastAPI routing, SQLite DB, Synthetic Data Loader, Risk Scoring Engine | `backend/app/main.py`, `backend/app/db/`, `backend/app/api/` |
| **Member 3 (AI & Testing)** | AI & Integration Lead (You) | AI Decision Assistant (`backend/app/services/ai_assistant.py`), Deterministic Fallback, Integration Tests (`tests/`) | Authoritative alert explanation endpoint, integration contract |

> **Safety Rule:** No frontend files are to be edited by the AI/integration developer. Any shared router/model files will strictly follow this agreed schema.

---

## 2. Common Enums & Data Types

### `Department` (string enum)
* `WATER_SUPPLY`
* `SANITATION`
* `ROADS_TRAFFIC`
* `ELECTRICITY`
* `PUBLIC_HEALTH`

### `RiskLevel` (string enum)
* `LOW` (< 40)
* `MEDIUM` (>= 40 and < 70)
* `HIGH` (>= 70)

### `AlertStatus` (string enum)
* `OPEN`
* `INVESTIGATING`
* `ACTION_TAKEN`
* `RESOLVED`

### `InterventionStatus` (string enum)
* `PROPOSED`
* `APPROVED`
* `IN_PROGRESS`
* `COMPLETED`
* `REJECTED`

### `InterventionPriority` (string enum)
* `LOW`
* `MEDIUM`
* `HIGH`
* `URGENT`

---

## 3. Standard Error Format

All error responses return standard HTTP error codes (`400`, `404`, `422`, `500`) with this JSON body:

```json
{
  "error": {
    "code": "ALERT_NOT_FOUND",
    "message": "Alert with ID 'alt-water-001' not found",
    "details": {
      "alert_id": "alt-water-001"
    }
  }
}
```

---

## 4. Prototype Risk Scoring Engine Specification

The backend computes an operational **Risk Score** ($0 - 100$) for each sector using three normalized operational indicators:

$$\text{Risk Score} = 0.40 \times I_{\text{backlog}} + 0.35 \times I_{\text{delay}} + 0.25 \times I_{\text{capacity}}$$

### Indicator Definitions
1. **$I_{\text{backlog}}$ (Complaint / Backlog Growth):** Normalized delta in unresolved citizen complaints or reported faults ($40\%$ weight).
2. **$I_{\text{delay}}$ (Resolution Delay):** Normalized increase in mean turnaround/resolution time in days ($35\%$ weight).
3. **$I_{\text{capacity}}$ (Capacity Pressure):** Ratio of active operational teams to nominal baseline ($25\%$ weight).

### Benchmark Scenario: District Water Supply Anomaly
The synthetic dataset must include this specific benchmark scenario for consistency:
* **Metric 1 (Complaints):** Previous: `100`, Current: `138` ($+38\%$ growth $\rightarrow I_{\text{backlog}} \approx 76.0$)
* **Metric 2 (Resolution Time):** Previous: `2.0 days`, Current: `3.2 days` ($+60\%$ delay $\rightarrow I_{\text{delay}} \approx 85.0$)
* **Metric 3 (Maintenance Teams):** Previous: `8 teams`, Current: `5 teams` ($-37.5\%$ capacity drop $\rightarrow I_{\text{capacity}} \approx 75.0$)

**Computed Risk Score:**
$$\text{Score} = (0.40 \times 76.0) + (0.35 \times 85.0) + (0.25 \times 75.0) = 30.4 + 29.75 + 18.75 = 78.9 \rightarrow \mathbf{HIGH}$$

---

## 5. Endpoints & JSON Contracts

### 5.1 `GET /api/health`
Health check and environment readiness probe.

* **Response (`200 OK`):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "is_synthetic": true,
  "ai_service_ready": true,
  "timestamp": "2026-10-28T11:00:00Z"
}
```

---

### 5.2 `GET /api/dashboard`
Summary metrics, high-level KPIs, and district operational summary.

* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "dataset_tag": "[SYNTHETIC-DEMO]",
  "district_name": "Central District",
  "kpis": {
    "overall_health_score": 68.5,
    "active_high_alerts": 2,
    "active_medium_alerts": 4,
    "open_interventions": 3,
    "resolved_today": 12
  },
  "department_summaries": [
    {
      "department": "WATER_SUPPLY",
      "risk_score": 78.9,
      "risk_level": "HIGH",
      "active_alerts_count": 1,
      "primary_bottleneck": "Team shortage & aging valves"
    },
    {
      "department": "ELECTRICITY",
      "risk_score": 42.0,
      "risk_level": "MEDIUM",
      "active_alerts_count": 1,
      "primary_bottleneck": "Transformer overload feeder 4"
    }
  ]
}
```

---

### 5.3 `GET /api/alerts`
Lists all operational alerts with computed risk indicators.

* **Query Parameters:**
  * `department` (optional, string enum)
  * `risk_level` (optional, string enum: `LOW`, `MEDIUM`, `HIGH`)
  * `status` (optional, string enum: `OPEN`, `INVESTIGATING`, etc.)

* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "total": 1,
  "alerts": [
    {
      "id": "alt-water-001",
      "department": "WATER_SUPPLY",
      "title": "Severe Water Delivery & Maintenance Backlog",
      "district_zone": "Zone 4 - North Sector",
      "risk_score": 78.9,
      "risk_level": "HIGH",
      "status": "OPEN",
      "created_at": "2026-10-28T10:30:00Z",
      "evidence": {
        "previous_complaints": 100,
        "current_complaints": 138,
        "complaint_delta_pct": 38.0,
        "previous_resolution_days": 2.0,
        "current_resolution_days": 3.2,
        "resolution_delta_pct": 60.0,
        "previous_maintenance_teams": 8,
        "current_maintenance_teams": 5,
        "capacity_pressure_pct": 37.5
      }
    }
  ]
}
```

---

### 5.4 `GET /api/alerts/{id}`
Returns details for a specific alert, including authoritative computed metric evidence.

* **Path Parameter:** `id` (e.g., `alt-water-001`)
* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "id": "alt-water-001",
  "department": "WATER_SUPPLY",
  "title": "Severe Water Delivery & Maintenance Backlog",
  "district_zone": "Zone 4 - North Sector",
  "risk_score": 78.9,
  "risk_level": "HIGH",
  "status": "OPEN",
  "summary": "Complaint volume rose 38% while resolution time lengthened by 60% due to reduced field crews.",
  "created_at": "2026-10-28T10:30:00Z",
  "evidence": {
    "previous_complaints": 100,
    "current_complaints": 138,
    "complaint_delta_pct": 38.0,
    "previous_resolution_days": 2.0,
    "current_resolution_days": 3.2,
    "resolution_delta_pct": 60.0,
    "previous_maintenance_teams": 8,
    "current_maintenance_teams": 5,
    "capacity_pressure_pct": 37.5
  }
}
```

---

### 5.5 `POST /api/alerts/{id}/explain`
Generates an AI-powered or deterministic explanation based **strictly on authoritative computed evidence retrieved from the backend**.

* **Path Parameter:** `id` (string, required)
* **Request Body:**
```json
{
  "focus_area": "RESOURCE_ALLOCATION",
  "user_note": "Optional operator question or context"
}
```
*(Body is optional. If empty `{}` is sent, default explanation is generated. The endpoint **NEVER** trusts client-supplied metrics).*

* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "alert_id": "alt-water-001",
  "department": "WATER_SUPPLY",
  "risk_level": "HIGH",
  "risk_score": 78.9,
  "engine_mode": "DETERMINISTIC_FALLBACK",
  "executive_summary": "High risk detected in Water Supply: +38% surge in complaints combined with a 60% increase in resolution time, compounded by a 37.5% drop in operational repair teams.",
  "root_causes": [
    "Field team depletion: 3 out of 8 maintenance teams offline (37.5% capacity reduction).",
    "Backlog compounding: Unresolved ticket volume grew from 100 to 138 cases.",
    "Turnaround degradation: Mean repair duration increased from 2.0 to 3.2 days."
  ],
  "recommended_interventions": [
    {
      "action_type": "DEPLOY_RESERVE_TEAMS",
      "title": "Redeploy 3 reserve maintenance crews to Zone 4",
      "priority": "HIGH",
      "estimated_impact": "Reduces resolution latency from 3.2 days to ~2.1 days within 48 hours",
      "resource_required": "3 crews + 2 vacuum tankers"
    },
    {
      "action_type": "WATER_RATIONING_NOTICE",
      "title": "Send localized advisory to 1,200 affected households",
      "priority": "MEDIUM",
      "estimated_impact": "Curbs repeated inbound panic complaints by an estimated 25%",
      "resource_required": "Automated SMS / IVR notification dispatch"
    }
  ],
  "confidence_score": 0.94,
  "disclaimer": "Prototype heuristic decision support for demonstration; verify against municipal dispatch protocol."
}
```

---

### 5.6 `GET /api/interventions`
Lists logged actions and their current operational tracking status.

* **Query Parameters:**
  * `alert_id` (optional, string)
  * `status` (optional, string enum: `PROPOSED`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`)

* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "total": 1,
  "interventions": [
    {
      "id": "int-001",
      "alert_id": "alt-water-001",
      "title": "Redeploy 3 reserve maintenance crews to Zone 4",
      "action_type": "DEPLOY_RESERVE_TEAMS",
      "priority": "HIGH",
      "status": "APPROVED",
      "assigned_to": "Field Ops Team Bravo",
      "created_at": "2026-10-28T10:45:00Z",
      "updated_at": "2026-10-28T10:50:00Z",
      "notes": "Approved by District Commissioner on duty."
    }
  ]
}
```

---

### 5.7 `POST /api/interventions`
Creates/dispatches a new intervention action (the **ACTION** step of the workflow).

* **Request Body:**
```json
{
  "alert_id": "alt-water-001",
  "title": "Redeploy 3 reserve maintenance crews to Zone 4",
  "action_type": "DEPLOY_RESERVE_TEAMS",
  "priority": "HIGH",
  "assigned_to": "Field Ops Team Bravo",
  "notes": "Fast-tracked due to High Risk Alert."
}
```

* **Response (`201 Created`):**
```json
{
  "is_synthetic": true,
  "id": "int-002",
  "alert_id": "alt-water-001",
  "title": "Redeploy 3 reserve maintenance crews to Zone 4",
  "action_type": "DEPLOY_RESERVE_TEAMS",
  "priority": "HIGH",
  "status": "PROPOSED",
  "assigned_to": "Field Ops Team Bravo",
  "created_at": "2026-10-28T11:05:00Z",
  "updated_at": "2026-10-28T11:05:00Z",
  "notes": "Fast-tracked due to High Risk Alert."
}
```

---

### 5.8 `PATCH /api/interventions/{id}`
Updates intervention execution status and tracking audit notes (the **TRACKING** step of the workflow).

* **Path Parameter:** `id` (e.g., `int-002`)
* **Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "notes": "Crews arrived on site; pipeline pressure stabilization underway."
}
```

* **Response (`200 OK`):**
```json
{
  "is_synthetic": true,
  "id": "int-002",
  "alert_id": "alt-water-001",
  "title": "Redeploy 3 reserve maintenance crews to Zone 4",
  "action_type": "DEPLOY_RESERVE_TEAMS",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "assigned_to": "Field Ops Team Bravo",
  "created_at": "2026-10-28T11:05:00Z",
  "updated_at": "2026-10-28T11:10:00Z",
  "notes": "Crews arrived on site; pipeline pressure stabilization underway."
}
```

---

## 6. Official Pydantic v2 Code Schemas (`backend/app/models/schemas.py`)

```python
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
```
