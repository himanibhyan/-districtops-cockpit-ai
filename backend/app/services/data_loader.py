"""
Central data loading and preprocessing service.
Loads: Sanitation CSV, HMIS ZIP, KML (Gurugram wards), FHTC PDF (water coverage).
"""
import io
import logging
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from app.config import SANITATION_CSV, HMIS_ZIP, KML_FILE, FHTC_PDF
from app.utils.pdf_extractor import extract_fhtc_table

logger = logging.getLogger("districtops.data_loader")


class DataStore:
    """Container for all loaded datasets."""

    def __init__(self):
        self.sanitation: Optional[pd.DataFrame] = None
        self.hmis: Optional[pd.DataFrame] = None
        self.kml_wards: Optional[list[dict]] = None
        self.kml_geojson: Optional[dict] = None
        self.water_coverage: Optional[pd.DataFrame] = None
        self.water_summary: Optional[dict] = None
        self.load_errors: list[str] = []

    def load_all(self):
        logger.info("Loading all datasets …")
        self._load_sanitation()
        self._load_hmis()
        self._load_kml()
        self._load_water_pdf()
        logger.info("All datasets loaded. Errors: %d", len(self.load_errors))

    def _load_sanitation(self):
        try:
            df = pd.read_csv(SANITATION_CSV)
            df.columns = [c.strip() for c in df.columns]
            for col in ["IHHLTotalAsPerDetails", "IHHLTotalAch", "IHHLCoveragePer"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
            if "Date" in df.columns:
                df["Date"] = pd.to_datetime(df["Date"], format="mixed", dayfirst=False, errors="coerce")
            df["_source"] = "SANITATION DATASET.csv"
            df["_source_classification"] = "OPEN_DATA"
            self.sanitation = df
            logger.info("Sanitation loaded: %d rows", len(df))
        except Exception as e:
            self.load_errors.append(f"Sanitation: {e}")
            logger.error("Sanitation load error: %s", e)

    def _load_hmis(self):
        try:
            with zipfile.ZipFile(HMIS_ZIP) as z:
                with z.open("output.csv") as f:
                    df = pd.read_csv(io.TextIOWrapper(f, "utf-8"), low_memory=False)
            df.columns = [c.strip() for c in df.columns]
            df["value"] = pd.to_numeric(df["value"], errors="coerce")
            df["_source"] = "hmis_haryana.zip/output.csv"
            df["_source_classification"] = "OFFICIAL"
            self.hmis = df
            logger.info("HMIS loaded: %d rows", len(df))
        except Exception as e:
            self.load_errors.append(f"HMIS: {e}")
            logger.error("HMIS load error: %s", e)

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
            logger.info("KML loaded: %d features", len(features))
        except Exception as e:
            self.load_errors.append(f"KML: {e}")
            logger.error("KML load error: %s", e)

    def _load_water_pdf(self):
        """
        Extract verified household tap water coverage from FHTCDataTable.pdf
        using the dedicated stream parser.
        """
        try:
            records, total_summary = extract_fhtc_table(str(FHTC_PDF))
            if not records:
                raise ValueError("PDF extraction yielded 0 records from FHTCDataTable.pdf")
            self.water_coverage = pd.DataFrame(records)
            self.water_summary = total_summary
            logger.info("Water coverage verified from PDF: %d states/UTs", len(records))
        except Exception as e:
            self.load_errors.append(f"Water PDF extraction error: {e}")
            logger.error("Water PDF extraction error: %s", e)
            self.water_coverage = None

    def get_haryana_sanitation(self) -> pd.DataFrame:
        if self.sanitation is None:
            return pd.DataFrame()
        return self.sanitation[self.sanitation["StateName"].str.strip().str.lower() == "haryana"].copy()

    def get_hmis_districts(self) -> list[str]:
        if self.hmis is None:
            return []
        return sorted(self.hmis["district_as_per_lgd"].dropna().unique().tolist())

    def get_hmis_indicator_heads(self) -> list[str]:
        if self.hmis is None:
            return []
        return sorted(self.hmis["indicator_head"].dropna().unique().tolist())

    def get_hmis_fiscal_years(self) -> list[str]:
        if self.hmis is None:
            return []
        return sorted(self.hmis["fiscal_year"].dropna().unique().tolist())
