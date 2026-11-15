"""Geospatial processing utilities for EarthTrend Detective.
Handles grid generation within Karnataka, spatial clipping, and agro-climatic region filtering.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from shapely.geometry import Point

from app.config import KARNATAKA_BBOX, AGRO_CLIMATIC_ZONES
from app.data_engine.boundary_loader import boundary_manager


def generate_karnataka_grid(step_degrees: float = 0.5) -> List[Dict[str, float]]:
    """
    Generate regular grid points across Karnataka bounding box,
    strictly retaining only points lying inside the state polygon.
    """
    lats = np.arange(KARNATAKA_BBOX["min_lat"], KARNATAKA_BBOX["max_lat"] + step_degrees, step_degrees)
    lons = np.arange(KARNATAKA_BBOX["min_lon"], KARNATAKA_BBOX["max_lon"] + step_degrees, step_degrees)

    valid_points = []
    grid_id = 1
    for lat in lats:
        for lon in lons:
            lat_r = round(float(lat), 4)
            lon_r = round(float(lon), 4)
            if boundary_manager.is_inside_karnataka(lat_r, lon_r):
                district = boundary_manager.identify_district(lat_r, lon_r)
                valid_points.append({
                    "grid_id": f"KA_GRID_{grid_id:03d}",
                    "latitude": lat_r,
                    "longitude": lon_r,
                    "district": district or "Unassigned Border",
                    "zone": get_agro_climatic_zone(lat_r, lon_r)
                })
                grid_id += 1
    return valid_points


def filter_points_within_karnataka(df: pd.DataFrame, lat_col: str = "latitude", lon_col: str = "longitude") -> pd.DataFrame:
    """Filter a dataframe to keep only points strictly inside the Karnataka boundary polygon."""
    if df.empty or lat_col not in df.columns or lon_col not in df.columns:
        return df

    mask = df.apply(lambda row: boundary_manager.is_inside_karnataka(float(row[lat_col]), float(row[lon_col])), axis=1)
    filtered_df = df[mask].copy()

    # If district column not present or unassigned, reliably populate it
    if "district" not in filtered_df.columns:
        filtered_df["district"] = filtered_df.apply(
            lambda row: boundary_manager.identify_district(float(row[lat_col]), float(row[lon_col])), axis=1
        )
    return filtered_df


def get_agro_climatic_zone(lat: float, lon: float) -> str:
    """
    Classify point into Karnataka Agro-Climatic Zones based on coordinates and nearest zone centroid.
    """
    # 1. Coastal strip check (west of 75.0 longitude and south of 15.0 latitude)
    if lon < 75.0 and 12.5 <= lat <= 15.0:
        return "Coastal Zone"

    # 2. Western Ghats / Malnad (between 75.0 and 76.0 lon, wet corridor)
    if 75.0 <= lon <= 75.8 and 12.0 <= lat <= 14.5:
        return "Hilly / Malnad Zone"

    # 3. North Eastern Dry (Upper Deccan)
    if lat >= 16.5 and lon >= 76.0:
        return "North Eastern Dry Zone"

    # 4. Northern Dry
    if lat >= 15.0 and lon >= 75.2:
        return "Northern Dry Zone"

    # 5. Southern Dry
    if lat < 13.0 and lon < 77.2:
        return "Southern Dry Zone"

    # 6. Eastern Dry (Bengaluru urban and surrounding plains)
    if lat < 13.8 and lon >= 77.2:
        return "Eastern Dry Zone"

    # 7. Default central dry
    return "Central Dry Zone"
