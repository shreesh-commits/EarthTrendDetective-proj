"""Methodology, Provenance, and Data Sources API Router."""

from fastapi import APIRouter
from app.data_engine.dataset_registry import get_all_data_sources
from app.core.data_quality import data_quality_auditor

router = APIRouter(prefix="/sources", tags=["Data Sources & Methodology"])


@router.get("/registry")
def get_sources_registry():
    """Retrieve full catalog of environmental data sources with DOIs and citations."""
    return {"sources": get_all_data_sources()}


@router.get("/quality-audit")
def get_quality_audit_report():
    """Retrieve data quality audits and integrity scores across all datasets."""
    return {"audits": data_quality_auditor.audit_all()}


@router.get("/methodology")
def get_methodology_details():
    """Return scientific methodology documentation for judge and student presentation."""
    return {
        "title": "EarthTrend Detective Scientific Methodology",
        "spatial_framework": {
            "focus": "Karnataka State, India (11.59°N to 18.45°N, 74.05°E to 78.58°E)",
            "boundary_source": "Survey of India / Official Karnataka Administrative Boundary GeoJSON (30 districts)",
            "clipping_method": "Shapely point-in-polygon verification; non-Karnataka observations excluded.",
        },
        "statistical_tests": [
            {
                "name": "Mann-Kendall Rank Trend Test",
                "purpose": "Non-parametric monotonic trend detection invariant to non-normality and missing values.",
                "formula": "S = Σ Σ sgn(x_j - x_k), with variance adjusted for tied observation groups.",
                "significance_threshold": "Two-tailed p < 0.05",
            },
            {
                "name": "Theil-Sen Robust Slope Estimator",
                "purpose": "Median rate of change per year/decade resilient against extreme outliers.",
                "formula": "Median of all pairwise slopes (y_j - y_k) / (t_j - t_k) for all j > k.",
            },
            {
                "name": "Climatological Standardized Anomaly (Z-Score)",
                "purpose": "Identify extreme weather events and ecological departures relative to 2000-2020 normal.",
                "formula": "Z = (x_{year, month} - μ_{month}) / σ_{month}. Threshold: |Z| >= 1.645 (~90% confidence).",
            },
            {
                "name": "Bivariate Pearson & Spearman Rank Correlation",
                "purpose": "Evaluate synchronous and lagged couplings between climate drivers and ecosystem response.",
                "disclaimer": "Correlation does NOT imply physical causation.",
            },
        ],
        "parameter_distinctions": {
            "water_temperature": "Strict segregation of Coastal Sea Surface Temperature (NOAA OISST) from Inland Reservoir Lake Surface Water Temperature (MODIS LSWT).",
            "soil_moisture": "Explicit physical separation of Surface Soil Moisture (0-10cm) from Root-Zone Soil Moisture (10-100cm).",
            "rainfall_aggregation": "Correct calculation of monthly rainfall as accumulated sum (mm/day * days in month) rather than simple daily average.",
        },
    }
