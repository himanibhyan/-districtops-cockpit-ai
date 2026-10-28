"""Integration test suite verifying API contract endpoints and risk scoring."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["is_synthetic"] is True
    assert data["ai_service_ready"] is True


def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["is_synthetic"] is True
    assert data["dataset_tag"] == "[SYNTHETIC-DEMO]"
    assert "kpis" in data
    assert data["kpis"]["overall_health_score"] > 0
    assert len(data["department_summaries"]) >= 3


def test_alerts_list():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert data["is_synthetic"] is True
    assert data["total"] >= 1
    assert any(a["id"] == "alt-water-001" for a in data["alerts"])


def test_benchmark_alert_detail():
    response = client.get("/api/alerts/alt-water-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "alt-water-001"
    assert data["department"] == "WATER_SUPPLY"
    # Benchmark formula verification:
    # (0.40 * 76.0) + (0.35 * 85.0) + (0.25 * 75.0) = 30.4 + 29.75 + 18.75 = 78.9
    assert data["risk_score"] == 78.9
    assert data["risk_level"] == "HIGH"
    assert data["evidence"]["complaint_delta_pct"] == 38.0
    assert data["evidence"]["resolution_delta_pct"] == 60.0
    assert data["evidence"]["capacity_pressure_pct"] == 37.5


def test_alert_not_found():
    response = client.get("/api/alerts/non-existent-alert")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert data["detail"]["error"]["code"] == "ALERT_NOT_FOUND"


def test_alert_explain():
    response = client.post("/api/alerts/alt-water-001/explain", json={
        "focus_area": "RESOURCE_ALLOCATION",
        "user_note": "How to resolve within 48h?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_synthetic"] is True
    assert data["alert_id"] == "alt-water-001"
    assert data["department"] == "WATER_SUPPLY"
    assert data["risk_level"] == "HIGH"
    assert data["risk_score"] == 78.9
    assert data["engine_mode"] == "DETERMINISTIC_FALLBACK"
    assert len(data["root_causes"]) >= 2
    assert len(data["recommended_interventions"]) >= 1


def test_interventions_lifecycle():
    # 1. List
    list_res = client.get("/api/interventions")
    assert list_res.status_code == 200
    initial_total = list_res.json()["total"]

    # 2. Create Action
    create_res = client.post("/api/interventions", json={
        "alert_id": "alt-water-001",
        "title": "Redeploy 3 reserve maintenance crews to Zone 4",
        "action_type": "DEPLOY_RESERVE_TEAMS",
        "priority": "HIGH",
        "assigned_to": "Field Ops Team Bravo",
        "notes": "Fast-tracked due to High Risk Alert."
    })
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["is_synthetic"] is True
    assert created["status"] == "PROPOSED"
    item_id = created["id"]

    # 3. Patch Tracking Status
    patch_res = client.patch(f"/api/interventions/{item_id}", json={
        "status": "IN_PROGRESS",
        "notes": "Crews arrived on site; pipeline pressure stabilization underway."
    })
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "IN_PROGRESS"
    assert "Crews arrived" in updated["notes"]
