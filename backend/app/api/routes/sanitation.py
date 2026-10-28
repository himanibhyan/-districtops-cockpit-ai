"""Sanitation API — IHHL observations, coverage stats, and district comparisons."""
from fastapi import APIRouter, Query
from typing import Optional
from app.main import data_store

router = APIRouter(tags=["Sanitation"])


@router.get("/sanitation/observations")
def sanitation_observations(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    min_coverage: Optional[float] = Query(None, description="Minimum IHHL coverage %"),
    max_coverage: Optional[float] = Query(None, description="Maximum IHHL coverage %"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Return IHHL sanitation observations with filtering."""
    if data_store.sanitation is None:
        return {"available": False, "reason": "Sanitation dataset not loaded"}

    df = data_store.sanitation.copy()

    if state:
        df = df[df["StateName"].str.lower().str.contains(state.lower())]
    if district:
        df = df[df["DistrictName"].str.lower().str.contains(district.lower())]
    if min_coverage is not None:
        df = df[df["IHHLCoveragePer"] >= min_coverage]
    if max_coverage is not None:
        df = df[df["IHHLCoveragePer"] <= max_coverage]

    total = len(df)
    page = df.iloc[offset:offset + limit]

    records = []
    for _, row in page.iterrows():
        records.append({
            "state_id": int(row["StateID"]) if not _isnan(row.get("StateID")) else None,
            "state_name": row.get("StateName"),
            "district_id": int(row["DistrictID"]) if not _isnan(row.get("DistrictID")) else None,
            "district_census_code": str(row.get("DistrictCensusCode2011", "")),
            "district_name": row.get("DistrictName"),
            "ihhl_total_target": int(row["IHHLTotalAsPerDetails"]) if not _isnan(row.get("IHHLTotalAsPerDetails")) else None,
            "ihhl_total_achieved": int(row["IHHLTotalAch"]) if not _isnan(row.get("IHHLTotalAch")) else None,
            "ihhl_coverage_pct": float(row["IHHLCoveragePer"]) if not _isnan(row.get("IHHLCoveragePer")) else None,
            "date": str(row.get("Date", "")) if not _isnan(row.get("Date")) else None,
            "source": "SANITATION DATASET.csv",
            "source_classification": "OPEN_DATA",
        })

    return {
        "available": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "records": records,
    }


@router.get("/sanitation/stats")
def sanitation_stats(state: Optional[str] = Query(None)):
    """Aggregate sanitation statistics, optionally filtered by state."""
    if data_store.sanitation is None:
        return {"available": False, "reason": "Sanitation dataset not loaded"}

    df = data_store.sanitation.copy()
    if state:
        df = df[df["StateName"].str.lower().str.contains(state.lower())]

    total_districts = df["DistrictName"].nunique()
    total_states = df["StateName"].nunique()
    avg_coverage = round(df["IHHLCoveragePer"].mean(), 2) if len(df) > 0 else None
    min_coverage = round(df["IHHLCoveragePer"].min(), 2) if len(df) > 0 else None
    max_coverage = round(df["IHHLCoveragePer"].max(), 2) if len(df) > 0 else None
    total_target = int(df["IHHLTotalAsPerDetails"].sum()) if len(df) > 0 else 0
    total_achieved = int(df["IHHLTotalAch"].sum()) if len(df) > 0 else 0
    districts_at_100 = int((df["IHHLCoveragePer"] >= 100).sum())
    districts_below_50 = int((df["IHHLCoveragePer"] < 50).sum())

    # Bottom 10 districts
    bottom10 = df.nsmallest(10, "IHHLCoveragePer")[["StateName", "DistrictName", "IHHLCoveragePer"]].to_dict(orient="records")

    return {
        "available": True,
        "state_filter": state,
        "total_records": len(df),
        "total_states": total_states,
        "total_districts": total_districts,
        "avg_coverage_pct": avg_coverage,
        "min_coverage_pct": min_coverage,
        "max_coverage_pct": max_coverage,
        "total_ihhl_target": total_target,
        "total_ihhl_achieved": total_achieved,
        "overall_coverage_pct": round(total_achieved / total_target * 100, 2) if total_target > 0 else None,
        "districts_at_100_pct": districts_at_100,
        "districts_below_50_pct": districts_below_50,
        "bottom_10_districts": bottom10,
        "source": "SANITATION DATASET.csv",
        "source_classification": "OPEN_DATA",
    }


@router.get("/sanitation/trends")
def sanitation_trends():
    """State-wise sanitation coverage comparison."""
    if data_store.sanitation is None:
        return {"available": False, "reason": "Sanitation dataset not loaded"}

    df = data_store.sanitation.copy()
    state_summary = df.groupby("StateName").agg(
        districts=("DistrictName", "nunique"),
        avg_coverage=("IHHLCoveragePer", "mean"),
        min_coverage=("IHHLCoveragePer", "min"),
        max_coverage=("IHHLCoveragePer", "max"),
        total_target=("IHHLTotalAsPerDetails", "sum"),
        total_achieved=("IHHLTotalAch", "sum"),
    ).reset_index()
    state_summary["avg_coverage"] = state_summary["avg_coverage"].round(2)
    state_summary["min_coverage"] = state_summary["min_coverage"].round(2)
    state_summary["max_coverage"] = state_summary["max_coverage"].round(2)
    state_summary["overall_pct"] = (state_summary["total_achieved"] / state_summary["total_target"] * 100).round(2)
    state_summary = state_summary.sort_values("avg_coverage", ascending=True)

    return {
        "available": True,
        "description": "State-wise IHHL sanitation coverage comparison",
        "states": state_summary.to_dict(orient="records"),
        "source": "SANITATION DATASET.csv",
        "note": "Single snapshot (Oct 2024). No temporal trend available — do not infer month-over-month change.",
    }


def _isnan(val):
    """Check if value is NaN or None."""
    if val is None:
        return True
    try:
        import math
        return math.isnan(float(val))
    except (TypeError, ValueError):
        return False
