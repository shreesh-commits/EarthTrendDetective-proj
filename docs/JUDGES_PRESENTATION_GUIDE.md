# 🏆 NASA Hackathon Judges & Presentation Guide

## 1. 30-Second Elevator Pitch

> *"Judges, environmental change is often obscured by short-term weather noise. We built **EarthTrend Detective** — a scientifically credible, historical environmental intelligence platform for Karnataka, India. Instead of building speculative future forecasts, we focused on 25 years (2000–2024) of verified NASA Earth observations across six core pillars: air temperature, water temperature, reservoir water levels, MODIS vegetation, GLDAS soil moisture, and GPM precipitation. Using non-parametric Mann-Kendall trend tests and Sen's slope estimators, we answer not just WHAT changed, but WHERE, HOW MUCH, HOW FAST, and whether the change is STATISTICALLY SIGNIFICANT."*

---

## 2. 3-Minute Live Demo Script

### Step 1: The Landing Page & Core Questions (0:00 - 0:45)
* Open [`http://localhost:8000`](http://localhost:8000).
* Show the six fundamental scientific questions: *What, Where, How much, How fast, Is it significant, How are parameters related?*
* Highlight the scientific credibility guarantee: Official Survey of India boundary clipping, zero data fabrication, and physical separation of coastal Arabian Sea SST from inland freshwater reservoirs.

### Step 2: The Main Dashboard & 25-Year Trajectories (0:45 - 1:30)
* Navigate to the **Main Dashboard**.
* Point out the verified platform KPIs: **12,600+ observations**, **300 synchronized months**, **8 agro-climatic zones**, **10 major dams**, and **100% quality audit score**.
* Showcase the synchronized 25-year multi-variable trendline and the six key findings cards.

### Step 3: Interactive Karnataka Geospatial Map (1:30 - 2:00)
* Navigate to **Karnataka Map**.
* Toggle between **Air Temperature**, **Water Level (Reservoirs)**, and **Vegetation (NDVI)**.
* Click on a reservoir marker (e.g., *Krishna Raja Sagara (KRS)* or *Almatti Dam*) and show the real-time inspection card displaying coordinates, district boundary, live storage, and data source.

### Step 4: Six-Parameter Deep Dive & Statistical Proof (2:00 - 2:30)
* Navigate to **6 Parameters** and select **Air Temperature**.
* Show the Mann-Kendall trend test result ($p < 0.001$), Sen's median slope ($+0.184^\circ\text{C}$ per decade), and the seasonal breakdown across Pre-Monsoon, Southwest Monsoon, Post-Monsoon, and Winter.
* Switch to **Vegetation** and explain how MODIS NDVI and EVI capture both greening in canal-irrigated zones and canopy loss in peri-urban corridors.

### Step 5: Cross-Parameter Relationships & Data Explorer (2:30 - 3:00)
* Navigate to **Comparison**.
* Show the **Bivariate Lag Correlation Explorer** and demonstrate the 1-month hydrological lag between monsoon rainfall and reservoir storage crest.
* Navigate to **Data Explorer** and click **Download CSV** to demonstrate complete transparency and data reproducibility.

---

## 3. Anticipated Judge Questions & Strong Scientific Answers

### Q1: *"Why did you not build a machine learning model to predict the future?"*
**Answer**:
> *"That was a deliberate scientific decision. Climate and environmental policy requires rigorous historical observation to establish true baseline shifts. Predictive machine learning models without decade-long ground-truth validation introduce compounding errors and 'hallucinated' predictions. We focused our compute on non-parametric trend detection (Mann-Kendall) and Theil-Sen robust estimators, which are the World Meteorological Organization's standard for establishing historical significance."*

### Q2: *"How do you handle ocean temperatures vs inland river and lake temperatures?"*
**Answer**:
> *"We strictly segregated them in both data ingestion and UI presentation. Coastal Sea Surface Temperature (SST) uses NOAA OISST v2.1 off the Karnataka coast (12.5°N–15°N), capturing Arabian Sea upwelling cooling in July-August. Inland lake surface water temperature (LSWT) uses MODIS 1km observations and telemetry directly over reservoir centroids like KRS and Almatti, capturing distinct continental heat storage."*

### Q3: *"How did you calculate monthly rainfall?"*
**Answer**:
> *"We strictly followed physical meteorological aggregation rules. NASA POWER precipitation is provided in mm/day. Rather than averaging daily rates, our pipeline calculates monthly accumulated precipitation by multiplying the daily mean rate by the exact number of days in that specific calendar month, properly accounting for leap years."*
