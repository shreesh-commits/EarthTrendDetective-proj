import axios from 'axios';
import {
  PlatformStats,
  KeyFinding,
  ParameterConfig,
  ParameterSummary,
  TimeSeriesRecord,
  MonitoringPoint,
  AnomalyRecord,
  CrossInsight,
  DataSourceMeta
} from '../types';

const API_BASE = '/api';

export const api = {
  // 1. Overview
  getStats: async (): Promise<PlatformStats> => {
    const res = await axios.get(`${API_BASE}/overview/stats`);
    return res.data;
  },

  getKeyFindings: async (): Promise<KeyFinding[]> => {
    const res = await axios.get(`${API_BASE}/overview/key-findings`);
    return res.data.findings;
  },

  // 2. Parameters
  getParameters: async (): Promise<ParameterConfig[]> => {
    const res = await axios.get(`${API_BASE}/parameters/list`);
    return res.data;
  },

  getParameterSummary: async (paramId: string): Promise<ParameterSummary> => {
    const res = await axios.get(`${API_BASE}/parameters/${paramId}/summary`);
    return res.data;
  },

  getParameterTimeSeries: async (
    paramId: string,
    params?: { location?: string; zone?: string; start_year?: number; end_year?: number }
  ): Promise<{ parameter_id: string; value_column: string; count: number; records: TimeSeriesRecord[] }> => {
    const res = await axios.get(`${API_BASE}/parameters/${paramId}/timeseries`, { params });
    return res.data;
  },

  getParameterAnnual: async (paramId: string) => {
    const res = await axios.get(`${API_BASE}/parameters/${paramId}/annual`);
    return res.data;
  },

  // 3. Map
  getMonitoringPoints: async (parameter: string): Promise<MonitoringPoint[]> => {
    const res = await axios.get(`${API_BASE}/map/monitoring-points`, { params: { parameter } });
    return res.data.points;
  },

  getStateBoundary: async () => {
    const res = await axios.get(`${API_BASE}/map/state-boundary`);
    return res.data;
  },

  getDistrictsBoundary: async () => {
    const res = await axios.get(`${API_BASE}/map/districts-boundary`);
    return res.data;
  },

  // 4. Statistics & Trends
  getAllTrends: async () => {
    const res = await axios.get(`${API_BASE}/statistics/all-trends`);
    return res.data.trends;
  },

  getAnomalies: async (params?: { parameter_id?: string; min_z_score?: number; limit?: number }): Promise<AnomalyRecord[]> => {
    const res = await axios.get(`${API_BASE}/statistics/anomalies`, { params });
    return res.data.anomalies;
  },

  getPeriodComparison: async (p1_start = 2000, p1_end = 2011, p2_start = 2012, p2_end = 2024) => {
    const res = await axios.get(`${API_BASE}/statistics/period-comparison`, {
      params: { p1_start, p1_end, p2_start, p2_end }
    });
    return res.data;
  },

  // 5. Cross-Parameter
  getCorrelationMatrix: async () => {
    const res = await axios.get(`${API_BASE}/cross/correlation-matrix`);
    return res.data;
  },

  getCuratedInsights: async (): Promise<CrossInsight[]> => {
    const res = await axios.get(`${API_BASE}/cross/curated-insights`);
    return res.data.insights;
  },

  getBivariateAnalysis: async (param_x: string, param_y: string, lag = 0) => {
    const res = await axios.get(`${API_BASE}/cross/bivariate`, {
      params: { param_x, param_y, lag }
    });
    return res.data;
  },

  // 6. Data Explorer
  getExplorerRecords: async (params: {
    parameter_id: string;
    year_min?: number;
    year_max?: number;
    location?: string;
    season?: string;
    page?: number;
    page_size?: number;
  }) => {
    const res = await axios.get(`${API_BASE}/explorer/records`, { params });
    return res.data;
  },

  // 7. Sources & Methodology
  getDataSources: async (): Promise<DataSourceMeta[]> => {
    const res = await axios.get(`${API_BASE}/sources/registry`);
    return res.data.sources;
  },

  getQualityAudits: async () => {
    const res = await axios.get(`${API_BASE}/sources/quality-audit`);
    return res.data.audits;
  },

  getMethodology: async () => {
    const res = await axios.get(`${API_BASE}/sources/methodology`);
    return res.data;
  }
};
