"""Water Coverage API — Jal Jeevan Mission FHTC state-level data."""
from fastapi import APIRouter, Query
from typing import Optional
from app.main import data_store

router = APIRouter(tags=["Water Coverage"])


@router.get("/water/coverage")
def water_coverage(
    state: Optional[str] = Query(None, description="Filter by state/UT name"),
    min_coverage: Optional[float] = Query(None),
    max_coverage: Optional[float] = Query(None),
):
    """Return FHTC water coverage data by state/UT."""
    if data_store.water_coverage is None:
        return {"available": False, "reason": "Water coverage dataset not loaded"}

    df = data_store.water_coverage.copy()
    if state:
        df = df[df["state"].str.lower().str.contains(state.lower())]
    if min_coverage is not None:
        df = df[df["coverage_pct_reported"] >= min_coverage]
    if max_coverage is not None:
        df = df[df["coverage_pct_reported"] <= max_coverage]

    records = []
    for _, row in df.iterrows():
        records.append({
            "state": row["state"],
            "total_households": int(row["total_households"]),
            "households_with_tap": int(row["households_with_tap"]),
            "coverage_pct_reported": float(row["coverage_pct_reported"]),
            "coverage_pct_calculated": float(row.get("coverage_pct_calculated", 0)),
            "coverage_discrepancy": float(row.get("coverage_discrepancy", 0)),
            "administrative_level": "STATE",
            "source": "FHTCDataTable.pdf",
            "source_classification": "OFFICIAL",
            "report_name": "Jal Jeevan Mission - Har Ghar Jal FHTC Report",
        })

    return {
        "available": True,
        "total": len(records),
        "administrative_level": "STATE",
        "warning": "This dataset contains STATE/UT-level aggregates only. District-level tap-water coverage is NOT available from this source.",
        "records": records,
    }


@router.get("/water/stats")
def water_stats():
    """Aggregate water coverage statistics."""
    if data_store.water_coverage is None:
        return {"available": False, "reason": "Water coverage dataset not loaded"}

    df = data_store.water_coverage.copy()
    total_states = len(df)
    total_households = int(df["total_households"].sum())
    total_with_tap = int(df["households_with_tap"].sum())
    national_coverage = round(total_with_tap / total_households * 100, 2) if total_households > 0 else None
    states_100 = int((df["coverage_pct_reported"] >= 100).sum())
    states_below_50 = int((df["coverage_pct_reported"] < 50).sum())

    # Haryana specific
    haryana = df[df["state"].str.lower().str.contains("haryana")]
    haryana_data = None
    if len(haryana) > 0:
        row = haryana.iloc[0]
        haryana_data = {
            "total_households": int(row["total_households"]),
            "households_with_tap": int(row["households_with_tap"]),
            "coverage_pct": float(row["coverage_pct_reported"]),
        }

    # Bottom 5 states
    bottom5 = df.nsmallest(5, "coverage_pct_reported")[["state", "coverage_pct_reported", "total_households", "households_with_tap"]].to_dict(orient="records")

    return {
        "available": True,
        "total_states_uts": total_states,
        "total_households": total_households,
        "total_with_tap_connection": total_with_tap,
        "national_coverage_pct": national_coverage,
        "states_at_100_pct": states_100,
        "states_below_50_pct": states_below_50,
        "haryana": haryana_data,
        "bottom_5_states": bottom5,
        "administrative_level": "STATE",
        "source": "FHTCDataTable.pdf",
        "source_classification": "OFFICIAL",
    }
