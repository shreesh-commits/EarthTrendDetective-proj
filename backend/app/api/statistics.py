"""Statistical Trends and Anomaly Detection API Router."""

from typing import Dict, List, Optional, Tuple
from fastapi import APIRouter, Query
import numpy as np
import pandas as pd

from app.config import PARAMETERS_CONFIG, PROCESSED_DIR
from app.core.statistics import (
    mann_kendall_test,
    sens_slope,
    linear_regression_trend,
    detect_climatological_anomalies,
    period_percentage_change,
)
from app.api.parameters import DATA_FILE_MAP, load_param_df

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("/all-trends")
def get_all_trends():
    """
    Retrieve side-by-side comparative statistical trend results
    (Mann-Kendall, Sen's slope, Linear regression) for all 6 core parameters.
    """
    trends = []

    for param_id, (fname, val_col) in DATA_FILE_MAP.items():
        filepath = PROCESSED_DIR / fname
        if not filepath.exists():
            continue
        df = pd.read_csv(filepath)

        annual_df = df.groupby("year")[val_col].mean().reset_index()
        years = annual_df["year"].values
        vals = annual_df[val_col].values

        mk = mann_kendall_test(vals)
        sen = sens_slope(vals, years)
        lr = linear_regression_trend(vals, years)

        cfg = PARAMETERS_CONFIG.get(param_id, {})

        trends.append({
            "parameter_id": param_id,
            "parameter_name": cfg.get("name", param_id),
            "unit": cfg.get("primary_unit", ""),
            "n_years": len(years),
            "period": f"{int(years.min())}-{int(years.max())}",
            "mean_value": round(float(np.nanmean(vals)), 3),
            "mann_kendall_trend": mk["trend"],
            "mann_kendall_p_value": mk["p_value"],
            "is_statistically_significant": mk["is_significant"],
            "z_statistic": mk["z_statistic"],
            "sens_slope_per_year": sen["unit_per_year"],
            "sens_slope_per_decade": sen["unit_per_decade"],
            "ols_slope_per_year": lr["slope"],
            "ols_slope_per_decade": lr["rate_per_decade"],
            "r_squared": lr["r_squared"],
            "ols_p_value": lr["p_value"],
        })

    return {"trends": trends}


@router.get("/anomalies")
def get_historical_anomalies(
    parameter_id: Optional[str] = Query(None, description="Optional parameter filter"),
    min_z_score: float = Query(1.645, ge=1.0, le=5.0),
    limit: int = Query(60, ge=1, le=500),
):
    """
    Retrieve historical environmental anomaly records ranked by statistical extremity (|Z| >= threshold).
    """
    anomalies_list = []

    param_keys = [parameter_id] if parameter_id and parameter_id in DATA_FILE_MAP else list(DATA_FILE_MAP.keys())

    for pid in param_keys:
        fname, val_col = DATA_FILE_MAP[pid]
        filepath = PROCESSED_DIR / fname
        if not filepath.exists():
            continue

        df = pd.read_csv(filepath)
        anom_df = detect_climatological_anomalies(df, val_col, z_threshold=min_z_score)
        flagged = anom_df[anom_df["is_anomaly"]].copy()

        cfg = PARAMETERS_CONFIG.get(pid, {})

        for _, row in flagged.iterrows():
            loc_label = "Karnataka Statewide Mean"
            if "location" in row and pd.notna(row["location"]):
                loc_label = str(row["location"])
            elif "reservoir_name" in row and pd.notna(row["reservoir_name"]):
                loc_label = str(row["reservoir_name"])
            elif "zone" in row and pd.notna(row["zone"]):
                loc_label = str(row["zone"])

            # Contextual explanation
            year = int(row["year"])
            month = int(row["month"])
            z = float(row["z_score"])
            explanation = ""
            if pid == "air_temperature" and z > 0:
                explanation = f"Extreme pre-monsoon thermal heat anomaly (+{row['anomaly']}°C above baseline)."
            elif pid == "rainfall" and z < 0:
                explanation = f"Severe monsoon precipitation deficit ({row['anomaly']} mm below baseline), linked to drought."
            elif pid == "rainfall" and z > 0:
                explanation = f"Extreme monsoonal cloudburst deluge (+{row['anomaly']} mm above baseline)."
            elif pid == "water_level" and z < 0:
                explanation = f"Critical reservoir drawdown ({row['anomaly']}% storage below climatological normal)."
            elif pid == "vegetation" and z < 0:
                explanation = f"Vegetation desiccation and biomass stress (NDVI anomaly {row['anomaly']})."
            else:
                explanation = f"Statistical outlier departure of {z:+.2f} standard deviations."

            anomalies_list.append({
                "date": str(row.get("date", f"{year}-{month:02d}-01")),
                "year": year,
                "month": month,
                "parameter_id": pid,
                "parameter_name": cfg.get("name", pid),
                "location": loc_label,
                "district": str(row.get("district", "N/A")),
                "observed_value": round(float(row[val_col]), 2),
                "climatological_normal": round(float(row["clim_normal_mean"]), 2),
                "anomaly_magnitude": round(float(row["anomaly"]), 2),
                "z_score": round(float(row["z_score"]), 2),
                "unit": cfg.get("primary_unit", ""),
                "severity": row["anomaly_severity"],
                "explanation": explanation,
            })

    # Sort by absolute Z-score descending
    anomalies_list.sort(key=lambda x: abs(x["z_score"]), reverse=True)

    return {
        "threshold_z": min_z_score,
        "total_anomalies_found": len(anomalies_list),
        "anomalies": anomalies_list[:limit],
    }


@router.get("/period-comparison")
def get_period_comparison(
    p1_start: int = Query(2000, ge=2000, le=2024),
    p1_end: int = Query(2011, ge=2000, le=2024),
    p2_start: int = Query(2012, ge=2000, le=2024),
    p2_end: int = Query(2024, ge=2000, le=2024),
):
    """
    Compare environmental indicators between two historical eras (Period 1 vs Period 2).
    """
    comparisons = []

    for param_id, (fname, val_col) in DATA_FILE_MAP.items():
        filepath = PROCESSED_DIR / fname
        if not filepath.exists():
            continue
        df = pd.read_csv(filepath)

        change = period_percentage_change(
            df,
            value_col=val_col,
            period1_range=(p1_start, p1_end),
            period2_range=(p2_start, p2_end)
        )
        cfg = PARAMETERS_CONFIG.get(param_id, {})

        comparisons.append({
            "parameter_id": param_id,
            "parameter_name": cfg.get("name", param_id),
            "unit": cfg.get("primary_unit", ""),
            **change
        })

    return {
        "period1": f"{p1_start}-{p1_end}",
        "period2": f"{p2_start}-{p2_end}",
        "comparisons": comparisons,
    }
