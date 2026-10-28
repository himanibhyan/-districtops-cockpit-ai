"""Entrypoint to run the DistrictOps Cockpit AI FastAPI backend."""
import uvicorn
import os
import sys
from pathlib import Path

# Add backend directory to sys.path so app module resolves cleanly
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import HOST, PORT, DEBUG

if __name__ == "__main__":
    print(f"Starting DistrictOps Cockpit AI Backend on {HOST}:{PORT} ...")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
