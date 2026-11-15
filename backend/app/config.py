"""Configuration and project settings for EarthTrend Detective."""
import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
BOUNDARIES_DIR = DATA_DIR / "boundaries"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
METADATA_DIR = DATA_DIR / "metadata"

# Karnataka State Bounding Box (Lat/Lon WGS84)
KARNATAKA_BBOX = {
    "min_lat": 11.59,
    "max_lat": 18.45,
    "min_lon": 74.05,
    "max_lon": 78.58,
}

# Karnataka State Centroid
KARNATAKA_CENTER = {
    "lat": 15.3173,
    "lon": 75.7139,
}

# The 6 Environmental Parameters Configuration
PARAMETERS_CONFIG = {
    "air_temperature": {
        "id": "air_temperature",
        "name": "Air Temperature",
        "variable": "T2M",
        "description": "2-metre Air Temperature from NASA POWER / MERRA-2 assimilation.",
        "primary_unit": "°C",
        "original_unit": "°C",
        "sources": ["NASA POWER", "MERRA-2"],
        "category": "Atmospheric",
    },
    "water_temperature": {
        "id": "water_temperature",
        "name": "Water Temperature",
        "variable": "SST_LSWT",
        "description": "Surface Water Temperature distinguishing coastal marine (Arabian Sea) from inland reservoirs.",
        "primary_unit": "°C",
        "original_unit": "°C",
        "sources": ["NOAA OISST v2.1", "NASA MODIS Aqua", "Inland Hydrological Telemetry"],
        "category": "Hydrospheric",
    },
    "water_level": {
        "id": "water_level",
        "name": "Water Level & Reservoir Storage",
        "variable": "WATER_LEVEL",
        "description": "Historical water levels and storage percentages for major Karnataka reservoirs.",
        "primary_unit": "metres MSL / % Capacity",
        "original_unit": "m MSL",
        "sources": ["Central Water Commission (CWC)", "India-WRIS / NWIC", "KWRIS"],
        "category": "Hydrospheric",
    },
    "vegetation": {
        "id": "vegetation",
        "name": "Vegetation Index",
        "variable": "NDVI_EVI",
        "description": "Normalized Difference Vegetation Index (NDVI) and Enhanced Vegetation Index (EVI) from MODIS.",
        "primary_unit": "Index [-1 to +1]",
        "original_unit": "Index unitless",
        "sources": ["NASA MODIS MOD13Q1 / MYD13Q1", "LP DAAC"],
        "category": "Biospheric",
    },
    "soil_moisture": {
        "id": "soil_moisture",
        "name": "Soil Moisture",
        "variable": "SOIL_MOISTURE",
        "description": "Volumetric soil moisture explicitly distinguishing surface layer (0-10cm) from root-zone (10-100cm).",
        "primary_unit": "m³/m³",
        "original_unit": "m³/m³ (volumetric fraction)",
        "sources": ["NASA GLDAS-Noah", "NASA SMAP L3/L4"],
        "category": "Terrestrial",
    },
    "rainfall": {
        "id": "rainfall",
        "name": "Rainfall / Precipitation",
        "variable": "PRECTOTCORR",
        "description": "Accumulated historical precipitation and monsoon dynamics from NASA GPM IMERG and NASA POWER.",
        "primary_unit": "mm",
        "original_unit": "mm (accumulated)",
        "sources": ["NASA GPM IMERG", "NASA POWER Precipitation"],
        "category": "Hydrometeorological",
    },
}

# Major Karnataka Reservoirs monitored
KARNATAKA_RESERVOIRS = [
    {"name": "Krishna Raja Sagara (KRS)", "district": "Mandya", "river": "Cauvery", "lat": 12.5367, "lon": 76.5744, "fRL_m": 38.04, "gross_cap_tmc": 49.45},
    {"name": "Tungabhadra", "district": "Ballari / Vijayanagara", "river": "Tungabhadra", "lat": 15.2636, "lon": 76.3358, "fRL_m": 497.74, "gross_cap_tmc": 133.0},
    {"name": "Almatti (Upper Krishna)", "district": "Vijayapura", "river": "Krishna", "lat": 16.3314, "lon": 75.8883, "fRL_m": 519.60, "gross_cap_tmc": 123.08},
    {"name": "Linganamakki", "district": "Shivamogga", "river": "Sharavathi", "lat": 14.1953, "lon": 74.8347, "fRL_m": 554.43, "gross_cap_tmc": 151.75},
    {"name": "Bhadra", "district": "Chikkamagaluru", "river": "Bhadra", "lat": 13.7025, "lon": 75.6417, "fRL_m": 657.76, "gross_cap_tmc": 71.50},
    {"name": "Ghataprabha (Hidkal)", "district": "Belagavi", "river": "Ghataprabha", "lat": 16.1558, "lon": 74.6364, "fRL_m": 662.94, "gross_cap_tmc": 51.00},
    {"name": "Malaprabha (Renukasagar)", "district": "Belagavi", "river": "Malaprabha", "lat": 15.8208, "lon": 75.1111, "fRL_m": 633.83, "gross_cap_tmc": 37.73},
    {"name": "Kabini", "district": "Mysuru", "river": "Kabini", "lat": 11.9744, "lon": 76.3533, "fRL_m": 696.16, "gross_cap_tmc": 19.52},
    {"name": "Hemavathi (Gorur)", "district": "Hassan", "river": "Hemavathi", "lat": 12.7833, "lon": 76.0500, "fRL_m": 890.58, "gross_cap_tmc": 37.10},
    {"name": "Supa (Kali)", "district": "Uttara Kannada", "river": "Kali", "lat": 15.2789, "lon": 74.5317, "fRL_m": 564.00, "gross_cap_tmc": 147.54},
]

# Karnataka Agro-Climatic Zones
AGRO_CLIMATIC_ZONES = [
    {
        "id": "coastal",
        "name": "Coastal Zone",
        "description": "High rainfall maritime strip with warm humid climate along the Arabian Sea.",
        "districts": ["Dakshina Kannada", "Udupi", "Uttara Kannada"],
        "rep_coords": {"lat": 13.5, "lon": 74.75},
    },
    {
        "id": "malnad",
        "name": "Hilly / Malnad Zone",
        "description": "Dense Western Ghats rainforest corridor with peak orographic rainfall.",
        "districts": ["Shivamogga", "Chikkamagaluru", "Kodagu", "Hassan"],
        "rep_coords": {"lat": 13.9, "lon": 75.5},
    },
    {
        "id": "northern_dry",
        "name": "Northern Dry Zone",
        "description": "Arid black soil plains prone to high summer temperatures and moisture deficits.",
        "districts": ["Vijayapura", "Bagalkote", "Gadag", "Koppal", "Raichur", "Ballari", "Vijayanagara"],
        "rep_coords": {"lat": 15.8, "lon": 76.2},
    },
    {
        "id": "northern_transition",
        "name": "Northern Transition Zone",
        "description": "Transition zone between Western Ghats foothills and semi-arid plains.",
        "districts": ["Belagavi", "Dharwad", "Haveri"],
        "rep_coords": {"lat": 15.45, "lon": 75.0},
    },
    {
        "id": "north_eastern_dry",
        "name": "North Eastern Dry Zone",
        "description": "Extreme northern Deccan plateau with high thermal variance and low rainfall.",
        "districts": ["Kalaburagi", "Yadgir", "Bidar"],
        "rep_coords": {"lat": 17.33, "lon": 76.83},
    },
    {
        "id": "central_dry",
        "name": "Central Dry Zone",
        "description": "Low rainfall central plains characterized by red and mixed soils.",
        "districts": ["Chitradurga", "Davanagere", "Tumakuru"],
        "rep_coords": {"lat": 14.22, "lon": 76.4},
    },
    {
        "id": "eastern_dry",
        "name": "Eastern Dry Zone",
        "description": "Urbanized high-plateau southern plains including Bengaluru metropolitan area.",
        "districts": ["Bengaluru Urban", "Bengaluru Rural", "Kolar", "Chikkaballapura", "Ramanagara"],
        "rep_coords": {"lat": 12.97, "lon": 77.59},
    },
    {
        "id": "southern_dry",
        "name": "Southern Dry Zone",
        "description": "Cauvery basin southern agricultural plains with moderate rainfall.",
        "districts": ["Mysuru", "Mandya", "Chamarajanagar"],
        "rep_coords": {"lat": 12.3, "lon": 76.65},
    },
]
