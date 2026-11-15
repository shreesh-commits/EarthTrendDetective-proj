# 🛰️ Earth Observation Data Sources & Registry

This document details the authoritative environmental datasets integrated into **EarthTrend Detective**, their physical variables, spatial/temporal resolutions, units, and access links.

---

## 1. Parameter 1: Air Temperature
* **Dataset Name**: NASA POWER MERRA-2 2-Metre Air Temperature
* **Provider**: NASA Langley Research Center (LaRC) / Goddard Space Flight Center (GSFC)
* **Primary Variable**: `T2M` (2-metre air temperature above ground level)
* **Original Unit**: °C
* **Spatial Resolution**: 0.5° × 0.625° latitude/longitude
* **Temporal Coverage**: 2000-01 to 2024-12 (Monthly & Daily)
* **API Endpoint**: `https://power.larc.nasa.gov/api/temporal/monthly/point`
* **DOI**: [https://doi.org/10.5067/POWER/0001](https://doi.org/10.5067/POWER/0001)
* **Geographical Coverage**: Multi-station grid across Karnataka agro-climatic zones (Bengaluru, Mysuru, Mangalore, Shivamogga, Belagavi, Kalaburagi, Ballari, Chitradurga).

---

## 2. Parameter 2: Water Temperature
* **Datasets Integrated**:
  1. **Coastal Marine SST**: NOAA High-resolution Optimum Interpolation Sea Surface Temperature (OISST v2.1) & MODIS Aqua SST.
  2. **Inland Freshwater LSWT**: MODIS Terra/Aqua MOD11A2 Lake Surface Water Temperature over reservoir centroids.
* **Primary Variables**: `SST_COASTAL` (Arabian Sea) and `LSWT_INLAND` (Freshwater Reservoirs)
* **Original Unit**: °C
* **Spatial Scope**:
  - Coastal: Arabian Sea strip off Karwar (14.8°N), Mangalore (12.8°N), and Udupi (13.3°N).
  - Inland: KRS, Tungabhadra, Almatti, and Linganamakki reservoirs.
* **Strict Rule**: Arabian Sea temperatures are never presented as inland reservoir temperatures.

---

## 3. Parameter 3: Water Level & Reservoir Storage
* **Dataset Name**: Central Water Commission (CWC) National Water Informatics Centre (NWIC) & KWRIS Historical Telemetry
* **Provider**: Ministry of Jal Shakti, Government of India
* **Primary Variables**: Monitored Water Level (`m MSL`), Live Storage (`TMCft` / `MCM`), and `% Full Reservoir Capacity`
* **Original Units**: Metres above Mean Sea Level (m MSL) and percentage (%)
* **Temporal Coverage**: 2000-01 to 2024-12 (Weekly bulletins aggregated to Monthly)
* **Monitored Reservoirs**:
  1. Krishna Raja Sagara (KRS) - Cauvery Basin
  2. Tungabhadra - Krishna Basin
  3. Almatti (Upper Krishna) - Krishna Basin
  4. Linganamakki - Sharavathi Basin
  5. Bhadra - Krishna Basin
  6. Ghataprabha (Hidkal) - Krishna Basin
  7. Malaprabha (Renukasagar) - Krishna Basin
  8. Kabini - Cauvery Basin
  9. Hemavathi (Gorur) - Cauvery Basin
  10. Supa (Kali) - West Flowing Basin

---

## 4. Parameter 4: Vegetation Indices
* **Dataset Name**: NASA MODIS MOD13Q1 / MYD13Q1 Vegetation Indices (NDVI & EVI)
* **Provider**: NASA Land Processes Distributed Active Archive Center (LP DAAC)
* **Primary Variables**:
  - **NDVI** (Normalized Difference Vegetation Index): $\frac{\rho_{NIR} - \rho_{Red}}{\rho_{NIR} + \rho_{Red}}$
  - **EVI** (Enhanced Vegetation Index): $2.5 \times \frac{\rho_{NIR} - \rho_{Red}}{\rho_{NIR} + 6\rho_{Red} - 7.5\rho_{Blue} + 1}$
* **Original Unit**: Dimensionless Index [-1.0 to +1.0]
* **Spatial Resolution**: 250 metres
* **Temporal Coverage**: 2000-02 to 2024-12 (16-day composites aggregated to monthly)
* **Significance**: Monitors photosynthetic biomass greenness across Western Ghats rainforests, dry agro-zones, and urban fringe.

---

## 5. Parameter 5: Soil Moisture
* **Dataset Name**: NASA GLDAS Noah Land Surface Model (LSM) & NASA SMAP L3/L4
* **Provider**: NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)
* **Primary Variables**:
  - **Surface Soil Moisture**: 0–10 cm depth layer ($m^3/m^3$)
  - **Root-Zone Soil Moisture**: 10–100 cm depth layer ($m^3/m^3$)
* **Original Unit**: Volumetric fraction ($m^3/m^3$)
* **Spatial Resolution**: 0.25° × 0.25°
* **Temporal Coverage**: 2000-01 to 2024-12
* **Physical Distinction**: Surface soil moisture responds to rapid solar drying; root-zone moisture preserves hydrological memory and crop resilience.

---

## 6. Parameter 6: Rainfall / Precipitation
* **Dataset Name**: NASA GPM IMERG & NASA POWER Precipitation (`PRECTOTCORR`)
* **Provider**: NASA Goddard Space Flight Center (GSFC) / LaRC
* **Primary Variable**: Accumulated monthly precipitation (mm)
* **Original Unit**: mm/day (Daily rate), converted to accumulated monthly sum ($\text{mm/day} \times \text{days in month}$)
* **Temporal Coverage**: 2000-01 to 2024-12
* **Spatial Resolution**: 0.5° × 0.5°
* **Scientific Aggregation Rule**: Monthly precipitation is computed strictly as the cumulative sum of precipitation, never as a simple unweighted daily average.
