"""In-memory / persistent mock store conforming strictly to the API Contract."""
from datetime import datetime
from typing import Dict, List, Optional
from app.models.schemas import (
    AlertDetailResponse,
    AlertEvidence,
    AlertItem,
    AlertStatus,
    Department,
    DepartmentSummary,
    DashboardKPIs,
    DashboardResponse,
    InterventionItem,
    InterventionPriority,
    InterventionStatus,
    RiskLevel,
)
from app.services.risk_scoring import calculate_risk_score, get_risk_level


# Benchmark Scenario: District Water Supply Anomaly
# I_backlog = 76.0, I_delay = 85.0, I_capacity = 75.0 -> Score = 78.9 (HIGH)
BENCHMARK_SCORE = calculate_risk_score(76.0, 85.0, 75.0)

ALERTS_STORE: Dict[str, AlertDetailResponse] = {
    "alt-water-001": AlertDetailResponse(
        is_synthetic=True,
        id="alt-water-001",
        department=Department.WATER_SUPPLY,
        title="Severe Water Delivery & Maintenance Backlog",
        district_zone="Zone 4 - North Sector",
        risk_score=BENCHMARK_SCORE,
        risk_level=get_risk_level(BENCHMARK_SCORE),
        status=AlertStatus.OPEN,
        summary="Complaint volume rose 38% while resolution time lengthened by 60% due to reduced field crews.",
        created_at=datetime(2026, 10, 28, 10, 30, 0),
        evidence=AlertEvidence(
            previous_complaints=100.0,
            current_complaints=138.0,
            complaint_delta_pct=38.0,
            previous_resolution_days=2.0,
            current_resolution_days=3.2,
            resolution_delta_pct=60.0,
            previous_maintenance_teams=8.0,
            current_maintenance_teams=5.0,
            capacity_pressure_pct=37.5,
        )
    ),
    "alt-elec-002": AlertDetailResponse(
        is_synthetic=True,
        id="alt-elec-002",
        department=Department.ELECTRICITY,
        title="Feeder 4 Overload & Outage Surge",
        district_zone="Zone 2 - Industrial Corridor",
        risk_score=42.0,
        risk_level=RiskLevel.MEDIUM,
        status=AlertStatus.OPEN,
        summary="Transformer thermal limits repeatedly breached with minor team availability constraints.",
        created_at=datetime(2026, 10, 28, 10, 15, 0),
        evidence=AlertEvidence(
            previous_complaints=40.0,
            current_complaints=52.0,
            complaint_delta_pct=30.0,
            previous_resolution_days=1.0,
            current_resolution_days=1.4,
            resolution_delta_pct=40.0,
            previous_maintenance_teams=6.0,
            current_maintenance_teams=5.0,
            capacity_pressure_pct=16.7,
        )
    ),
    "alt-san-003": AlertDetailResponse(
        is_synthetic=True,
        id="alt-san-003",
        department=Department.SANITATION,
        title="Commercial Mandi Waste Clearance Stagnation",
        district_zone="Zone 7 - Kalyanpur Market",
        risk_score=74.5,
        risk_level=RiskLevel.HIGH,
        status=AlertStatus.OPEN,
        summary="Refuse buildup over 72 hours due to hydraulic compactor fleet failure.",
        created_at=datetime(2026, 10, 28, 9, 45, 0),
        evidence=AlertEvidence(
            previous_complaints=30.0,
            current_complaints=66.0,
            complaint_delta_pct=120.0,
            previous_resolution_days=1.0,
            current_resolution_days=2.8,
            resolution_delta_pct=180.0,
            previous_maintenance_teams=5.0,
            current_maintenance_teams=2.0,
            capacity_pressure_pct=60.0,
        )
    )
}

INTERVENTIONS_STORE: Dict[str, InterventionItem] = {
    "int-001": InterventionItem(
        is_synthetic=True,
        id="int-001",
        alert_id="alt-water-001",
        title="Redeploy 3 reserve maintenance crews to Zone 4",
        action_type="DEPLOY_RESERVE_TEAMS",
        priority=InterventionPriority.HIGH,
        status=InterventionStatus.APPROVED,
        assigned_to="Field Ops Team Bravo",
        created_at=datetime(2026, 10, 28, 10, 45, 0),
        updated_at=datetime(2026, 10, 28, 10, 50, 0),
        notes="Approved by District Commissioner on duty."
    )
}


def get_dashboard_data() -> DashboardResponse:
    high_count = sum(1 for a in ALERTS_STORE.values() if a.risk_level == RiskLevel.HIGH)
    med_count = sum(1 for a in ALERTS_STORE.values() if a.risk_level == RiskLevel.MEDIUM)
    open_ints = sum(1 for i in INTERVENTIONS_STORE.values() if i.status != InterventionStatus.COMPLETED)

    summaries = [
        DepartmentSummary(
            department=Department.WATER_SUPPLY,
            risk_score=ALERTS_STORE["alt-water-001"].risk_score,
            risk_level=ALERTS_STORE["alt-water-001"].risk_level,
            active_alerts_count=1,
            primary_bottleneck="Team shortage & aging valves"
        ),
        DepartmentSummary(
            department=Department.ELECTRICITY,
            risk_score=ALERTS_STORE["alt-elec-002"].risk_score,
            risk_level=ALERTS_STORE["alt-elec-002"].risk_level,
            active_alerts_count=1,
            primary_bottleneck="Transformer overload feeder 4"
        ),
        DepartmentSummary(
            department=Department.SANITATION,
            risk_score=ALERTS_STORE["alt-san-003"].risk_score,
            risk_level=ALERTS_STORE["alt-san-003"].risk_level,
            active_alerts_count=1,
            primary_bottleneck="Compactor vehicle hydraulic breakdowns"
        ),
        DepartmentSummary(
            department=Department.ROADS_TRAFFIC,
            risk_score=28.0,
            risk_level=RiskLevel.LOW,
            active_alerts_count=0,
            primary_bottleneck="Nominal traffic flows and pothole filling on schedule"
        ),
        DepartmentSummary(
            department=Department.PUBLIC_HEALTH,
            risk_score=34.0,
            risk_level=RiskLevel.LOW,
            active_alerts_count=0,
            primary_bottleneck="Routine surveillance and medical stocks intact"
        )
    ]

    benchmarks = {
        "water": {
            "source": "Jal Jeevan Mission Har Ghar Jal (fhtc_water_coverage.pdf)",
            "classification": "OFFICIAL",
            "haryana_coverage_pct": 100.0,
            "haryana_tap_households": 3041314,
            "national_coverage_pct": 82.59
        },
        "sanitation": {
            "source": "Swachh Bharat Mission Grameen (sanitation_dataset.csv)",
            "classification": "OPEN_DATA",
            "gurugram_coverage_pct": 100.0,
            "gurugram_ihhl_achieved": 53523
        },
        "health": {
            "source": "National Health Mission HMIS Haryana (hmis_haryana.zip)",
            "classification": "OFFICIAL",
            "gurugram_observations_count": 11010,
            "fiscal_years_range": "2008-09 to 2021-22"
        },
        "wards_gis": {
            "source": "Municipal Corporation of Gurugram (gurugram_wards.kml)",
            "classification": "OPEN_DATA",
            "ward_count": 35
        }
    }

    return DashboardResponse(
        is_synthetic=True,
        dataset_tag="[SYNTHETIC-DEMO]",
        district_name="Central District",
        kpis=DashboardKPIs(
            overall_health_score=68.5,
            active_high_alerts=high_count,
            active_medium_alerts=med_count,
            open_interventions=open_ints,
            resolved_today=12
        ),
        department_summaries=summaries,
        reference_benchmarks=benchmarks
    )
