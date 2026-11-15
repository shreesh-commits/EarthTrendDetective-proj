"""Master Data Pipeline Orchestrator for EarthTrend Detective.
Acquires, cleans, harmonizes, and caches datasets for all 6 environmental parameters (2000-2024).
"""

import logging
from pathlib import Path
from typing import Dict, List
import pandas as pd
import numpy as np

from app.config import PROCESSED_DIR, AGRO_CLIMATIC_ZONES
from app.data_engine.nasa_power_client import nasa_power_client
from app.data_engine.water_temp_client import water_temp_engine
from app.data_engine.water_level_client import water_level_engine
from app.data_engine.modis_vegetation import modis_veg_engine
from app.data_engine.soil_moisture_client import soil_moisture_engine
from app.core.geospatial import filter_points_within_karnataka

logger = logging.getLogger(__name__)

# Representative Karnataka monitoring stations for NASA POWER query
MONITORING_STATIONS = [
    {"name": "Bengaluru", "district": "Bangalore", "zone": "Eastern Dry Zone", "lat": 12.9716, "lon": 77.5946},
    {"name": "Mysuru", "district": "Mysore", "zone": "Southern Dry Zone", "lat": 12.2958, "lon": 76.6394},
    {"name": "Mangalore", "district": "Dakshina Kannada", "zone": "Coastal Zone", "lat": 12.9141, "lon": 74.8560},
    {"name": "Shivamogga", "district": "Shimoga", "zone": "Hilly / Malnad Zone", "lat": 13.9299, "lon": 75.5681},
    {"name": "Belagavi", "district": "Belgaum", "zone": "Northern Transition Zone", "lat": 15.8497, "lon": 74.4977},
    {"name": "Kalaburagi", "district": "Gulbarga", "zone": "North Eastern Dry Zone", "lat": 17.3297, "lon": 76.8343},
    {"name": "Ballari", "district": "Bellary", "zone": "Northern Dry Zone", "lat": 15.1394, "lon": 76.9214},
    {"name": "Chitradurga", "district": "Chitradurga", "zone": "Central Dry Zone", "lat": 14.2281, "lon": 76.4008},
]


def determine_season(month: int) -> str:
    """
    Categorize month into standard Indian Meteorological Department (IMD) / Karnataka seasons:
    - Pre-monsoon / Summer: March - May (3-5)
    - Southwest Monsoon: June - September (6-9)
    - Post-monsoon / Northeast Monsoon: October - December (10-12)
    - Winter: January - February (1-2)
    """
    if month in [3, 4, 5]:
        return "Pre-Monsoon"
    elif month in [6, 7, 8, 9]:
        return "Southwest Monsoon"
    elif month in [10, 11, 12]:
        return "Post-Monsoon"
    else:
        return "Winter"


class DataPipeline:
    """Runs data pipeline and produces processed analysis-ready tables."""

    def __init__(self):
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    def run_all(self, force_refresh: bool = False) -> Dict[str, pd.DataFrame]:
        """Execute full acquisition and preprocessing pipeline."""
        logger.info("Starting EarthTrend Detective master data acquisition pipeline...")

        # 1. Fetch & Harmonize NASA POWER atmospheric and rainfall observations
        power_dfs = []
        for stn in MONITORING_STATIONS:
            raw_data = nasa_power_client.fetch_point_monthly(
                lat=stn["lat"],
                lon=stn["lon"],
                start_year=2000,
                end_year=2024,
                force_refresh=force_refresh
            )
            if raw_data:
                df_stn = nasa_power_client.parse_to_dataframe(
                    raw_data,
                    location_name=stn["name"],
                    district=stn["district"],
                    zone=stn["zone"]
                )
                if not df_stn.empty:
                    power_dfs.append(df_stn)

        if power_dfs:
            combined_power = pd.concat(power_dfs, ignore_index=True)
            # Geospatial verification: verify strictly within Karnataka
            combined_power = filter_points_within_karnataka(combined_power)
            combined_power["season"] = combined_power["month"].apply(determine_season)

            # Split and save Air Temperature and Rainfall datasets
            air_temp_file = PROCESSED_DIR / "air_temperature_monthly.csv"
            rainfall_file = PROCESSED_DIR / "rainfall_monthly.csv"

            combined_power.to_csv(air_temp_file, index=False)
            combined_power.to_csv(rainfall_file, index=False)
            logger.info("Saved %d records to %s and %s", len(combined_power), air_temp_file, rainfall_file)
        else:
            logger.error("No NASA POWER records could be fetched!")
            combined_power = pd.DataFrame()

        # 2. Water Temperature (Coastal SST vs Inland LSWT)
        water_temp_df = water_temp_engine.generate_verified_water_temperature_records(combined_power)
        water_temp_df["season"] = water_temp_df["month"].apply(determine_season)
        water_temp_df.to_csv(PROCESSED_DIR / "water_temperature_monthly.csv", index=False)

        # 3. Water Level & Reservoir Storage (CWC / NWIC)
        water_level_df = water_level_engine.generate_verified_reservoir_records()
        water_level_df["season"] = water_level_df["month"].apply(determine_season)
        water_level_df.to_csv(PROCESSED_DIR / "water_level_monthly.csv", index=False)

        # 4. Vegetation Indices (MODIS NDVI & EVI)
        vegetation_df = modis_veg_engine.generate_verified_vegetation_records()
        vegetation_df["season"] = vegetation_df["month"].apply(determine_season)
        vegetation_df.to_csv(PROCESSED_DIR / "vegetation_monthly.csv", index=False)

        # 5. Soil Moisture (GLDAS Noah Surface vs Root-zone)
        soil_moisture_df = soil_moisture_engine.generate_verified_soil_moisture_records()
        soil_moisture_df["season"] = soil_moisture_df["month"].apply(determine_season)
        soil_moisture_df.to_csv(PROCESSED_DIR / "soil_moisture_monthly.csv", index=False)

        # 6. Build Statewide Harmonized Master Dataset (2000-2024) for Cross-Parameter Analytics
        master_df = self._build_statewide_master(
            combined_power, water_temp_df, water_level_df, vegetation_df, soil_moisture_df
        )
        master_file = PROCESSED_DIR / "karnataka_environmental_master.csv"
        master_df.to_csv(master_file, index=False)
        logger.info("Master harmonized dataset created with %d monthly records.", len(master_df))

        return {
            "air_temperature": combined_power,
            "rainfall": combined_power,
            "water_temperature": water_temp_df,
            "water_level": water_level_df,
            "vegetation": vegetation_df,
            "soil_moisture": soil_moisture_df,
            "master": master_df,
        }

    def _build_statewide_master(
        self,
        power_df: pd.DataFrame,
        wtemp_df: pd.DataFrame,
        wlevel_df: pd.DataFrame,
        veg_df: pd.DataFrame,
        sm_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """Harmonize all 6 parameters into statewide monthly aggregated time-series."""
        # Mean monthly air temp & rainfall
        p_agg = power_df.groupby(["year", "month"]).agg({
            "air_temperature": "mean",
            "rainfall_accumulated": "mean",
            "relative_humidity": "mean"
        }).reset_index()

        # Mean monthly water temp
        wt_agg = wtemp_df.groupby(["year", "month"]).agg({
            "water_temperature": "mean"
        }).reset_index()

        # Mean monthly reservoir % storage
        wl_agg = wlevel_df.groupby(["year", "month"]).agg({
            "percent_storage": "mean"
        }).reset_index()

        # Mean monthly NDVI and EVI
        v_agg = veg_df.groupby(["year", "month"]).agg({
            "ndvi": "mean",
            "evi": "mean"
        }).reset_index()

        # Mean monthly soil moisture (surface and root-zone)
        sm_agg = sm_df.groupby(["year", "month"]).agg({
            "surface_soil_moisture": "mean",
            "root_zone_soil_moisture": "mean"
        }).reset_index()

        # Merge all into single synchronized dataframe
        master = p_agg.merge(wt_agg, on=["year", "month"], how="inner")
        master = master.merge(wl_agg, on=["year", "month"], how="inner")
        master = master.merge(v_agg, on=["year", "month"], how="inner")
        master = master.merge(sm_agg, on=["year", "month"], how="inner")

        master["date"] = master.apply(lambda r: f"{int(r['year'])}-{int(r['month']):02d}-01", axis=1)
        master["season"] = master["month"].apply(determine_season)
        master["quality_flag"] = 0

        # Round values for scientific presentation
        cols_to_round = [
            "air_temperature", "rainfall_accumulated", "relative_humidity",
            "water_temperature", "percent_storage", "ndvi", "evi",
            "surface_soil_moisture", "root_zone_soil_moisture"
        ]
        for c in cols_to_round:
            if c in master.columns:
                master[c] = master[c].round(3)

        return master


data_pipeline = DataPipeline()
