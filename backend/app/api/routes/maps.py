"""Maps API — GeoJSON ward boundaries from KML."""
from fastapi import APIRouter, Query
from typing import Optional
from app.main import data_store

router = APIRouter(tags=["Maps"])


@router.get("/map/layers")
def map_layers():
    """Available map layers."""
    layers = []
    if data_store.kml_wards:
        layers.append({
            "id": "gurugram-wards",
            "name": "Municipal Corporation of Gurugram — Ward Boundaries",
            "type": "polygon",
            "feature_count": len(data_store.kml_wards),
            "town": "Gurugram",
            "state": "Haryana",
            "source": "gurugram_wards.kml",
            "source_classification": "OPEN_DATA",
            "geometry_type": "Polygon",
        })
    return {"layers": layers}


@router.get("/map/features")
def map_features(layer_id: str = Query("gurugram-wards")):
    """Return GeoJSON FeatureCollection for a map layer."""
    if layer_id == "gurugram-wards":
        if data_store.kml_geojson is None:
            return {"error": "KML data not loaded"}
        return data_store.kml_geojson
    return {"error": f"Unknown layer: {layer_id}"}


@router.get("/areas")
def list_areas():
    """List administrative areas from available datasets."""
    areas = []

    # From KML (Gurugram wards)
    if data_store.kml_wards:
        for feat in data_store.kml_wards:
            props = feat.get("properties", {})
            areas.append({
                "id": f"ward-{props.get('sourcewardcode', props.get('objectid', ''))}",
                "name": props.get("ward_lgd_name", props.get("sourcewardname", "Unknown")),
                "type": "ward",
                "town": props.get("townname", "Gurugram"),
                "state": props.get("state", "Haryana"),
                "lgd_code": props.get("ward_lgd_code"),
                "source": "KML",
            })

    # From HMIS (Haryana districts)
    if data_store.hmis is not None:
        districts = data_store.hmis[["district_as_per_lgd", "district_lgd_code"]].drop_duplicates()
        for _, row in districts.iterrows():
            areas.append({
                "id": f"district-{row['district_lgd_code']}",
                "name": row["district_as_per_lgd"],
                "type": "district",
                "state": "Haryana",
                "lgd_code": int(row["district_lgd_code"]) if not _isnan(row.get("district_lgd_code")) else None,
                "source": "HMIS",
            })

    # From sanitation (Haryana filter)
    if data_store.sanitation is not None:
        haryana = data_store.get_haryana_sanitation()
        san_districts = haryana[["DistrictName", "DistrictID"]].drop_duplicates()
        existing_names = {a["name"].lower() for a in areas if a["type"] == "district"}
        for _, row in san_districts.iterrows():
            if row["DistrictName"].lower() not in existing_names:
                areas.append({
                    "id": f"district-san-{row['DistrictID']}",
                    "name": row["DistrictName"],
                    "type": "district",
                    "state": "Haryana",
                    "source": "Sanitation",
                })

    return {
        "total": len(areas),
        "areas": areas,
    }


@router.get("/areas/{area_id}")
def get_area(area_id: str):
    """Get details for a specific administrative area."""
    areas = list_areas()["areas"]
    for area in areas:
        if area["id"] == area_id:
            return {"found": True, "area": area}
    return {"found": False, "error": f"Area {area_id} not found"}


def _isnan(val):
    if val is None:
        return True
    try:
        import math
        return math.isnan(float(val))
    except (TypeError, ValueError):
        return False
