"""Official Contract Router: Exposes /api/* endpoints exactly adhering to Version 1.0.0-hackathon."""
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
    INTERVENTIONS_STORE,
    get_dashboard_data,
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


# 5.6 GET /api/interventions
@router.get("/interventions", response_model=InterventionListResponse)
def list_interventions(
    alert_id: Optional[str] = Query(None),
    status: Optional[InterventionStatus] = Query(None),
):
    results = list(INTERVENTIONS_STORE.values())

    if alert_id:
        results = [i for i in results if i.alert_id == alert_id]
    if status:
        results = [i for i in results if i.status == status]

    return InterventionListResponse(
        is_synthetic=True, total=len(results), interventions=results
    )


# 5.7 POST /api/interventions
@router.post(
    "/interventions",
    response_model=InterventionItem,
    status_code=status.HTTP_201_CREATED,
)
def create_intervention(payload: InterventionCreate):
    new_id = f"int-{len(INTERVENTIONS_STORE) + 1:03d}"
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
    INTERVENTIONS_STORE[new_id] = item
    return item


# 5.8 PATCH /api/interventions/{id}
@router.patch("/interventions/{id}", response_model=InterventionItem)
def update_intervention(id: str, payload: InterventionUpdate):
    if id not in INTERVENTIONS_STORE:
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

    item = INTERVENTIONS_STORE[id]
    if payload.status is not None:
        item.status = payload.status
    if payload.notes is not None:
        item.notes = payload.notes
    item.updated_at = datetime.utcnow()

    INTERVENTIONS_STORE[id] = item
    return item
