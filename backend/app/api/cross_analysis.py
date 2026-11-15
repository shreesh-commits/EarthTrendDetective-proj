"""Cross-Parameter and Multi-Variable Analysis API Router."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Query
from app.core.cross_parameter import cross_parameter_engine
from app.config import PARAMETERS_CONFIG

router = APIRouter(prefix="/cross", tags=["Cross-Parameter Analysis"])


@router.get("/correlation-matrix")
def get_correlation_matrix():
    """Retrieve full Pearson and Spearman correlation matrices across parameters."""
    return cross_parameter_engine.compute_correlation_matrix()


@router.get("/curated-insights")
def get_curated_insights():
    """Retrieve curated scientifically validated environmental relationship pairs."""
    return {"insights": cross_parameter_engine.get_curated_insights()}


@router.get("/bivariate")
def get_bivariate_analysis(
    param_x: str = Query("rainfall_accumulated", description="X-axis variable"),
    param_y: str = Query("surface_soil_moisture", description="Y-axis variable"),
    lag: int = Query(0, ge=0, le=6, description="Lag in months (0-6)"),
):
    """Calculate correlation, linear fit, and scatter plot points between two variables."""
    return cross_parameter_engine.analyze_specific_pair(param_x, param_y, lag)
