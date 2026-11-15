"""NASA POWER API client for fetching historical atmospheric and precipitation data for Karnataka."""

import calendar
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
import requests
import pandas as pd

from app.config import RAW_DIR

logger = logging.getLogger(__name__)

NASA_POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"


class NasaPowerClient:
    """Client for querying the official NASA POWER API."""

    def __init__(self, raw_cache_dir: Path = RAW_DIR):
        self.cache_dir = raw_cache_dir / "nasa_power"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def fetch_point_monthly(
        self,
        lat: float,
        lon: float,
        start_year: int = 2000,
        end_year: int = 2024,
        parameters: str = "T2M,PRECTOTCORR,T2M_MAX,T2M_MIN,RH2M",
        community: str = "AG",
        force_refresh: bool = False
    ) -> Optional[Dict]:
        """Fetch monthly time series from NASA POWER API for a given coordinate."""
        cache_file = self.cache_dir / f"power_{lat:.4f}_{lon:.4f}_{start_year}_{end_year}.json"

        if cache_file.exists() and not force_refresh:
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Failed to read cache file %s: %s", cache_file, e)

        params = {
            "parameters": parameters,
            "community": community,
            "longitude": lon,
            "latitude": lat,
            "start": start_year,
            "end": end_year,
            "format": "JSON",
        }
        headers = {"User-Agent": "EarthTrendDetective/1.0 (NASA Hackathon)"}

        try:
            logger.info("Fetching NASA POWER data for lat=%.4f, lon=%.4f (%d-%d)...", lat, lon, start_year, end_year)
            response = requests.get(NASA_POWER_BASE_URL, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            return data
        except Exception as e:
            logger.error("Error fetching NASA POWER data for lat=%.4f, lon=%.4f: %s", lat, lon, e)
            return None

    def parse_to_dataframe(
        self,
        data: Dict,
        location_name: str,
        district: str,
        zone: str
    ) -> pd.DataFrame:
        """
        Parse NASA POWER JSON response into standardized pandas DataFrame.
        Computes accumulated monthly precipitation correctly from daily rate.
        """
        if not data or "properties" not in data or "parameter" not in data["properties"]:
            return pd.DataFrame()

        params = data["properties"]["parameter"]
        t2m_dict = params.get("T2M", {})
        precip_dict = params.get("PRECTOTCORR", {})
        tmax_dict = params.get("T2M_MAX", {})
        tmin_dict = params.get("T2M_MIN", {})
        rh_dict = params.get("RH2M", {})
        coords = data.get("geometry", {}).get("coordinates", [0, 0, 0])
        lon, lat = coords[0], coords[1]

        rows = []
        for ym_key, t2m_val in t2m_dict.items():
            # Skip annual summary key (which ends with '13', e.g. 202013)
            if len(ym_key) != 6 or ym_key.endswith("13"):
                continue

            year = int(ym_key[:4])
            month = int(ym_key[4:6])

            # Days in this specific month (handling leap years)
            _, num_days = calendar.monthrange(year, month)

            # NASA POWER missing value is -999.0
            quality_flag = 0
            t2m_clean = float(t2m_val)
            if t2m_clean == -999.0 or t2m_clean < -50 or t2m_clean > 60:
                t2m_clean = None
                quality_flag = 2

            # Precipitation: raw is mm/day. Accumulated monthly sum = mm/day * num_days
            raw_precip_rate = float(precip_dict.get(ym_key, 0.0))
            if raw_precip_rate == -999.0 or raw_precip_rate < 0:
                accum_precip = None
                quality_flag = 2
            else:
                accum_precip = round(raw_precip_rate * num_days, 2)

            tmax_val = float(tmax_dict.get(ym_key, -999))
            tmin_val = float(tmin_dict.get(ym_key, -999))
            rh_val = float(rh_dict.get(ym_key, -999))

            date_str = f"{year}-{month:02d}-01"

            rows.append({
                "date": date_str,
                "year": year,
                "month": month,
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "location": location_name,
                "district": district,
                "zone": zone,
                "air_temperature": t2m_clean,
                "air_temperature_max": tmax_val if tmax_val != -999 else None,
                "air_temperature_min": tmin_val if tmin_val != -999 else None,
                "rainfall_accumulated": accum_precip,
                "daily_precip_rate": raw_precip_rate if raw_precip_rate != -999 else None,
                "relative_humidity": rh_val if rh_val != -999 else None,
                "quality_flag": quality_flag,
                "data_source": "NASA POWER MERRA-2 / GPM IMERG",
            })

        df = pd.DataFrame(rows)
        return df


nasa_power_client = NasaPowerClient()
