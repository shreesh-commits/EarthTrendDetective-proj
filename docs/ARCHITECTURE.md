# 🏛️ EarthTrend Detective: System Architecture & Design

## 1. Architectural Philosophy

EarthTrend Detective was engineered to satisfy three uncompromising design tenets for the NASA Hackathon:
1. **Scientific Credibility over Synthetic Mockups**: Every visual graph, map point, and metric links to real, verifiable environmental observations across Karnataka, India from 2000 to 2024.
2. **Modular Micro-Architecture**: Complete separation between geospatial boundaries, data ingestion engines, statistical core computations, REST API routers, and reactive presentation components.
3. **Reproducibility & Auditability**: Clean CSV data stores, explicit data quality flags (`0: Validated Observation`), and automated mathematical verification.

---

## 2. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                            EARTH OBSERVATION SOURCES                              |
|  NASA POWER (T2M, Precip) | MODIS (NDVI, EVI, LSWT) | GLDAS (Soil) | CWC Reservoirs|
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                              DATA INGESTION ENGINE                                |
|   • nasa_power_client.py  • water_temp_client.py   • water_level_client.py        |
|   • modis_vegetation.py   • soil_moisture_client.py• dataset_registry.py          |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        GEOSPATIAL & QUALITY PIPELINE                              |
|   • boundary_loader.py (Official Survey of India Karnataka & 30 Districts GeoJSON)|
|   • geospatial.py (Shapely Point-in-Polygon Clipping & 8 Agro-Climatic Zoning)    |
|   • data_quality.py (Duplicates, Spatial Bounds, Physical Outlier Audits)         |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                         STATISTICAL ANALYSIS ENGINE                               |
|   • statistics.py (Mann-Kendall Rank Test, Sen's Slope, OLS, Climatological Z-Score)|
|   • cross_parameter.py (Pearson, Spearman, and 1-3 Month Hydrological Lag Models) |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                            FASTAPI REST BACKEND                                   |
|   /api/overview   /api/parameters   /api/map   /api/statistics   /api/cross       |
|   /api/explorer   /api/sources                                                    |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                     REACT + TYPESCRIPT + TAILWIND FRONTEND                        |
|   9 Specialized Pages: Landing, Dashboard, Map, 6-Params, Trends, Anomalies,     |
|                        Comparison, Data Explorer, Methodology & Sources           |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Tier & Provenance Strategy

1. **Boundary Files (`data/boundaries/`)**:
   - `karnataka_districts.geojson`: Official administrative boundaries for Karnataka's 30 districts.
   - `karnataka_state.geojson`: Unified boundary polygon computed via `shapely.ops.unary_union`.
2. **Processed CSV Data Store (`data/processed/`)**:
   - `air_temperature_monthly.csv`: 2,400 observations across Karnataka stations (2000–2024).
   - `rainfall_monthly.csv`: 2,400 monthly accumulated precipitation observations.
   - `water_temperature_monthly.csv`: 2,100 records strictly segregating Arabian Sea coastal SST from inland reservoirs.
   - `water_level_monthly.csv`: 3,000 monthly reservoir records for 10 major dams (CWC / NWIC).
   - `vegetation_monthly.csv`: 2,400 NDVI and EVI records across 8 agro-climatic zones.
   - `soil_moisture_monthly.csv`: 2,400 records distinguishing surface (0–10cm) from root-zone (10–100cm).
   - `karnataka_environmental_master.csv`: 300 monthly synchronized state-wide records for cross-parameter correlations.

---

## 4. Frontend Design & Component Hierarchy

- **Navbar**: Sticky header with logo, live telemetry pulse badge, and tabs for 9 pages.
- **Visual Palette**: Professional scientific dark navy (`#070b14`), space slate, NASA blue (`#0b3d91`), teal (`#00c49f`), amber, and rose accents.
- **Interactive Mapping**: React-Leaflet with CARTO Dark Matter basemap, GeoJSON district boundaries, and custom parameter pins with rich metadata popups.
- **Charts**: Recharts dual-axis time series, OLS trendlines, anomaly distribution bars, and bivariate scatter plots.
