"""Health API — HMIS indicators, district-level stats, and multi-year trends."""
from fastapi import APIRouter, Query
from typing import Optional
from app.main import data_store

router = APIRouter(tags=["Health"])


@router.get("/health/indicators")
def list_indicators(
    category: Optional[str] = Query(None, description="Filter by indicator_head category"),
    district: Optional[str] = Query(None),
    fiscal_year: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List HMIS health indicators with filters."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    if category:
        df = df[df["indicator_head"].str.lower().str.contains(category.lower())]
    if district:
        df = df[df["district_as_per_lgd"].str.lower() == district.lower()]
    if fiscal_year:
        df = df[df["fiscal_year"] == fiscal_year]

    # Drop rows with no value
    df_valid = df[df["value"].notna()]
    total = len(df_valid)
    page = df_valid.iloc[offset:offset + limit]

    records = []
    for _, row in page.iterrows():
        records.append({
            "fiscal_year": row.get("fiscal_year"),
            "district": row.get("district_as_per_lgd"),
            "district_lgd_code": int(row["district_lgd_code"]) if _notna(row.get("district_lgd_code")) else None,
            "indicator_head": row.get("indicator_head"),
            "indicator": row.get("indicator"),
            "facility_category": row.get("facility_category"),
            "category": row.get("category"),
            "value": float(row["value"]) if _notna(row.get("value")) else None,
            "unit": row.get("unit"),
            "note": row.get("note"),
            "source": "HMIS Haryana",
            "source_classification": "OFFICIAL",
        })

    return {
        "available": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "records": records,
    }


@router.get("/health/indicators/{indicator_head}")
def get_indicator_details(
    indicator_head: str,
    district: Optional[str] = Query(None),
    fiscal_year: Optional[str] = Query(None),
):
    """Get detailed breakdown for a specific indicator head."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    # Match indicator_head (URL-decoded)
    matched = df[df["indicator_head"].str.lower().str.contains(indicator_head.lower().replace("_", " "))]
    if district:
        matched = matched[matched["district_as_per_lgd"].str.lower() == district.lower()]
    if fiscal_year:
        matched = matched[matched["fiscal_year"] == fiscal_year]

    valid = matched[matched["value"].notna()]
    indicators = valid["indicator"].unique().tolist()

    # Summarize by indicator
    summary = valid.groupby("indicator").agg(
        total_records=("value", "count"),
        sum_value=("value", "sum"),
        avg_value=("value", "mean"),
        min_value=("value", "min"),
        max_value=("value", "max"),
        districts=("district_as_per_lgd", "nunique"),
        years=("fiscal_year", "nunique"),
    ).reset_index()
    summary["avg_value"] = summary["avg_value"].round(2)

    return {
        "available": True,
        "indicator_head": indicator_head,
        "filters": {"district": district, "fiscal_year": fiscal_year},
        "sub_indicators": indicators,
        "sub_indicator_count": len(indicators),
        "summary": summary.to_dict(orient="records"),
        "source": "HMIS Haryana",
    }


@router.get("/health/stats")
def health_stats(district: Optional[str] = Query(None), fiscal_year: Optional[str] = Query(None)):
    """Aggregate health statistics for Haryana."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    if district:
        df = df[df["district_as_per_lgd"].str.lower() == district.lower()]
    if fiscal_year:
        df = df[df["fiscal_year"] == fiscal_year]

    total = len(df)
    with_values = int(df["value"].notna().sum())

    # Key indicator categories and their value sums
    category_totals = df[df["value"].notna()].groupby("indicator_head")["value"].sum().sort_values(ascending=False)
    top_categories = {k: round(v, 0) for k, v in category_totals.head(10).items()}

    # District comparison
    district_avgs = df[df["value"].notna()].groupby("district_as_per_lgd")["value"].mean().round(2)

    return {
        "available": True,
        "filters": {"district": district, "fiscal_year": fiscal_year},
        "total_records": total,
        "records_with_values": with_values,
        "data_completeness_pct": round(with_values / total * 100, 1) if total > 0 else 0,
        "top_indicator_categories_by_total": top_categories,
        "district_avg_values": district_avgs.to_dict(),
        "source": "HMIS Haryana",
        "source_classification": "OFFICIAL",
    }


@router.get("/health/trends")
def health_trends(
    district: Optional[str] = Query(None),
    indicator_head: Optional[str] = Query(None),
):
    """Multi-year health indicator trends."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    df = df[df["value"].notna()]

    if district:
        df = df[df["district_as_per_lgd"].str.lower() == district.lower()]
    if indicator_head:
        df = df[df["indicator_head"].str.lower().str.contains(indicator_head.lower())]

    # Group by fiscal year
    yearly = df.groupby("fiscal_year").agg(
        total_records=("value", "count"),
        total_value=("value", "sum"),
        avg_value=("value", "mean"),
        districts=("district_as_per_lgd", "nunique"),
        indicators=("indicator_head", "nunique"),
    ).reset_index()
    yearly["total_value"] = yearly["total_value"].round(0)
    yearly["avg_value"] = yearly["avg_value"].round(2)
    yearly = yearly.sort_values("fiscal_year")

    return {
        "available": True,
        "filters": {"district": district, "indicator_head": indicator_head},
        "fiscal_years": yearly["fiscal_year"].tolist(),
        "trends": yearly.to_dict(orient="records"),
        "source": "HMIS Haryana",
        "source_classification": "OFFICIAL",
        "note": "All values in Absolute Number. Trends show aggregated totals across all sub-indicators.",
    }


def _notna(val):
    if val is None:
        return False
    try:
        import math
        return not math.isnan(float(val))
    except (TypeError, ValueError):
        return True
