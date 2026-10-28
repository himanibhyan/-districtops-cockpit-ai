"""Interventions API — CRUD operations for district operational interventions."""
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

router = APIRouter(tags=["Interventions"])


class Note(BaseModel):
    id: str
    timestamp: str
    author: str
    text: str


class AuditEntry(BaseModel):
    id: str
    timestamp: str
    actor: str
    action: str
    details: str
    previousValue: Optional[str] = None
    newValue: Optional[str] = None


class InterventionModel(BaseModel):
    id: str
    alertId: Optional[str] = None
    incidentId: Optional[str] = None
    title: str
    department: str
    wardId: str
    wardName: str
    priority: str
    status: str
    assignedTo: str
    proposedAction: str
    targetDate: str
    createdAt: str
    updatedAt: str
    resolvedAt: Optional[str] = None
    notes: List[Note] = Field(default_factory=list)
    history: List[AuditEntry] = Field(default_factory=list)


class InterventionCreate(BaseModel):
    alertId: Optional[str] = None
    incidentId: Optional[str] = None
    title: str
    department: str
    wardId: str
    wardName: str
    priority: str = "HIGH"
    assignedTo: str
    proposedAction: str
    targetDate: str


class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    notes: Optional[str] = None


# Initial in-memory interventions
INTERVENTIONS_DB: dict[str, InterventionModel] = {
    "INT-2026-001": InterventionModel(
        id="INT-2026-001",
        alertId="ALERT-W07-SAN-BACKLOG",
        incidentId="INC-2026-092",
        title="Emergency Waste Clearance & Tipper Diversion for Kalyanpur Mandi",
        department="SANITATION",
        wardId="W-07",
        wardName="Kalyanpur Mandi",
        priority="HIGH",
        status="IN_PROGRESS",
        assignedTo="Municipal Sanitation Taskforce - East Zone",
        proposedAction="Authorize mutual-aid diversion of 4 hydraulic tippers from Haiderpur depot and issue showcause notice to default concessionaire.",
        targetDate="2026-10-29",
        createdAt="2026-10-27T20:00:00Z",
        updatedAt="2026-10-28T06:30:00Z",
        notes=[
            Note(id="NOTE-1", timestamp="2026-10-27T20:30:00Z", author="District Magistrate Office", text="Intervention created following 400% surge in uncollected waste complaints."),
            Note(id="NOTE-2", timestamp="2026-10-28T06:30:00Z", author="Chief Sanitation Inspector", text="2 relief tippers arrived on site. Clearing Gate 3 entrance first.")
        ],
        history=[
            AuditEntry(id="AUD-INT-1", timestamp="2026-10-27T20:00:00Z", actor="DM Office", action="INTERVENTION_CREATED", details="Intervention initialized from Early Warning Alert ALERT-W07-SAN-BACKLOG"),
            AuditEntry(id="AUD-INT-2", timestamp="2026-10-28T06:30:00Z", actor="Zonal Inspector", action="STATUS_UPDATED", details="Status transitioned from ASSIGNED to IN_PROGRESS", previousValue="ASSIGNED", newValue="IN_PROGRESS")
        ]
    )
}


@router.get("/interventions")
def list_interventions(
    department: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    ward_id: Optional[str] = Query(None),
):
    results = list(INTERVENTIONS_DB.values())
    if department:
        results = [i for i in results if i.department.lower() == department.lower()]
    if status_filter:
        results = [i for i in results if i.status.lower() == status_filter.lower()]
    if ward_id:
        results = [i for i in results if i.wardId == ward_id]

    return {
        "total": len(results),
        "interventions": results
    }


@router.get("/interventions/{intervention_id}")
def get_intervention(intervention_id: str):
    if intervention_id not in INTERVENTIONS_DB:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return INTERVENTIONS_DB[intervention_id]


@router.post("/interventions", status_code=status.HTTP_201_CREATED)
def create_intervention(payload: InterventionCreate):
    new_id = f"INT-{datetime.utcnow().year}-{len(INTERVENTIONS_DB) + 1:03d}"
    now = datetime.utcnow().isoformat() + "Z"

    item = InterventionModel(
        id=new_id,
        alertId=payload.alertId,
        incidentId=payload.incidentId,
        title=payload.title,
        department=payload.department,
        wardId=payload.wardId,
        wardName=payload.wardName,
        priority=payload.priority,
        status="ASSIGNED",
        assignedTo=payload.assignedTo,
        proposedAction=payload.proposedAction,
        targetDate=payload.targetDate,
        createdAt=now,
        updatedAt=now,
        notes=[
            Note(id=f"NOTE-{int(datetime.utcnow().timestamp())}", timestamp=now, author="District Operations Desk", text=f"Intervention authorized: {payload.proposedAction}")
        ],
        history=[
            AuditEntry(id=f"AUD-{int(datetime.utcnow().timestamp())}", timestamp=now, actor="District Operations Desk", action="INTERVENTION_CREATED", details=f"Created and assigned to {payload.assignedTo}")
        ]
    )
    INTERVENTIONS_DB[new_id] = item
    return item


@router.patch("/interventions/{intervention_id}")
def update_intervention(intervention_id: str, payload: InterventionUpdate):
    if intervention_id not in INTERVENTIONS_DB:
        raise HTTPException(status_code=404, detail="Intervention not found")

    item = INTERVENTIONS_DB[intervention_id]
    now = datetime.utcnow().isoformat() + "Z"

    if payload.status:
        old_status = item.status
        item.status = payload.status
        item.history.append(
            AuditEntry(
                id=f"AUD-{int(datetime.utcnow().timestamp())}",
                timestamp=now,
                actor="District Operations Desk",
                action="STATUS_UPDATED",
                details=f"Status transitioned from {old_status} to {payload.status}",
                previousValue=old_status,
                newValue=payload.status
            )
        )
        if payload.status == "RESOLVED":
            item.resolvedAt = now

    if payload.assignedTo:
        item.assignedTo = payload.assignedTo

    if payload.notes:
        item.notes.append(
            Note(
                id=f"NOTE-{int(datetime.utcnow().timestamp())}",
                timestamp=now,
                author="District Operations Desk",
                text=payload.notes
            )
        )

    item.updatedAt = now
    INTERVENTIONS_DB[intervention_id] = item
    return item
