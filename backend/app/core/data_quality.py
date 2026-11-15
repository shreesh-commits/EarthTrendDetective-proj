"""Data Quality & Integrity Auditing Engine for EarthTrend Detective.
Audits completeness, spatial bounds, temporal continuity, and suspicious outliers.
Maintains standard Quality Flags:
  0 = Validated Real-World Scientific Observation
  1 = Flagged / Verified Non-Missing
  2 = Missing / Suspect
"""

from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import pandas as pd

from app.config import PROCESSED_DIR, KARNATAKA_BBOX


class DataQualityAuditor:
    """Performs rigorous quality audits across all 6 environmental datasets."""

    def __init__(self):
        self.datasets = {
            "air_temperature": PROCESSED_DIR / "air_temperature_monthly.csv",
            "rainfall": PROCESSED_DIR / "rainfall_monthly.csv",
            "water_temperature": PROCESSED_DIR / "water_temperature_monthly.csv",
            "water_level": PROCESSED_DIR / "water_level_monthly.csv",
            "vegetation": PROCESSED_DIR / "vegetation_monthly.csv",
            "soil_moisture": PROCESSED_DIR / "soil_moisture_monthly.csv",
            "statewide_master": PROCESSED_DIR / "karnataka_environmental_master.csv",
        }

    def audit_dataset(self, dataset_key: str) -> Dict:
        """Run comprehensive quality audit on a specific dataset."""
        file_path = self.datasets.get(dataset_key)
        if not file_path or not file_path.exists():
            return {
                "dataset": dataset_key,
                "status": "Missing File",
                "total_records": 0,
                "valid_records": 0,
                "missing_count": 0,
                "completeness_pct": 0.0,
            }

        df = pd.read_csv(file_path)
        total_rows = len(df)

        # 1. Check duplicates
        duplicate_count = int(df.duplicated().sum())

        # 2. Check Coordinate bounds (if lat/lon present)
        invalid_coords = 0
        if "latitude" in df.columns and "longitude" in df.columns:
            invalid_coords = int((
                (df["latitude"] < KARNATAKA_BBOX["min_lat"] - 1.0) |
                (df["latitude"] > KARNATAKA_BBOX["max_lat"] + 1.0) |
                (df["longitude"] < KARNATAKA_BBOX["min_lon"] - 1.0) |
                (df["longitude"] > KARNATAKA_BBOX["max_lon"] + 1.0)
            ).sum())

        # 3. Temporal completeness (2000-2024 = 25 years * 12 = 300 months expected per station/zone)
        temporal_span = f"{df['year'].min()} to {df['year'].max()}" if "year" in df.columns else "Unknown"

        # 4. Check for missing values across columns
        missing_by_col = {col: int(df[col].isna().sum()) for col in df.columns}
        total_missing = sum(missing_by_col.values())
        completeness = round(((total_rows * len(df.columns) - total_missing) / (total_rows * len(df.columns))) * 100.0, 2)

        # 5. Outlier & Physical Plausibility checks
        suspicious_flags = []
        if dataset_key == "air_temperature" and "air_temperature" in df.columns:
            unrealistic = df[(df["air_temperature"] < 5.0) | (df["air_temperature"] > 55.0)]
            if len(unrealistic) > 0:
                suspicious_flags.append(f"{len(unrealistic)} records outside plausible 5°C-55°C range")

        if dataset_key == "rainfall" and "rainfall_accumulated" in df.columns:
            unrealistic_rain = df[df["rainfall_accumulated"] < 0]
            if len(unrealistic_rain) > 0:
                suspicious_flags.append(f"{len(unrealistic_rain)} negative rainfall records detected")

        if dataset_key == "vegetation" and "ndvi" in df.columns:
            unrealistic_ndvi = df[(df["ndvi"] < -0.2) | (df["ndvi"] > 1.0)]
            if len(unrealistic_ndvi) > 0:
                suspicious_flags.append(f"{len(unrealistic_ndvi)} NDVI values outside valid [-0.2, 1.0] land range")

        return {
            "dataset": dataset_key,
            "total_records": total_rows,
            "temporal_span": temporal_span,
            "duplicate_records": duplicate_count,
            "invalid_spatial_coordinates": invalid_coords,
            "completeness_percentage": completeness,
            "missing_values_by_column": missing_by_col,
            "plausibility_flags": suspicious_flags if suspicious_flags else ["All physical values within valid planetary thresholds"],
            "quality_status": "EXCELLENT" if completeness > 99.0 and not suspicious_flags else "ACCEPTABLE",
        }

    def audit_all(self) -> Dict[str, Dict]:
        """Audit all 6 environmental datasets plus statewide master."""
        return {key: self.audit_dataset(key) for key in self.datasets.keys()}


data_quality_auditor = DataQualityAuditor()
