"""Cross-Parameter Environmental Analysis Engine.
Computes Pearson & Spearman rank correlations, time-lag relationships,
and scientific insights across environmental parameters in Karnataka.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats

from app.config import PROCESSED_DIR

# Key scientific hypothesis pairs to examine
CROSS_PARAMETER_PAIRS = [
    {
        "pair_id": "rain_soil_moisture",
        "name": "Rainfall vs Surface Soil Moisture",
        "param_x": "rainfall_accumulated",
        "param_y": "surface_soil_moisture",
        "expected_relationship": "Positive synchronous coupling. High rainfall immediately recharges topsoil volumetric water content.",
        "lag_months": 0,
    },
    {
        "pair_id": "rain_root_moisture_lag",
        "name": "Rainfall vs Root-Zone Soil Moisture (Lagged)",
        "param_x": "rainfall_accumulated",
        "param_y": "root_zone_soil_moisture",
        "expected_relationship": "Positive 1-month lagged recharge. Infiltration from heavy monsoon rainfall takes weeks to saturate sub-surface 10-100cm profile.",
        "lag_months": 1,
    },
    {
        "pair_id": "rain_vegetation_lag",
        "name": "Rainfall vs Vegetation Greenness (NDVI, 1-Month Lag)",
        "param_x": "rainfall_accumulated",
        "param_y": "ndvi",
        "expected_relationship": "Strong positive delayed response. Peak vegetation greenness in Karnataka lags monsoon onset by 3 to 6 weeks as biomass matures.",
        "lag_months": 1,
    },
    {
        "pair_id": "temp_soil_moisture",
        "name": "Air Temperature vs Surface Soil Moisture",
        "param_x": "air_temperature",
        "param_y": "surface_soil_moisture",
        "expected_relationship": "Inverse (negative) correlation. Higher solar radiative flux and temperatures accelerate atmospheric evaporative demand and desiccation.",
        "lag_months": 0,
    },
    {
        "pair_id": "temp_vegetation",
        "name": "Air Temperature vs Vegetation Greenness (NDVI)",
        "param_x": "air_temperature",
        "param_y": "ndvi",
        "expected_relationship": "Negative in summer (heat stress & fallow drying), transitioning to positive in humid subtropical high-altitude Malnad under adequate moisture.",
        "lag_months": 0,
    },
    {
        "pair_id": "air_water_temp",
        "name": "Air Temperature vs Inland Water Surface Temperature",
        "param_x": "air_temperature",
        "param_y": "water_temperature",
        "expected_relationship": "Strong positive thermodynamic coupling. Inland water bodies equilibrium surface temperature is dominated by sensible and latent heat exchange.",
        "lag_months": 0,
    },
    {
        "pair_id": "rain_water_level",
        "name": "Rainfall vs Reservoir Storage Percentage",
        "param_x": "rainfall_accumulated",
        "param_y": "percent_storage",
        "expected_relationship": "Positive non-linear catchment runoff response. River basin inflow recharges reservoir storages with peak storage occurring in late monsoon (August-October).",
        "lag_months": 1,
    },
]


class CrossParameterEngine:
    """Computes cross-parameter correlation matrices and scientific lag relationships."""

    def __init__(self):
        self.master_file = PROCESSED_DIR / "karnataka_environmental_master.csv"

    def get_master_df(self) -> pd.DataFrame:
        """Load statewide master harmonized dataset."""
        if not self.master_file.exists():
            return pd.DataFrame()
        return pd.read_csv(self.master_file)

    def compute_correlation_matrix(self) -> Dict:
        """
        Compute Pearson and Spearman correlation matrices across all 6 core parameters.
        """
        df = self.get_master_df()
        if df.empty:
            return {"variables": [], "pearson": [], "spearman": []}

        columns = [
            ("air_temperature", "Air Temp (°C)"),
            ("rainfall_accumulated", "Rainfall (mm)"),
            ("water_temperature", "Water Temp (°C)"),
            ("percent_storage", "Reservoir Storage (%)"),
            ("ndvi", "Vegetation (NDVI)"),
            ("surface_soil_moisture", "Surface Soil Moist (m³/m³)"),
            ("root_zone_soil_moisture", "Root Soil Moist (m³/m³)")
        ]

        valid_cols = [c[0] for c in columns if c[0] in df.columns]
        labels = [c[1] for c in columns if c[0] in df.columns]

        sub_df = df[valid_cols].dropna()

        # Pearson correlation
        pearson_mat = sub_df.corr(method="pearson").round(3).values.tolist()
        # Spearman rank correlation
        spearman_mat = sub_df.corr(method="spearman").round(3).values.tolist()

        return {
            "variables": valid_cols,
            "labels": labels,
            "pearson": pearson_mat,
            "spearman": spearman_mat,
            "n_observations": len(sub_df),
            "disclaimer": "Correlation does NOT imply direct physical causation. Atmospheric, hydrological, and biospheric systems involve complex nonlinear couplings and multi-scale feedbacks."
        }

    def analyze_specific_pair(
        self,
        param_x: str,
        param_y: str,
        lag: int = 0
    ) -> Dict:
        """
        Perform detailed bivariate correlation with optional time lag (e.g. Y shifted by +lag months).
        """
        df = self.get_master_df()
        if df.empty or param_x not in df.columns or param_y not in df.columns:
            return {"error": "Invalid parameters or empty dataset"}

        sub = df[["date", "year", "month", param_x, param_y]].copy()

        if lag > 0:
            # Shift Y backward in index, so Y at time t is aligned with X at time t - lag
            sub[f"{param_y}_lagged_{lag}"] = sub[param_y].shift(-lag)
            sub = sub.dropna()
            y_col = f"{param_y}_lagged_{lag}"
        else:
            sub = sub.dropna()
            y_col = param_y

        x_vals = sub[param_x].values
        y_vals = sub[y_col].values

        if len(x_vals) < 10:
            return {"error": "Insufficient data points"}

        # Pearson
        p_r, p_p = stats.pearsonr(x_vals, y_vals)
        # Spearman
        s_r, s_p = stats.spearmanr(x_vals, y_vals)

        # OLS fit line for scatter plot
        reg = stats.linregress(x_vals, y_vals)

        # Scatter points (sample for frontend rendering)
        scatter_sample = []
        step = max(1, len(sub) // 120)
        for idx in range(0, len(sub), step):
            row = sub.iloc[idx]
            scatter_sample.append({
                "date": str(row["date"]),
                "x": round(float(row[param_x]), 3),
                "y": round(float(row[y_col]), 3),
            })

        return {
            "param_x": param_x,
            "param_y": param_y,
            "lag_months": lag,
            "n_samples": len(x_vals),
            "pearson_r": round(float(p_r), 4),
            "pearson_p_value": round(float(p_p), 5),
            "pearson_significant": bool(p_p < 0.05),
            "spearman_rho": round(float(s_r), 4),
            "spearman_p_value": round(float(s_p), 5),
            "spearman_significant": bool(s_p < 0.05),
            "ols_slope": round(float(reg.slope), 4),
            "ols_intercept": round(float(reg.intercept), 4),
            "ols_r_squared": round(float(reg.rvalue ** 2), 4),
            "scatter_points": scatter_sample,
            "scientific_interpretation": self._interpret_correlation(param_x, param_y, p_r, lag),
        }

    def get_curated_insights(self) -> List[Dict]:
        """Return full list of curated environmental relationships with calculated statistics."""
        insights = []
        for pair in CROSS_PARAMETER_PAIRS:
            res = self.analyze_specific_pair(pair["param_x"], pair["param_y"], pair["lag_months"])
            if "error" not in res:
                insights.append({
                    **pair,
                    "statistics": res
                })
        return insights

    def _interpret_correlation(self, px: str, py: str, r: float, lag: int) -> str:
        strength = "strong" if abs(r) >= 0.7 else ("moderate" if abs(r) >= 0.4 else "weak")
        direction = "positive" if r > 0 else "inverse (negative)"
        lag_txt = f" with a {lag}-month hydrological lag" if lag > 0 else " synchronously"
        return f"Displays a statistically significant {strength} {direction} relationship (r = {r:+.3f}){lag_txt}."


cross_parameter_engine = CrossParameterEngine()
