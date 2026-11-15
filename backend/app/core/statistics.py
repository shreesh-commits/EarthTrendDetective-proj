"""Statistical Analysis Engine for EarthTrend Detective.
Implements mathematically rigorous trend detection:
- Mann-Kendall non-parametric trend test (with tie corrections)
- Sen's slope estimator (median rate of change)
- Ordinary Least Squares (OLS) linear regression
- Climatological monthly anomaly detection (Z-scores)
- Period-over-period percentage changes
- Seasonal aggregation and rate of change computations.
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from scipy import stats


def mann_kendall_test(series: Union[List[float], np.ndarray, pd.Series], alpha: float = 0.05) -> Dict:
    """
    Perform the non-parametric Mann-Kendall test for monotonic trends.
    Corrects for ties in the data.

    Returns:
        dict with:
            - trend: 'increasing', 'decreasing', or 'no trend'
            - is_significant: bool (p_value < alpha)
            - p_value: float
            - z_statistic: float
            - tau: Kendall's Tau rank correlation coefficient
            - s_statistic: Mann-Kendall S score
            - var_s: Variance of S
    """
    x = np.asarray(series, dtype=float)
    # Remove NaN values
    x = x[~np.isnan(x)]
    n = len(x)

    if n < 4:
        return {
            "trend": "insufficient data",
            "is_significant": False,
            "p_value": 1.0,
            "z_statistic": 0.0,
            "tau": 0.0,
            "s_statistic": 0,
            "var_s": 0.0,
            "n_samples": n,
        }

    # 1. Compute S score
    s = 0
    for k in range(n - 1):
        diff = x[k + 1:] - x[k]
        s += np.sum(np.sign(diff))

    # 2. Account for tied values
    unique_vals, counts = np.unique(x, return_counts=True)
    tie_adjustment = np.sum(counts * (counts - 1) * (2 * counts + 5))

    # Variance of S
    var_s = (n * (n - 1) * (2 * n + 5) - tie_adjustment) / 18.0

    # 3. Compute standardized test statistic Z
    if s > 0:
        z = (s - 1) / np.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / np.sqrt(var_s)
    else:
        z = 0.0

    # Two-tailed p-value
    p_val = 2.0 * (1.0 - stats.norm.cdf(abs(z)))

    # Kendall's tau
    tau = s / (0.5 * n * (n - 1))

    is_sig = bool(p_val < alpha)
    if is_sig:
        trend = "increasing" if z > 0 else "decreasing"
    else:
        trend = "no statistically significant trend"

    return {
        "trend": trend,
        "is_significant": is_sig,
        "p_value": round(float(p_val), 5),
        "z_statistic": round(float(z), 4),
        "tau": round(float(tau), 4),
        "s_statistic": int(s),
        "var_s": round(float(var_s), 2),
        "n_samples": int(n),
        "confidence_level": f"{(1 - alpha) * 100:.0f}%",
    }


def sens_slope(
    series: Union[List[float], np.ndarray, pd.Series],
    years: Optional[Union[List[float], np.ndarray]] = None
) -> Dict:
    """
    Compute Theil-Sen estimator: median of pairwise slopes.
    Provides robust, outlier-resilient rate of change per unit time.
    """
    y = np.asarray(series, dtype=float)
    if years is not None:
        t = np.asarray(years, dtype=float)
        valid_mask = (~np.isnan(y)) & (~np.isnan(t))
        y = y[valid_mask]
        t = t[valid_mask]
    else:
        valid_mask = ~np.isnan(y)
        y = y[valid_mask]
        t = np.arange(len(y), dtype=float)

    n = len(y)
    if n < 2:
        return {
            "sen_slope": 0.0,
            "intercept": 0.0,
            "direction": "stable",
            "unit_per_year": 0.0,
            "unit_per_decade": 0.0
        }

    # Pairwise slopes
    slopes = []
    for i in range(n - 1):
        dt = t[i + 1:] - t[i]
        dy = y[i + 1:] - y[i]
        non_zero = dt != 0
        if np.any(non_zero):
            slopes.extend((dy[non_zero] / dt[non_zero]).tolist())

    if not slopes:
        return {"sen_slope": 0.0, "intercept": 0.0, "direction": "stable"}

    median_slope = float(np.median(slopes))
    intercept = float(np.median(y - median_slope * t))

    direction = "increasing" if median_slope > 0.0001 else ("decreasing" if median_slope < -0.0001 else "stable")

    return {
        "sen_slope": round(median_slope, 5),
        "intercept": round(intercept, 4),
        "direction": direction,
        "unit_per_year": round(median_slope, 5),
        "unit_per_decade": round(median_slope * 10.0, 4),
    }


def linear_regression_trend(
    series: Union[List[float], np.ndarray, pd.Series],
    time_points: Optional[Union[List[float], np.ndarray]] = None
) -> Dict:
    """
    Compute Ordinary Least Squares (OLS) linear regression trend line and fit parameters.
    """
    y = np.asarray(series, dtype=float)
    if time_points is not None:
        x = np.asarray(time_points, dtype=float)
        valid_mask = (~np.isnan(y)) & (~np.isnan(x))
        y = y[valid_mask]
        x = x[valid_mask]
    else:
        valid_mask = ~np.isnan(y)
        y = y[valid_mask]
        x = np.arange(len(y), dtype=float)

    if len(y) < 3:
        return {
            "slope": 0.0,
            "intercept": 0.0,
            "r_squared": 0.0,
            "p_value": 1.0,
            "std_err": 0.0,
            "trend_direction": "insufficient data"
        }

    res = stats.linregress(x, y)
    slope = float(res.slope)
    r2 = float(res.rvalue ** 2)

    direction = "increasing" if slope > 0.0001 else ("decreasing" if slope < -0.0001 else "flat")

    return {
        "slope": round(slope, 5),
        "intercept": round(float(res.intercept), 4),
        "r_squared": round(r2, 4),
        "p_value": round(float(res.pvalue), 5),
        "std_err": round(float(res.stderr), 5),
        "trend_direction": direction,
        "rate_per_decade": round(slope * 10.0, 4),
    }


def detect_climatological_anomalies(
    df: pd.DataFrame,
    value_col: str,
    date_col: str = "date",
    month_col: str = "month",
    year_col: str = "year",
    baseline_start_year: int = 2000,
    baseline_end_year: int = 2020,
    z_threshold: float = 1.645  # ~90% confidence threshold (two-tailed)
) -> pd.DataFrame:
    """
    Detect statistical anomalies by comparing each monthly observation against the historical
    climatological baseline (mean & std dev) for that specific calendar month.
    """
    result_df = df.copy()

    # Filter baseline slice
    baseline_mask = (result_df[year_col] >= baseline_start_year) & (result_df[year_col] <= baseline_end_year)
    baseline_df = result_df[baseline_mask]

    # Calculate monthly climatological normal (mean and standard deviation)
    clim_stats = baseline_df.groupby(month_col)[value_col].agg(["mean", "std"]).reset_index()
    clim_stats.rename(columns={"mean": "clim_normal_mean", "std": "clim_normal_std"}, inplace=True)

    result_df = result_df.merge(clim_stats, on=month_col, how="left")

    # Avoid divide by zero
    result_df["clim_normal_std"] = result_df["clim_normal_std"].replace(0, np.nan)

    # Anomaly and Z-Score
    result_df["anomaly"] = (result_df[value_col] - result_df["clim_normal_mean"]).round(3)
    result_df["z_score"] = ((result_df[value_col] - result_df["clim_normal_mean"]) / result_df["clim_normal_std"]).round(3)

    # Classify severity
    def classify_severity(z):
        if pd.isna(z):
            return "Normal"
        abs_z = abs(z)
        if abs_z >= 2.5:
            return "Severe Outlier"
        elif abs_z >= z_threshold:
            return "Moderate Anomaly"
        return "Normal Range"

    result_df["anomaly_severity"] = result_df["z_score"].apply(classify_severity)
    result_df["is_anomaly"] = result_df["z_score"].abs() >= z_threshold

    return result_df


def period_percentage_change(
    df: pd.DataFrame,
    value_col: str,
    year_col: str = "year",
    period1_range: Tuple[int, int] = (2000, 2011),
    period2_range: Tuple[int, int] = (2012, 2024)
) -> Dict:
    """
    Calculate percentage difference between two distinct historical periods.
    """
    p1_mask = (df[year_col] >= period1_range[0]) & (df[year_col] <= period1_range[1])
    p2_mask = (df[year_col] >= period2_range[0]) & (df[year_col] <= period2_range[1])

    mean_p1 = df.loc[p1_mask, value_col].mean()
    mean_p2 = df.loc[p2_mask, value_col].mean()

    if pd.isna(mean_p1) or pd.isna(mean_p2) or mean_p1 == 0:
        return {
            "period1_mean": round(float(mean_p1), 3) if not pd.isna(mean_p1) else 0.0,
            "period2_mean": round(float(mean_p2), 3) if not pd.isna(mean_p2) else 0.0,
            "absolute_change": 0.0,
            "percentage_change": 0.0,
            "period1": f"{period1_range[0]}-{period1_range[1]}",
            "period2": f"{period2_range[0]}-{period2_range[1]}"
        }

    abs_change = mean_p2 - mean_p1
    pct_change = (abs_change / abs(mean_p1)) * 100.0

    return {
        "period1": f"{period1_range[0]}-{period1_range[1]}",
        "period2": f"{period2_range[0]}-{period2_range[1]}",
        "period1_mean": round(float(mean_p1), 3),
        "period2_mean": round(float(mean_p2), 3),
        "absolute_change": round(float(abs_change), 3),
        "percentage_change": round(float(pct_change), 2),
    }


def compute_seasonal_breakdown(
    df: pd.DataFrame,
    value_col: str,
    season_col: str = "season",
    year_col: str = "year"
) -> Dict[str, Dict]:
    """
    Analyze historical changes separately for each season:
    Pre-Monsoon, Southwest Monsoon, Post-Monsoon, Winter.
    """
    seasons = ["Pre-Monsoon", "Southwest Monsoon", "Post-Monsoon", "Winter"]
    breakdown = {}

    for s in seasons:
        s_df = df[df[season_col] == s]
        if s_df.empty:
            continue

        annual_seasonal = s_df.groupby(year_col)[value_col].mean().reset_index()
        years = annual_seasonal[year_col].values
        vals = annual_seasonal[value_col].values

        mk = mann_kendall_test(vals)
        sen = sens_slope(vals, years)
        lr = linear_regression_trend(vals, years)

        breakdown[s] = {
            "season_name": s,
            "mean_value": round(float(np.nanmean(vals)), 3),
            "std_dev": round(float(np.nanstd(vals)), 3),
            "min_value": round(float(np.nanmin(vals)), 3),
            "max_value": round(float(np.nanmax(vals)), 3),
            "mann_kendall": mk,
            "sens_slope": sen,
            "linear_regression": lr,
            "trend_summary": f"{mk['trend'].title()} ({sen['unit_per_decade']:+.3f} per decade, p={mk['p_value']:.4f})",
        }

    return breakdown
