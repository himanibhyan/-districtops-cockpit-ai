"""SQLite database setup and migration for persistent interventions."""
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from app.config import DATA_DIR
from app.models.schemas import (
    InterventionItem,
    InterventionPriority,
    InterventionStatus,
)

DB_PATH = DATA_DIR / "districtops.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize tables if they don't exist."""
    conn = get_db_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS interventions (
                id TEXT PRIMARY KEY,
                alert_id TEXT NOT NULL,
                title TEXT NOT NULL,
                action_type TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL,
                assigned_to TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                notes TEXT,
                is_synthetic INTEGER DEFAULT 1
            )
        """)
        # Seed initial intervention if empty
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM interventions")
        count = cur.fetchone()[0]
        if count == 0:
            now_iso = datetime.utcnow().isoformat()
            cur.execute("""
                INSERT INTO interventions (
                    id, alert_id, title, action_type, priority, status, assigned_to, created_at, updated_at, notes, is_synthetic
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "int-001",
                "alt-water-001",
                "Redeploy 3 reserve maintenance crews to Zone 4",
                "DEPLOY_RESERVE_TEAMS",
                "HIGH",
                "APPROVED",
                "Field Ops Team Bravo",
                now_iso,
                now_iso,
                "Approved by District Commissioner on duty.",
                1
            ))
    conn.close()


def db_list_interventions(
    alert_id: Optional[str] = None,
    status: Optional[str] = None
) -> List[InterventionItem]:
    conn = get_db_connection()
    cur = conn.cursor()
    query = "SELECT * FROM interventions WHERE 1=1"
    params = []
    if alert_id:
        query += " AND alert_id = ?"
        params.append(alert_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    items = []
    for r in rows:
        items.append(InterventionItem(
            is_synthetic=bool(r["is_synthetic"]),
            id=r["id"],
            alert_id=r["alert_id"],
            title=r["title"],
            action_type=r["action_type"],
            priority=InterventionPriority(r["priority"]),
            status=InterventionStatus(r["status"]),
            assigned_to=r["assigned_to"],
            created_at=datetime.fromisoformat(r["created_at"]),
            updated_at=datetime.fromisoformat(r["updated_at"]),
            notes=r["notes"]
        ))
    return items


def db_create_intervention(item: InterventionItem) -> InterventionItem:
    conn = get_db_connection()
    with conn:
        conn.execute("""
            INSERT INTO interventions (
                id, alert_id, title, action_type, priority, status, assigned_to, created_at, updated_at, notes, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item.id,
            item.alert_id,
            item.title,
            item.action_type,
            item.priority.value,
            item.status.value,
            item.assigned_to,
            item.created_at.isoformat(),
            item.updated_at.isoformat(),
            item.notes,
            1 if item.is_synthetic else 0
        ))
    conn.close()
    return item


def db_update_intervention(
    id: str,
    status: Optional[InterventionStatus] = None,
    notes: Optional[str] = None
) -> Optional[InterventionItem]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM interventions WHERE id = ?", (id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    new_status = status.value if status else row["status"]
    new_notes = notes if notes is not None else row["notes"]
    now_iso = datetime.utcnow().isoformat()

    with conn:
        conn.execute("""
            UPDATE interventions
            SET status = ?, notes = ?, updated_at = ?
            WHERE id = ?
        """, (new_status, new_notes, now_iso, id))
    conn.close()

    return InterventionItem(
        is_synthetic=bool(row["is_synthetic"]),
        id=id,
        alert_id=row["alert_id"],
        title=row["title"],
        action_type=row["action_type"],
        priority=InterventionPriority(row["priority"]),
        status=InterventionStatus(new_status),
        assigned_to=row["assigned_to"],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(now_iso),
        notes=new_notes
    )


def db_get_count() -> int:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM interventions")
    cnt = cur.fetchone()[0]
    conn.close()
    return cnt
