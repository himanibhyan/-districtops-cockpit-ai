"""Alerts API — Early warning alerts generated from real data patterns."""
from fastapi import APIRouter, Query
from typing import Optional
from app.main import data_store

router = APIRouter(tags=["Alerts"])


@router.get("/alerts")
def list_alerts(severity: Optional[str] = Query(None)):
    """Generate evidence-based early warning alerts from integrated datasets."""
    alerts = []

    # ── Alert 1: Sanitation districts below threshold ──────────
    if data_store.sanitation is not None:
        df = data_store.sanitation
        low_coverage = df[df["IHHLCoveragePer"] < 80]
        if len(low_coverage) > 0:
            worst = low_coverage.nsmallest(5, "IHHLCoveragePer")
            for _, row in worst.iterrows():
                alert = {
                    "id": f"ALERT-SAN-{row['DistrictName'].upper().replace(' ', '-')}",
                    "title": f"Low IHHL Sanitation Coverage in {row['DistrictName']}, {row['StateName']}",
                    "department": "SANITATION",
                    "area": row["DistrictName"],
                    "state": row["StateName"],
                    "administrative_level": "district",
                    "severity": "HIGH" if row["IHHLCoveragePer"] < 50 else "MEDIUM",
                    "indicator": "IHHL Coverage %",
                    "observed_value": float(row["IHHLCoveragePer"]),
                    "threshold": 80.0,
                    "threshold_type": "configurable_minimum",
                    "explanation": f"District {row['DistrictName']} has only {row['IHHLCoveragePer']}% IHHL coverage ({int(row['IHHLTotalAch'])} of {int(row['IHHLTotalAsPerDetails'])} households). Below the 80% alert threshold.",
                    "source": "SANITATION DATASET.csv",
                    "source_classification": "OPEN_DATA",
                    "reporting_date": str(row.get("Date", "")),
                    "recommended_action": "Investigate barriers to IHHL construction. Prioritize community mobilization and contractor deployment.",
                    "uncertainty": "Single snapshot. Cannot determine trend direction without historical data.",
                }
                alerts.append(alert)

    # ── Alert 2: HMIS data quality gaps ────────────────────────
    if data_store.hmis is not None:
        df = data_store.hmis
        # Districts with high missing data rates
        district_quality = df.groupby("district_as_per_lgd").agg(
            total=("value", "count"),
            missing=("value", lambda x: x.isna().sum()),
        ).reset_index()
        district_quality["missing_pct"] = (district_quality["missing"] / district_quality["total"] * 100).round(1)
        poor_quality = district_quality[district_quality["missing_pct"] > 50]

        for _, row in poor_quality.iterrows():
            alerts.append({
                "id": f"ALERT-HMIS-QUALITY-{row['district_as_per_lgd'].upper().replace(' ', '-')}",
                "title": f"Data Quality Gap: {row['missing_pct']}% missing health indicators in {row['district_as_per_lgd']}",
                "department": "HEALTHCARE",
                "area": row["district_as_per_lgd"],
                "state": "Haryana",
                "administrative_level": "district",
                "severity": "MEDIUM",
                "indicator": "HMIS Data Completeness",
                "observed_value": float(row["missing_pct"]),
                "threshold": 50.0,
                "threshold_type": "configurable_maximum_missing_pct",
                "explanation": f"{row['district_as_per_lgd']} has {row['missing_pct']}% missing indicator values ({int(row['missing'])} of {int(row['total'])} records).",
                "source": "HMIS Haryana",
                "source_classification": "OFFICIAL",
                "recommended_action": "Review health facility reporting compliance. Investigate data submission gaps.",
                "uncertainty": "Missing values may indicate facility-level reporting issues, not necessarily service delivery problems.",
            })

    # ── Alert 3: Water coverage below national average ─────────
    if data_store.water_coverage is not None:
        df = data_store.water_coverage
        nat_avg = df["coverage_pct_reported"].mean()
        below_avg = df[df["coverage_pct_reported"] < nat_avg * 0.8]

        for _, row in below_avg.iterrows():
            alerts.append({
                "id": f"ALERT-WATER-{row['state'].upper().replace(' ', '-').replace('&', '')}",
                "title": f"Below-Average Tap Water Coverage in {row['state']}",
                "department": "WATER_SUPPLY",
                "area": row["state"],
                "administrative_level": "state",
                "severity": "MEDIUM" if row["coverage_pct_reported"] > 50 else "HIGH",
                "indicator": "FHTC Coverage %",
                "observed_value": float(row["coverage_pct_reported"]),
                "threshold": round(nat_avg * 0.8, 2),
                "threshold_type": "80_pct_of_national_average",
                "explanation": f"{row['state']} has {row['coverage_pct_reported']}% tap water coverage vs national average {round(nat_avg, 2)}%.",
                "source": "FHTCDataTable.pdf",
                "source_classification": "OFFICIAL",
                "recommended_action": "Prioritize Jal Jeevan Mission implementation. Review supply chain and contractor performance.",
                "uncertainty": "State-level aggregate. Intra-state variation may be significant.",
            })

    # Apply severity filter
    if severity:
        alerts = [a for a in alerts if a["severity"].lower() == severity.lower()]

    return {
        "total_alerts": len(alerts),
        "alerts": alerts,
        "note": "Thresholds are configurable and should not be interpreted as official government policy.",
    }
