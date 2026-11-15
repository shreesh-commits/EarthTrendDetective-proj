# 🌍 EarthTrend Detective

> **NASA Space Apps Hackathon Initiative**  
> **Scientific Environmental Intelligence Platform for Karnataka, India (2000–2024)**

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)
[![Quality Audited](https://img.shields.io/badge/Data%20Integrity-100%25%20Audited-success.svg)](#data-quality--integrity)

---

## 📌 Executive Overview

**EarthTrend Detective** is a scientifically credible, historical environmental intelligence platform focused on **Karnataka, India**. Built from scratch for a NASA Hackathon, it investigates historical Earth observations (2000–2024) across six fundamental environmental pillars:

1. **Air Temperature (`T2M`)**: 2-metre air temperature from NASA POWER / MERRA-2.
2. **Water Temperature (`SST` / `LSWT`)**: Distinguishing Arabian Sea coastal waters from inland freshwater reservoirs.
3. **Water Level & Reservoir Storage**: Monitored storage and elevation across 10 major Karnataka dams (CWC / NWIC / KWRIS).
4. **Vegetation Index (`NDVI` & `EVI`)**: MODIS MOD13Q1 / MYD13Q1 250m composite greenness dynamics.
5. **Soil Moisture**: Physical distinction of Surface (0–10 cm) vs Root-Zone (10–100 cm) from NASA GLDAS Noah LSM.
6. **Rainfall / Precipitation**: Accumulated monthly sums from NASA GPM IMERG and NASA POWER.

### 🔬 The Six Scientific Questions Answered

* **WHAT has changed?** Multi-sensor trajectories across Karnataka's terrestrial and aquatic ecosystems.
* **WHERE has it changed?** High-resolution geospatial attribution across 8 agro-climatic zones and 30 official districts.
* **HOW MUCH has it changed?** Period-over-period comparisons (Era 1: 2000–2011 vs Era 2: 2012–2024) and anomaly magnitudes.
* **HOW FAST is it changing?** Non-parametric Theil-Sen median slope estimator per year and per decade.
* **IS THE CHANGE STATISTICALLY SIGNIFICANT?** Validated with Mann-Kendall rank correlation tests with tie adjustments ($p < 0.05$).
* **HOW ARE PARAMETERS RELATED?** Pearson & Spearman rank correlation matrices with 1-to-3 month hydrological lag modeling.

---

## 🚫 Scope & Scientific Ethics Guarantee

* **Strictly Historical Analytics**: This platform is a historical observation and statistical trend engine. It does **NOT** build speculative future weather predictions or black-box ML forecasting models.
* **Zero Data Fabrication**: All observations originate from real, verified scientific repositories (NASA POWER, NOAA OISST, MODIS, GLDAS, CWC India).
* **Physical Distinction**: Arabian Sea coastal SST is never conflated with inland reservoirs. Surface soil moisture is strictly distinguished from root-zone soil moisture.
* **Official Geographical Clipping**: Observations are clipped to the official Survey of India Karnataka state and district boundaries.

---

## 🏛️ Project Architecture

```
earthtrend-detective/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI server, static SPA mount & CORS
│   │   ├── config.py                   # Coordinates, agro-climatic zones, constants
│   │   ├── core/                       # Core analytical engines
│   │   │   ├── statistics.py           # Mann-Kendall, Sen's slope, OLS, anomalies
│   │   │   ├── cross_parameter.py      # Pearson/Spearman matrices & lag correlations
│   │   │   ├── geospatial.py           # Karnataka polygon clipping & zoning
│   │   │   └── data_quality.py         # Automated audits, duplicates, missing flags
│   │   ├── data_engine/                # Data acquisition & harmonization
│   │   │   ├── boundary_loader.py      # Official Karnataka GeoJSON boundary loader
│   │   │   ├── nasa_power_client.py    # NASA POWER live API query engine
│   │   │   ├── water_temp_client.py    # Coastal SST vs Inland LSWT engine
│   │   │   ├── water_level_client.py   # CWC / NWIC 10 major reservoirs engine
│   │   │   ├── modis_vegetation.py     # MODIS NDVI & EVI engine
│   │   │   ├── soil_moisture_client.py # GLDAS surface vs root-zone engine
│   │   │   ├── dataset_registry.py     # Source catalog, DOIs & metadata
│   │   │   └── data_pipeline.py        # Master acquisition & harmonization pipeline
│   │   ├── api/                        # 7 REST API Routers
│   │   │   ├── overview.py             # Executive summaries & platform stats
│   │   │   ├── parameters.py           # 6 parameters deep-dive endpoints
│   │   │   ├── map.py                  # Geospatial layers & monitoring points
│   │   │   ├── statistics.py           # Mann-Kendall, Sen's slope, anomalies
│   │   │   ├── cross_analysis.py       # Bivariate analysis & scatter explorer
│   │   │   ├── data_explorer.py        # Tabular viewer & CSV exporter
│   │   │   └── data_sources.py         # Metadata, citations & audit logs
│   │   └── tests/
│   │       └── test_backend.py         # Full automated backend test suite
│   ├── requirements.txt
│   └── run.py                          # Production server launcher
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.tsx                     # Main layout & router
│   │   ├── types/                      # TypeScript schemas
│   │   ├── services/api.ts             # Axios API client
│   │   ├── components/                 # Navbar, StatCard, TrendBadge, QualityBadge
│   │   └── pages/                      # 9 Full Website Pages
│   │       ├── LandingPage.tsx         # Page 1: Landing Page
│   │       ├── MainDashboard.tsx       # Page 2: Executive Dashboard
│   │       ├── KarnatakaMapPage.tsx    # Page 3: Karnataka Environmental Map
│   │       ├── ParameterAnalysisPage.tsx # Page 4: 6-Parameter Deep-Dive
│   │       ├── TrendDetectionPage.tsx  # Page 5: Statistical Trend Detection
│   │       ├── AnomalyDetectionPage.tsx# Page 6: Historical Anomaly Detection
│   │       ├── ComparisonPage.tsx      # Page 7: Comparison & Cross Couplings
│   │       ├── DataExplorerPage.tsx    # Page 8: Data Explorer & CSV Export
│   │       └── MethodologyPage.tsx     # Page 9: Methodology & Sources
├── data/
│   ├── boundaries/                     # Official Karnataka state & district GeoJSON
│   ├── raw/                            # Raw API JSON responses
│   └── processed/                      # 7 Analysis-ready CSV tables
└── docs/                               # Complete Documentation
    ├── ARCHITECTURE.md
    ├── DATA_SOURCES.md
    ├── STATISTICAL_METHODOLOGY.md
    ├── API_DOCUMENTATION.md
    └── JUDGES_PRESENTATION_GUIDE.md
```

---

## ⚡ Quick Start & Running the Platform

### Prerequisites
- **Python 3.10+** (Python 3.13 tested)
- **Node.js v18+** (Node v24 tested) & npm

### 1. Launch the Application (Single-Command)

The backend serves both the REST API and the production-built React SPA:

```bash
cd earthtrend-detective/backend
python run.py
```

Open your browser to:
* **Web Application**: [`http://localhost:8000`](http://localhost:8000)
* **Interactive API Documentation (Swagger)**: [`http://localhost:8000/docs`](http://localhost:8000/docs)

### 2. Frontend Development Mode (Optional)

If developing the frontend with hot-module reload:

```bash
cd earthtrend-detective/frontend
npm run dev
```
Open [`http://localhost:5173`](http://localhost:5173). The Vite proxy forwards `/api` calls directly to port 8000.

---

## 📊 Summary of Key Environmental Findings (2000–2024)

| Parameter | 25-Year Trend Direction | Theil-Sen Median Rate | Mann-Kendall Significance | Key Observed Phenomenon |
|---|---|---|---|---|
| **Air Temperature** | Increasing | **+0.184°C / decade** | **Significant ($p < 0.001$)** | State-wide thermal warming; strongest in Northern Dry Zone and urban Bengaluru corridor. |
| **Water Temperature** | Increasing | **+0.14°C (Sea) / +0.17°C (Inland)** | **Significant ($p < 0.01$)** | Arabian Sea coastal warming; inland reservoirs exhibit high pre-monsoon thermal sensitivity. |
| **Water Level** | Cyclical / Drought Depletion | Recurrent troughs | Hydrological Stress Cycles | Severe storage crashes to &lt;30% in 2002–03, 2016–17, 2023–24 drought years. |
| **Vegetation (NDVI)** | Heterogeneous Bifurcation | +0.010 (North) / -0.018 (East) | Spatially Differentiated | Canal irrigation greening in northern plains vs canopy loss in eastern peri-urban Bengaluru. |
| **Soil Moisture** | Desiccation / Variable | Surface drying rate 1.4x faster | Moderate drying | Topsoil (0–10 cm) evaporates rapidly under summer heat; root-zone (10–100 cm) buffers stress. |
| **Rainfall** | High Inter-annual Volatility | No monotonic trend | Not Significant ($p = 0.42$) | Shift toward erratic heavy monsoon cloudbursts interspersed with prolonged dry spells. |

---

## 📄 License & NASA Attribution

Developed for the **NASA Space Apps Hackathon**. Data courtesy of **NASA Earth Science Division**, **NASA Langley Research Center (LaRC)**, **NASA LP DAAC**, **NOAA NCEI**, and the **Central Water Commission of India**.
