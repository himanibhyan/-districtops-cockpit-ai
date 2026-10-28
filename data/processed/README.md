# Gurugram Municipal Ward Geography Dataset

## 1. Overview
* **File:** `data/processed/gurugram_wards.geojson`
* **Raw Source:** `data/raw/gurugram_wards.kml` (original: `1dad3e7e-38e3-4a2f-9126-f439e7f8992e.kml`)
* **Format:** RFC 7946 GeoJSON FeatureCollection
* **Target Jurisdiction:** Municipal Corporation of Gurugram (MCG), Haryana, India
* **Total Features:** 35 Municipal Wards (Wards 1 through 35)

---

## 2. Coordinate Reference System (CRS)
* **Standard:** WGS 84 (`EPSG:4326` / `urn:ogc:def:crs:OGC:1.3:CRS84`)
* **Coordinate Ordering:** `[longitude, latitude]` as mandated by RFC 7946 GeoJSON specification.
* **Bounding Box:** Longitude ~`76.95°E - 77.15°E`, Latitude ~`28.38°N - 28.53°N`.
* **Geometry Type:** `Polygon` (single exterior linear ring with matching first/last coordinates, 0 interior holes).

---

## 3. Feature Attribute Schema
Each GeoJSON Feature preserves all attributes from the source KML ExtendedData/SimpleData:

| Attribute | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `objectid` | Integer | Source feature identifier | `1` |
| `townname` | String | Municipal town name | `"Gurugram"` |
| `towncensuscode2011` | String | Census 2011 town code | `"800429"` |
| `town_lgd_code` | Integer | Local Government Directory (LGD) town code | `248576` |
| `ward_lgd_code` | Integer | Unique LGD ward identifier | `64204` |
| `ward_lgd_name` | String | Official ward name | `"Gurgaon (M Cl ) - Ward No.1"` |
| `sourcewardname` | String / Null | Source ward description (if present) | `null` |
| `state` | String | State | `"Haryana"` |
| `sourcewardcode` | Integer | Sequential ward number | `1` to `35` |

---

## 4. Validation Checks & Results
* **Total Features:** 35
* **Missing Names:** 0 (all 35 have valid `ward_lgd_name`)
* **Duplicate Ward Identifiers:** 0 (all 35 `sourcewardcode`, `ward_lgd_code`, and `objectid` are distinct and sequential)
* **Invalid Geometries:** 0 (all outer rings have $\ge 4$ coordinate points, closed topology, and verified coordinates within the MCG boundary)
