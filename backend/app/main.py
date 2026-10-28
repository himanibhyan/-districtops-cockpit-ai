"""
DistrictOps Cockpit AI — FastAPI Backend
Loads real datasets: Sanitation (IHHL), HMIS Health (Haryana), KML (Gurugram wards), and Jal Jeevan Mission FHTC.
Supports both /api/* (Version 1.0.0-hackathon API Contract) and /api/v1/* endpoints.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.services.data_loader import DataStore
from app.db.database import init_db

data_store = DataStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all datasets and initialize SQLite on startup."""
    init_db()
    data_store.load_all()
    yield


app = FastAPI(
    title="DistrictOps Cockpit AI",
    description="AI-assisted district governance operations backend — real data from IHHL, HMIS Haryana, Gurugram KML wards, and Jal Jeevan Mission FHTC.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check ────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "datasets": {
            "sanitation": {"loaded": data_store.sanitation is not None, "rows": len(data_store.sanitation) if data_store.sanitation is not None else 0},
            "hmis": {"loaded": data_store.hmis is not None, "rows": len(data_store.hmis) if data_store.hmis is not None else 0},
            "kml_wards": {"loaded": data_store.kml_wards is not None, "features": len(data_store.kml_wards) if data_store.kml_wards is not None else 0},
            "water_coverage": {"loaded": data_store.water_coverage is not None, "rows": len(data_store.water_coverage) if data_store.water_coverage is not None else 0},
        },
    }


# ── Register Official Contract Router (/api/*) ────────────────
from app.api.routes import contract_api  # noqa: E402
app.include_router(contract_api.router, prefix="/api")


# ── Register Dataset Exploration Routers (/api/v1/*) ──────────
from app.api.routes import dashboard, sanitation, health, water, maps, alerts, interventions  # noqa: E402

app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(sanitation.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(water.router, prefix="/api/v1")
app.include_router(maps.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(interventions.router, prefix="/api/v1")
