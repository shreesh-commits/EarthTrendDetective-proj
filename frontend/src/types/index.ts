export interface PlatformStats {
  platform_name: string;
  focus_region: string;
  geographical_area_sq_km: number;
  total_parameters_monitored: number;
  total_historical_observations: number;
  historical_period_start: number;
  historical_period_end: number;
  total_months_synchronized: number;
  agro_climatic_zones_count: number;
  major_reservoirs_monitored: number;
  quality_audited_records_pct: number;
}

export interface KeyFinding {
  id: string;
  parameter: string;
  finding: string;
  metric: string;
  details: string;
  significance: string;
  trend: 'increasing' | 'decreasing' | 'variable' | 'cyclical' | 'mixed';
}

export interface ParameterConfig {
  id: string;
  name: string;
  variable: string;
  description: string;
  primary_unit: string;
  original_unit: string;
  sources: string[];
  category: string;
}

export interface MannKendallResult {
  trend: string;
  is_significant: boolean;
  p_value: number;
  z_statistic: number;
  tau: number;
  s_statistic: number;
  var_s: number;
  n_samples: number;
  confidence_level: string;
}

export interface SensSlopeResult {
  sen_slope: number;
  intercept: number;
  direction: string;
  unit_per_year: number;
  unit_per_decade: number;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r_squared: number;
  p_value: number;
  std_err: number;
  trend_direction: string;
  rate_per_decade: number;
}

export interface SeasonalSummary {
  season_name: string;
  mean_value: number;
  std_dev: number;
  min_value: number;
  max_value: number;
  trend_summary: string;
  mann_kendall: MannKendallResult;
  sens_slope: SensSlopeResult;
  linear_regression: LinearRegressionResult;
}

export interface ParameterSummary {
  parameter_id: string;
  config: ParameterConfig;
  total_observations: number;
  historical_period: string;
  baseline_mean: number;
  baseline_std: number;
  min_recorded: number;
  max_recorded: number;
  mann_kendall: MannKendallResult;
  sens_slope: SensSlopeResult;
  linear_regression: LinearRegressionResult;
  seasonal_breakdown: Record<string, SeasonalSummary>;
  total_anomalies_detected: number;
}

export interface TimeSeriesRecord {
  date: string;
  year: number;
  month: number;
  season?: string;
  location?: string;
  district?: string;
  zone?: string;
  [key: string]: any;
}

export interface MonitoringPoint {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  district: string;
  zone: string;
  parameter: string;
  value: number;
  unit: string;
  trend: string;
  source: string;
}

export interface AnomalyRecord {
  date: string;
  year: number;
  month: number;
  parameter_id: string;
  parameter_name: string;
  location: string;
  district: string;
  observed_value: number;
  climatological_normal: number;
  anomaly_magnitude: number;
  z_score: number;
  unit: string;
  severity: string;
  explanation: string;
}

export interface CrossInsight {
  pair_id: string;
  name: string;
  param_x: string;
  param_y: string;
  expected_relationship: string;
  lag_months: number;
  statistics: {
    param_x: string;
    param_y: string;
    lag_months: number;
    n_samples: number;
    pearson_r: number;
    pearson_p_value: number;
    pearson_significant: boolean;
    spearman_rho: number;
    spearman_p_value: number;
    spearman_significant: boolean;
    ols_slope: number;
    ols_intercept: number;
    ols_r_squared: number;
    scatter_points: { date: string; x: number; y: number }[];
    scientific_interpretation: string;
  };
}

export interface DataSourceMeta {
  source_id: string;
  dataset_name: string;
  parameter_id: string;
  organization: string;
  source_url: string;
  doi: string;
  available_date_range: string;
  temporal_resolution: string;
  spatial_resolution: string;
  primary_variable: string;
  original_unit: string;
  status: string;
  notes: string;
  last_retrieved: string;
}
