"""EarthTrend Detective - FastAPI Application Entrypoint.
NASA Hackathon Environmental Intelligence Platform for Karnataka, India.
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.overview import router as overview_router
from app.api.parameters import router as parameters_router
from app.api.map import router as map_router
from app.api.statistics import router as statistics_router
from app.api.cross_analysis import router as cross_router
from app.api.data_explorer import router as explorer_router
from app.api.data_sources import router as sources_router

app = FastAPI(
    title="EarthTrend Detective API",
    description="Scientific Environmental Intelligence Platform for Karnataka (NASA Hackathon)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
app.include_router(overview_router, prefix="/api")
app.include_router(parameters_router, prefix="/api")
app.include_router(map_router, prefix="/api")
app.include_router(statistics_router, prefix="/api")
app.include_router(cross_router, prefix="/api")
app.include_router(explorer_router, prefix="/api")
app.include_router(sources_router, prefix="/api")

# Static frontend serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Allow /docs and /api routes to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        index_file = FRONTEND_DIST / "index.html"
        return FileResponse(str(index_file))
else:
    @app.get("/")
    def root_status():
        return {
            "status": "online",
            "platform": "EarthTrend Detective",
            "edition": "NASA Hackathon 2026",
            "focus_region": "Karnataka, India",
            "api_docs": "/docs",
        }

