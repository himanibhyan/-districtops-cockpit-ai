"""Application configuration."""
import os
from pathlib import Path

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Data files
SANITATION_CSV = DATA_DIR / "sanitation_dataset.csv"
HMIS_ZIP = DATA_DIR / "hmis_haryana.zip"
KML_FILE = DATA_DIR / "gurugram_wards.kml"
FHTC_PDF = DATA_DIR / "fhtc_water_coverage.pdf"

# AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
