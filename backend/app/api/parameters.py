"""Individual Environmental Parameters API Router."""

from typing import Dict, List, Optional, Tuple
from fastapi import APIRouter, HTTPException, Query
import numpy as np
import pandas as pd

from app.config import PARAMETERS_CONFIG, PROCESSED_DIR
from app.core.statistics import (
    mann_kendall_test,
    sens_slope,
    linear_regression_trend,
    compute_seasonal_breakdown,
    detect_climatological_anomalies,
)

router = APIRouter(prefix="/parameters", tags=["Parameters"])

DATA_FILE_MAP = {
    "air_temperature": ("air_temperature_monthly.csv", "air_temperature"),
    "rainfall": ("rainfall_monthly.csv", "rainfall_accumulated"),
    "water_temperature": ("water_temperature_monthly.csv", "water_temperature"),
    "water_level": ("water_level_monthly.csv", "percent_storage"),
    "vegetation": ("vegetation_monthly.csv", "ndvi"),
    "soil_moisture": ("soil_moisture_monthly.csv", "surface_soil_moisture"),
}


def load_param_df(param_id: str) -> Tuple[pd.DataFrame, str]:
    if param_id not in DATA_FILE_MAP:
        raise HTTPException(status_code=404, detail=f"Parameter '{param_id}' not found.")
    filename, val_col = DATA_FILE_MAP[param_id]
    filepath = PROCESSED_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=500, detail=f"Dataset file '{filename}' does not exist.")
    df = pd.read_csv(filepath)
    return df, val_col


@router.get("/list")
def list_parameters():
    """List all 6 environmental parameters with their metadata."""
    return list(PARAMETERS_CONFIG.values())


@router.get("/{param_id}/summary")
def get_parameter_summary(param_id: str):
    """Retrieve comprehensive statistical summary for an environmental parameter."""
    df, val_col = load_param_df(param_id)
    cfg = PARAMETERS_CONFIG.get(param_id)

    # Compute annual statewide means for long-term trend testing
    annual_df = df.groupby("year")[val_col].mean().reset_index()
    vals = annual_df[val_col].values
    years = annual_df["year"].values

    mk = mann_kendall_test(vals)
    sen = sens_slope(vals, years)
    lr = linear_regression_trend(vals, years)
    seasonal = compute_seasonal_breakdown(df, val_col)

    # Detect anomalies across the series
    anom_df = detect_climatological_anomalies(df, val_col)
    total_anomalies = int(anom_df["is_anomaly"].sum())

    return {
        "parameter_id": param_id,
        "config": cfg,
        "total_observations": len(df),
        "historical_period": f"{int(years.min())}-{int(years.max())}",
        "baseline_mean": round(float(np.nanmean(vals)), 3),
        "baseline_std": round(float(np.nanstd(vals)), 3),
        "min_recorded": round(float(np.nanmin(vals)), 3),
        "max_recorded": round(float(np.nanmax(vals)), 3),
        "mann_kendall": mk,
        "sens_slope": sen,
        "linear_regression": lr,
        "seasonal_breakdown": seasonal,
        "total_anomalies_detected": total_anomalies,
    }


@router.get("/{param_id}/timeseries")
def get_parameter_timeseries(
    param_id: str,
    location: Optional[str] = Query(None, description="Location / Reservoir name"),
    zone: Optional[str] = Query(None, description="Agro-climatic zone"),
    start_year: int = Query(2000, ge=2000, le=2024),
    end_year: int = Query(2024, ge=2000, le=2024),
    limit: int = Query(400, ge=10, le=5000),
):
    """Retrieve monthly time series for charting, with optional regional filters."""
    df, val_col = load_param_df(param_id)

    # Apply filters
    filtered = df[(df["year"] >= start_year) & (df["year"] <= end_year)].copy()

    if location and "location" in filtered.columns:
        filtered = filtered[filtered["location"] == location]
    elif location and "reservoir_name" in filtered.columns:
        filtered = filtered[filtered["reservoir_name"] == location]

    if zone and "zone" in filtered.columns:
        filtered = filtered[filtered["zone"] == zone]

    # If multiple locations/zones remain, aggregate by month to provide a coherent statewide/zone average
    if (not location and "location" in filtered.columns) or (not zone and "zone" in filtered.columns):
        num_cols = [c for c in filtered.columns if c in [val_col, "anomaly", "evi", "root_zone_soil_moisture", "air_temperature_max", "air_temperature_min"]]
        agg_dict = {c: "mean" for c in num_cols}
        if "quality_flag" in filtered.columns:
            agg_dict["quality_flag"] = "max"

        timeseries_df = filtered.groupby(["year", "month", "season"]).agg(agg_dict).reset_index()
        timeseries_df["date"] = timeseries_df.apply(lambda r: f"{int(r['year'])}-{int(r['month']):02d}-01", axis=1)
        timeseries_df.sort_values(by=["year", "month"], inplace=True)
    else:
        timeseries_df = filtered.sort_values(by=["year", "month"])

    records = timeseries_df.head(limit).to_dict(orient="records")

    # Round numeric values for clean UI
    for r in records:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 3)

    return {
        "parameter_id": param_id,
        "value_column": val_col,
        "count": len(records),
        "records": records,
    }


@router.get("/{param_id}/annual")
def get_parameter_annual(param_id: str):
    """Retrieve annual aggregate values from 2000 to 2024 with fitted trendline."""
    df, val_col = load_param_df(param_id)

    annual_df = df.groupby("year")[val_col].mean().reset_index()
    years = annual_df["year"].values
    vals = annual_df[val_col].values

    lr = linear_regression_trend(vals, years)
    slope = lr["slope"]
    intercept = lr["intercept"]

    results = []
    for y, v in zip(years, vals):
        trend_val = slope * y + intercept
        results.append({
            "year": int(y),
            "actual_value": round(float(v), 3),
            "trendline_value": round(float(trend_val), 3),
            "residual": round(float(v - trend_val), 3),
        })

    return {
        "parameter_id": param_id,
        "linear_regression": lr,
        "records": results,
    }
