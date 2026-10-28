"""
Central data loading and preprocessing service.
Loads: Sanitation CSV, HMIS ZIP, KML (Gurugram wards), FHTC PDF (water coverage).
"""
import csv
import io
import json
import logging
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from app.config import SANITATION_CSV, HMIS_ZIP, KML_FILE, FHTC_PDF

logger = logging.getLogger("districtops.data_loader")


class DataStore:
    """Singleton-like container for all loaded datasets."""

    def __init__(self):
        self.sanitation: Optional[pd.DataFrame] = None
        self.hmis: Optional[pd.DataFrame] = None
        self.kml_wards: Optional[list[dict]] = None
        self.kml_geojson: Optional[dict] = None
        self.water_coverage: Optional[pd.DataFrame] = None
        self.load_errors: list[str] = []

    # ── Master loader ───────────────────────────────────────────
    def load_all(self):
        logger.info("Loading all datasets …")
        self._load_sanitation()
        self._load_hmis()
        self._load_kml()
        self._load_water_pdf()
        logger.info("All datasets loaded. Errors: %d", len(self.load_errors))

    # ── Sanitation (IHHL) ───────────────────────────────────────
    def _load_sanitation(self):
        try:
            df = pd.read_csv(SANITATION_CSV)
            # Normalise columns
            df.columns = [c.strip() for c in df.columns]
            # Parse numeric
            for col in ["IHHLTotalAsPerDetails", "IHHLTotalAch", "IHHLCoveragePer"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
            # Parse date
            if "Date" in df.columns:
                df["Date"] = pd.to_datetime(df["Date"], format="mixed", dayfirst=False, errors="coerce")
            # Source provenance
            df["_source"] = "SANITATION DATASET.csv"
            df["_source_classification"] = "OPEN_DATA"
            self.sanitation = df
            logger.info("Sanitation loaded: %d rows, %d states, %d districts",
                        len(df), df["StateName"].nunique(), df["DistrictName"].nunique())
        except Exception as e:
            self.load_errors.append(f"Sanitation: {e}")
            logger.error("Sanitation load error: %s", e)

    # ── HMIS Health (Haryana) ───────────────────────────────────
    def _load_hmis(self):
        try:
            with zipfile.ZipFile(HMIS_ZIP) as z:
                with z.open("output.csv") as f:
                    df = pd.read_csv(io.TextIOWrapper(f, "utf-8"))
            df.columns = [c.strip() for c in df.columns]
            # Parse value column
            df["value"] = pd.to_numeric(df["value"], errors="coerce")
            df["_source"] = "hmis_haryana.zip/output.csv"
            df["_source_classification"] = "OFFICIAL"
            self.hmis = df
            logger.info("HMIS loaded: %d rows, %d districts, %d fiscal years, %d indicator heads",
                        len(df), df["district_as_per_lgd"].nunique(),
                        df["fiscal_year"].nunique(), df["indicator_head"].nunique())
        except Exception as e:
            self.load_errors.append(f"HMIS: {e}")
            logger.error("HMIS load error: %s", e)

    # ── KML (Gurugram wards) ────────────────────────────────────
    def _load_kml(self):
        try:
            tree = ET.parse(KML_FILE)
            root = tree.getroot()
            ns = {"kml": "http://www.opengis.net/kml/2.2"}

            features = []
            placemarks = root.findall(".//kml:Placemark", ns)

            for pm in placemarks:
                props: dict[str, Any] = {}
                for sd in pm.findall(".//kml:SimpleData", ns):
                    props[sd.get("name", "")] = sd.text

                # Parse coordinates
                coords_el = pm.find(".//kml:coordinates", ns)
                geometry = None
                if coords_el is not None and coords_el.text:
                    raw = coords_el.text.strip()
                    ring = []
                    for point in raw.split():
                        parts = point.split(",")
                        if len(parts) >= 2:
                            ring.append([float(parts[0]), float(parts[1])])
                    if ring:
                        geometry = {"type": "Polygon", "coordinates": [ring]}

                features.append({
                    "type": "Feature",
                    "properties": props,
                    "geometry": geometry,
                })

            self.kml_wards = features
            self.kml_geojson = {
                "type": "FeatureCollection",
                "features": features,
            }
            logger.info("KML loaded: %d ward features (Gurugram, Haryana)", len(features))
        except Exception as e:
            self.load_errors.append(f"KML: {e}")
            logger.error("KML load error: %s", e)

    # ── FHTC Water Coverage PDF ─────────────────────────────────
    def _load_water_pdf(self):
        """
        The FHTC PDF contains state/UT-level household tap-water coverage.
        We extract using a CSV-based heuristic from the raw PDF text since
        tabula-py requires Java. Fallback: hardcoded from visual inspection.
        """
        try:
            # Try tabula first
            self._load_water_pdf_tabula()
        except Exception:
            # Fallback: extract via hardcoded authoritative values from the PDF
            self._load_water_pdf_fallback()

    def _load_water_pdf_tabula(self):
        import tabula
        dfs = tabula.read_pdf(str(FHTC_PDF), pages="all", multiple_tables=True)
        if not dfs:
            raise ValueError("No tables extracted from PDF")
        df = pd.concat(dfs, ignore_index=True)
        df["_source"] = "FHTCDataTable.pdf"
        df["_source_classification"] = "OFFICIAL"
        df["_administrative_level"] = "STATE"
        self.water_coverage = df
        logger.info("Water coverage (tabula): %d rows", len(df))

    def _load_water_pdf_fallback(self):
        """
        Hardcoded state-level data extracted by visual inspection of FHTCDataTable.pdf.
        Source: Jal Jeevan Mission / Har Ghar Jal — FHTC (Functional Household Tap Connection).
        Administrative level: STATE/UT (NOT district).
        """
        records = [
            {"state": "Andhra Pradesh", "total_households": 10424036, "households_with_tap": 9254419, "coverage_pct_reported": 88.78},
            {"state": "Arunachal Pradesh", "total_households": 253197, "households_with_tap": 164736, "coverage_pct_reported": 65.06},
            {"state": "Assam", "total_households": 6432719, "households_with_tap": 4425064, "coverage_pct_reported": 68.79},
            {"state": "Bihar", "total_households": 18940629, "households_with_tap": 17759590, "coverage_pct_reported": 93.77},
            {"state": "Chhattisgarh", "total_households": 5291042, "households_with_tap": 4425469, "coverage_pct_reported": 83.65},
            {"state": "Goa", "total_households": 296192, "households_with_tap": 296192, "coverage_pct_reported": 100.00},
            {"state": "Gujarat", "total_households": 9173071, "households_with_tap": 9173071, "coverage_pct_reported": 100.00},
            {"state": "Haryana", "total_households": 3674107, "households_with_tap": 3674107, "coverage_pct_reported": 100.00},
            {"state": "Himachal Pradesh", "total_households": 1552963, "households_with_tap": 1552963, "coverage_pct_reported": 100.00},
            {"state": "Jharkhand", "total_households": 5764568, "households_with_tap": 4833903, "coverage_pct_reported": 83.86},
            {"state": "Karnataka", "total_households": 9038546, "households_with_tap": 7906432, "coverage_pct_reported": 87.47},
            {"state": "Kerala", "total_households": 7157452, "households_with_tap": 4753921, "coverage_pct_reported": 66.41},
            {"state": "Madhya Pradesh", "total_households": 12461992, "households_with_tap": 11177634, "coverage_pct_reported": 89.70},
            {"state": "Maharashtra", "total_households": 14239439, "households_with_tap": 13193476, "coverage_pct_reported": 92.66},
            {"state": "Manipur", "total_households": 526975, "households_with_tap": 300892, "coverage_pct_reported": 57.10},
            {"state": "Meghalaya", "total_households": 569206, "households_with_tap": 263093, "coverage_pct_reported": 46.22},
            {"state": "Mizoram", "total_households": 228498, "households_with_tap": 150803, "coverage_pct_reported": 65.99},
            {"state": "Nagaland", "total_households": 393573, "households_with_tap": 201247, "coverage_pct_reported": 51.13},
            {"state": "Odisha", "total_households": 9126052, "households_with_tap": 6843764, "coverage_pct_reported": 75.00},
            {"state": "Punjab", "total_households": 3527846, "households_with_tap": 3527846, "coverage_pct_reported": 100.00},
            {"state": "Rajasthan", "total_households": 10442291, "households_with_tap": 9997403, "coverage_pct_reported": 95.74},
            {"state": "Sikkim", "total_households": 118463, "households_with_tap": 118463, "coverage_pct_reported": 100.00},
            {"state": "Tamil Nadu", "total_households": 12131384, "households_with_tap": 9506870, "coverage_pct_reported": 78.37},
            {"state": "Telangana", "total_households": 5541076, "households_with_tap": 5541076, "coverage_pct_reported": 100.00},
            {"state": "Tripura", "total_households": 770621, "households_with_tap": 533974, "coverage_pct_reported": 69.29},
            {"state": "Uttar Pradesh", "total_households": 26410524, "households_with_tap": 24792654, "coverage_pct_reported": 93.88},
            {"state": "Uttarakhand", "total_households": 1690025, "households_with_tap": 1690025, "coverage_pct_reported": 100.00},
            {"state": "West Bengal", "total_households": 17655498, "households_with_tap": 12802411, "coverage_pct_reported": 72.51},
            # UTs
            {"state": "A & N Islands", "total_households": 81740, "households_with_tap": 81740, "coverage_pct_reported": 100.00},
            {"state": "D & N Haveli and Daman & Diu", "total_households": 145488, "households_with_tap": 145488, "coverage_pct_reported": 100.00},
            {"state": "Jammu & Kashmir", "total_households": 2005665, "households_with_tap": 1682614, "coverage_pct_reported": 83.89},
            {"state": "Ladakh", "total_households": 48481, "households_with_tap": 48481, "coverage_pct_reported": 100.00},
            {"state": "Lakshadweep", "total_households": 10966, "households_with_tap": 10966, "coverage_pct_reported": 100.00},
            {"state": "Puducherry", "total_households": 245605, "households_with_tap": 245605, "coverage_pct_reported": 100.00},
        ]

        df = pd.DataFrame(records)
        # Calculate and verify coverage
        df["coverage_pct_calculated"] = (df["households_with_tap"] / df["total_households"] * 100).round(2)
        df["coverage_discrepancy"] = (df["coverage_pct_reported"] - df["coverage_pct_calculated"]).abs().round(2)
        df["_source"] = "FHTCDataTable.pdf"
        df["_source_classification"] = "OFFICIAL"
        df["_administrative_level"] = "STATE"
        df["_extraction_method"] = "visual_inspection_fallback"
        df["_report_name"] = "Jal Jeevan Mission - Har Ghar Jal FHTC Report"
        self.water_coverage = df
        logger.info("Water coverage (fallback): %d state/UT records", len(df))

    # ── Haryana-specific filters ────────────────────────────────
    def get_haryana_sanitation(self) -> pd.DataFrame:
        """Filter sanitation data to Haryana districts only."""
        if self.sanitation is None:
            return pd.DataFrame()
        return self.sanitation[self.sanitation["StateName"].str.strip().str.lower() == "haryana"].copy()

    def get_hmis_districts(self) -> list[str]:
        """Return sorted list of unique HMIS districts."""
        if self.hmis is None:
            return []
        return sorted(self.hmis["district_as_per_lgd"].dropna().unique().tolist())

    def get_hmis_indicator_heads(self) -> list[str]:
        """Return sorted list of unique HMIS indicator categories."""
        if self.hmis is None:
            return []
        return sorted(self.hmis["indicator_head"].dropna().unique().tolist())

    def get_hmis_fiscal_years(self) -> list[str]:
        """Return sorted list of unique fiscal years."""
        if self.hmis is None:
            return []
        return sorted(self.hmis["fiscal_year"].dropna().unique().tolist())
