"""Official Contract Router: Exposes /api/* endpoints adhering strictly to API Contract v1.0.0."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import (
    AlertDetailResponse,
    AlertItem,
    AlertListResponse,
    AlertStatus,
    DashboardResponse,
    Department,
    ExplainRequest,
    ExplainResponse,
    HealthResponse,
    InterventionCreate,
    InterventionItem,
    InterventionListResponse,
    InterventionStatus,
    InterventionUpdate,
    RiskLevel,
)
from app.services.ai_assistant import explain_alert_evidence
from app.services.contract_store import (
    ALERTS_STORE,
    get_dashboard_data,
)
from app.db.database import (
    db_list_interventions,
    db_create_intervention,
    db_update_intervention,
    db_get_count,
)

router = APIRouter(tags=["Contract V1.0"])


# 5.1 GET /api/health
@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse()


# 5.2 GET /api/dashboard
@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    return get_dashboard_data()


# 5.3 GET /api/alerts
@router.get("/alerts", response_model=AlertListResponse)
def get_alerts(
    department: Optional[Department] = Query(None),
    risk_level: Optional[RiskLevel] = Query(None),
    status: Optional[AlertStatus] = Query(None),
):
    results = list(ALERTS_STORE.values())

    if department:
        results = [a for a in results if a.department == department]
    if risk_level:
        results = [a for a in results if a.risk_level == risk_level]
    if status:
        results = [a for a in results if a.status == status]

    items = [
        AlertItem(
            id=a.id,
            department=a.department,
            title=a.title,
            district_zone=a.district_zone,
            risk_score=a.risk_score,
            risk_level=a.risk_level,
            status=a.status,
            created_at=a.created_at,
            evidence=a.evidence,
        )
        for a in results
    ]

    return AlertListResponse(is_synthetic=True, total=len(items), alerts=items)


# 5.4 GET /api/alerts/{id}
@router.get("/alerts/{id}", response_model=AlertDetailResponse)
def get_alert_detail(id: str):
    if id not in ALERTS_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "ALERT_NOT_FOUND",
                    "message": f"Alert with ID '{id}' not found",
                    "details": {"alert_id": id},
                }
            },
        )
    return ALERTS_STORE[id]


# 5.5 POST /api/alerts/{id}/explain
@router.post("/alerts/{id}/explain", response_model=ExplainResponse)
def explain_alert(id: str, request: Optional[ExplainRequest] = None):
    if id not in ALERTS_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "ALERT_NOT_FOUND",
                    "message": f"Alert with ID '{id}' not found",
                    "details": {"alert_id": id},
                }
            },
        )
    alert = ALERTS_STORE[id]
    return explain_alert_evidence(alert, request)


# 5.6 GET /api/interventions (Persistent SQLite)
@router.get("/interventions", response_model=InterventionListResponse)
def list_interventions(
    alert_id: Optional[str] = Query(None),
    status: Optional[InterventionStatus] = Query(None),
):
    status_val = status.value if status else None
    results = db_list_interventions(alert_id=alert_id, status=status_val)
    return InterventionListResponse(
        is_synthetic=True, total=len(results), interventions=results
    )


# 5.7 POST /api/interventions (Persistent SQLite)
@router.post(
    "/interventions",
    response_model=InterventionItem,
    status_code=status.HTTP_201_CREATED,
)
def create_intervention(payload: InterventionCreate):
    total = db_get_count()
    new_id = f"int-{total + 1:03d}"
    now = datetime.utcnow()

    item = InterventionItem(
        is_synthetic=True,
        id=new_id,
        alert_id=payload.alert_id,
        title=payload.title,
        action_type=payload.action_type,
        priority=payload.priority,
        status=InterventionStatus.PROPOSED,
        assigned_to=payload.assigned_to,
        created_at=now,
        updated_at=now,
        notes=payload.notes,
    )
    return db_create_intervention(item)


# 5.8 PATCH /api/interventions/{id} (Persistent SQLite)
@router.patch("/interventions/{id}", response_model=InterventionItem)
def update_intervention(id: str, payload: InterventionUpdate):
    updated = db_update_intervention(id, status=payload.status, notes=payload.notes)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "INTERVENTION_NOT_FOUND",
                    "message": f"Intervention with ID '{id}' not found",
                    "details": {"intervention_id": id},
                }
            },
        )
    return updated
