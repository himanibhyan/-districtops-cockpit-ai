"""Dashboard API — summary, trends, department performance from real data."""
from fastapi import APIRouter
from app.main import data_store

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/summary")
def dashboard_summary():
    """Compute dashboard KPIs from real integrated datasets."""
    result = {
        "sanitation": _sanitation_summary(),
        "health": _health_summary(),
        "water": _water_summary(),
        "geo": _geo_summary(),
        "data_quality": _data_quality(),
    }
    return result


def _sanitation_summary():
    df = data_store.sanitation
    if df is None:
        return {"available": False, "reason": "Sanitation dataset not loaded"}
    haryana = data_store.get_haryana_sanitation()
    total_districts = df["DistrictName"].nunique()
    total_states = df["StateName"].nunique()
    haryana_districts = haryana["DistrictName"].nunique()
    avg_coverage = round(df["IHHLCoveragePer"].mean(), 2) if "IHHLCoveragePer" in df.columns else None
    haryana_avg_coverage = round(haryana["IHHLCoveragePer"].mean(), 2) if len(haryana) > 0 else None
    below_100 = int((df["IHHLCoveragePer"] < 100).sum()) if "IHHLCoveragePer" in df.columns else 0
    return {
        "available": True,
        "source": "SANITATION DATASET.csv",
        "source_classification": "OPEN_DATA",
        "description": "Individual Household Latrine (IHHL) coverage under Swachh Bharat Mission",
        "total_records": len(df),
        "total_states": total_states,
        "total_districts": total_districts,
        "haryana_districts": haryana_districts,
        "national_avg_coverage_pct": avg_coverage,
        "haryana_avg_coverage_pct": haryana_avg_coverage,
        "districts_below_100_pct": below_100,
        "reporting_date": str(df["Date"].max()) if "Date" in df.columns else None,
    }


def _health_summary():
    df = data_store.hmis
    if df is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}
    total_rows = len(df)
    non_null_values = int(df["value"].notna().sum())
    null_values = total_rows - non_null_values
    districts = data_store.get_hmis_districts()
    years = data_store.get_hmis_fiscal_years()
    indicators = data_store.get_hmis_indicator_heads()
    return {
        "available": True,
        "source": "hmis_haryana.zip/output.csv",
        "source_classification": "OFFICIAL",
        "description": "Health Management Information System (HMIS) data for Haryana — all health indicators by district and fiscal year",
        "state": "Haryana",
        "total_records": total_rows,
        "records_with_values": non_null_values,
        "records_missing_values": null_values,
        "missing_pct": round(null_values / total_rows * 100, 1) if total_rows > 0 else 0,
        "districts": districts,
        "district_count": len(districts),
        "fiscal_years": years,
        "fiscal_year_count": len(years),
        "indicator_categories": len(indicators),
    }


def _water_summary():
    df = data_store.water_coverage
    if df is None:
        return {"available": False, "reason": "Water coverage dataset not loaded"}
    total_states = len(df)
    full_coverage = int((df["coverage_pct_reported"] >= 100).sum())
    haryana_row = df[df["state"].str.lower().str.contains("haryana")]
    haryana_coverage = float(haryana_row["coverage_pct_reported"].iloc[0]) if len(haryana_row) > 0 else None
    return {
        "available": True,
        "source": "FHTCDataTable.pdf",
        "source_classification": "OFFICIAL",
        "administrative_level": "STATE",
        "description": "Jal Jeevan Mission FHTC — Functional Household Tap Connection coverage by state/UT",
        "total_states_uts": total_states,
        "states_with_100_pct": full_coverage,
        "haryana_coverage_pct": haryana_coverage,
        "national_avg_coverage_pct": round(df["coverage_pct_reported"].mean(), 2),
        "warning": "This is state/UT-level data, not district-level.",
    }


def _geo_summary():
    wards = data_store.kml_wards
    if not wards:
        return {"available": False, "reason": "KML dataset not loaded"}
    return {
        "available": True,
        "source": "gurugram_wards.kml",
        "source_classification": "OPEN_DATA",
        "description": "Municipal Corporation of Gurugram — ward boundaries (Haryana)",
        "total_ward_features": len(wards),
        "town": "Gurugram",
        "state": "Haryana",
        "geometry_type": "Polygon",
    }


def _data_quality():
    issues = []
    if data_store.sanitation is not None:
        df = data_store.sanitation
        nulls = int(df.isnull().sum().sum())
        if nulls > 0:
            issues.append({"dataset": "sanitation", "issue": "missing_values", "count": nulls})
    if data_store.hmis is not None:
        df = data_store.hmis
        null_values = int(df["value"].isna().sum())
        if null_values > 0:
            issues.append({"dataset": "hmis", "issue": "missing_indicator_values", "count": null_values,
                           "pct": round(null_values / len(df) * 100, 1)})
    return {"issues": issues, "total_issues": len(issues), "load_errors": data_store.load_errors}


@router.get("/dashboard/trends")
def dashboard_trends(district: str = None, fiscal_year: str = None):
    """Health indicator trends across fiscal years for a given district."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    if district:
        df = df[df["district_as_per_lgd"].str.lower() == district.lower()]
    if fiscal_year:
        df = df[df["fiscal_year"] == fiscal_year]

    # Aggregate: sum of non-null values by fiscal year and indicator head
    grouped = df.groupby(["fiscal_year", "indicator_head"])["value"].agg(["sum", "count", "mean"]).reset_index()
    grouped.columns = ["fiscal_year", "indicator_head", "total", "record_count", "average"]
    grouped["total"] = grouped["total"].round(0)
    grouped["average"] = grouped["average"].round(2)

    return {
        "available": True,
        "source": "HMIS Haryana",
        "filters_applied": {"district": district, "fiscal_year": fiscal_year},
        "total_records": len(grouped),
        "trends": grouped.to_dict(orient="records"),
    }


@router.get("/dashboard/department-performance")
def department_performance():
    """Department-level metrics computed from HMIS indicator head categories."""
    if data_store.hmis is None:
        return {"available": False, "reason": "HMIS dataset not loaded"}

    df = data_store.hmis.copy()
    # Group by indicator_head as proxy for departments
    perf = df.groupby("indicator_head").agg(
        total_records=("value", "count"),
        records_with_data=("value", lambda x: x.notna().sum()),
        total_value=("value", "sum"),
        avg_value=("value", "mean"),
        districts_covered=("district_as_per_lgd", "nunique"),
        years_covered=("fiscal_year", "nunique"),
    ).reset_index()

    perf["data_completeness_pct"] = (perf["records_with_data"] / perf["total_records"] * 100).round(1)
    perf["total_value"] = perf["total_value"].round(0)
    perf["avg_value"] = perf["avg_value"].round(2)

    return {
        "available": True,
        "source": "HMIS Haryana",
        "departments": perf.to_dict(orient="records"),
    }
