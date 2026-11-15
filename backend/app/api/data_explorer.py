"""Data Explorer and Raw CSV Export API Router."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Query, Response
import pandas as pd

from app.config import PROCESSED_DIR
from app.api.parameters import DATA_FILE_MAP

router = APIRouter(prefix="/explorer", tags=["Data Explorer"])


@router.get("/records")
def get_explorer_records(
    parameter_id: str = Query("air_temperature", description="Parameter dataset"),
    year_min: int = Query(2000, ge=2000, le=2024),
    year_max: int = Query(2024, ge=2000, le=2024),
    location: Optional[str] = Query(None, description="Location filter"),
    season: Optional[str] = Query(None, description="Season filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    """Retrieve paginated environmental observation records for exploration."""
    if parameter_id not in DATA_FILE_MAP and parameter_id != "master":
        parameter_id = "air_temperature"

    if parameter_id == "master":
        filepath = PROCESSED_DIR / "karnataka_environmental_master.csv"
    else:
        fname, _ = DATA_FILE_MAP[parameter_id]
        filepath = PROCESSED_DIR / fname

    if not filepath.exists():
        return {"total": 0, "page": page, "page_size": page_size, "records": []}

    df = pd.read_csv(filepath)

    # Filtering
    if "year" in df.columns:
        df = df[(df["year"] >= year_min) & (df["year"] <= year_max)]

    if season and "season" in df.columns:
        df = df[df["season"] == season]

    if location:
        if "location" in df.columns:
            df = df[df["location"].str.contains(location, case=False, na=False)]
        elif "reservoir_name" in df.columns:
            df = df[df["reservoir_name"].str.contains(location, case=False, na=False)]
        elif "zone" in df.columns:
            df = df[df["zone"].str.contains(location, case=False, na=False)]

    total_records = len(df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    sliced = df.iloc[start_idx:end_idx]
    records = sliced.to_dict(orient="records")

    # Clean floats
    for r in records:
        for k, v in r.items():
            if isinstance(v, float) and pd.isna(v):
                r[k] = None
            elif isinstance(v, float):
                r[k] = round(v, 3)

    return {
        "parameter_id": parameter_id,
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_records + page_size - 1) // page_size,
        "columns": list(df.columns),
        "records": records,
    }


@router.get("/download-csv")
def download_csv(parameter_id: str = Query("air_temperature")):
    """Export dataset as clean CSV."""
    if parameter_id == "master":
        filepath = PROCESSED_DIR / "karnataka_environmental_master.csv"
        filename = "earthtrend_karnataka_master_2000_2024.csv"
    elif parameter_id in DATA_FILE_MAP:
        fname, _ = DATA_FILE_MAP[parameter_id]
        filepath = PROCESSED_DIR / fname
        filename = f"earthtrend_karnataka_{parameter_id}_2000_2024.csv"
    else:
        filepath = PROCESSED_DIR / "air_temperature_monthly.csv"
        filename = "earthtrend_karnataka_air_temperature_2000_2024.csv"

    if not filepath.exists():
        return Response(content="File not found", status_code=404)

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
