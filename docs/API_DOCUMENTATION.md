# 🔌 EarthTrend Detective REST API Documentation

Base URL: `http://localhost:8000/api`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc UI: `http://localhost:8000/redoc`

---

## 1. Overview Endpoints

### `GET /overview/stats`
Returns platform KPIs computed dynamically from the processed datasets.
```json
{
  "platform_name": "EarthTrend Detective",
  "focus_region": "Karnataka, India",
  "total_parameters_monitored": 6,
  "total_historical_observations": 12600,
  "historical_period_start": 2000,
  "historical_period_end": 2024,
  "major_reservoirs_monitored": 10,
  "quality_audited_records_pct": 100.0
}
```

### `GET /overview/key-findings`
Returns high-level scientific findings with supporting statistical significance indicators.

---

## 2. Parameter Deep-Dive Endpoints

### `GET /parameters/list`
Lists all 6 environmental parameters with their metadata, units, and original sources.

### `GET /parameters/{param_id}/summary`
* **Path Parameters**: `param_id` (`air_temperature`, `rainfall`, `water_temperature`, `water_level`, `vegetation`, `soil_moisture`)
* **Response**: Baseline mean, min/max, Mann-Kendall result, Sen's slope, linear regression $R^2$, and seasonal breakdown.

### `GET /parameters/{param_id}/timeseries`
* **Query Parameters**:
  - `start_year` (default: 2000)
  - `end_year` (default: 2024)
  - `location` (optional filter)
  - `zone` (optional filter)
* **Response**: Monthly time-series records formatted for graphing.

### `GET /parameters/{param_id}/annual`
Returns 25-year annual aggregated time-series with fitted OLS linear regression values.

---

## 3. Geospatial Map Endpoints

### `GET /map/state-boundary`
Returns official Survey of India Karnataka state boundary GeoJSON.

### `GET /map/districts-boundary`
Returns official Karnataka 30 districts GeoJSON.

### `GET /map/monitoring-points`
* **Query Parameters**: `parameter` (default: `air_temperature`)
* **Response**: Environmental stations, reservoir dams, coastal points, and zone centroids with coordinates and latest values.

---

## 4. Statistics Endpoints

### `GET /statistics/all-trends`
Returns comparative side-by-side Mann-Kendall, Sen's slope, and OLS regression results for all 6 parameters.

### `GET /statistics/anomalies`
* **Query Parameters**:
  - `parameter_id` (optional)
  - `min_z_score` (default: 1.645)
  - `limit` (default: 60)
* **Response**: Ranked list of historical environmental departures from 2000–2020 climatological normal.

### `GET /statistics/period-comparison`
* **Query Parameters**: `p1_start`, `p1_end`, `p2_start`, `p2_end`
* **Response**: Absolute shift and percentage change between Era 1 and Era 2.

---

## 5. Cross-Parameter Analysis Endpoints

### `GET /cross/correlation-matrix`
Returns full 7×7 Pearson and Spearman correlation matrices across parameters.

### `GET /cross/curated-insights`
Returns curated physical coupling hypotheses (rainfall-soil, rainfall-vegetation lag, etc.).

### `GET /cross/bivariate`
* **Query Parameters**: `param_x`, `param_y`, `lag` (months: 0-6)
* **Response**: Live Pearson $r$, Spearman $\rho$, OLS slope, $R^2$, and scatter plot observations.

---

## 6. Data Explorer Endpoints

### `GET /explorer/records`
Paginated observation records with multi-dimensional filtering (`parameter_id`, `year_min`, `year_max`, `season`, `location`, `page`, `page_size`).

### `GET /explorer/download-csv`
* **Query Parameters**: `parameter_id`
* **Response**: Streams direct downloadable CSV file.
