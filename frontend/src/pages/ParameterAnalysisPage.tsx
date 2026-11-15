import React, { useEffect, useState } from 'react';
import {
  Thermometer,
  Waves,
  Droplets,
  Trees,
  Layers,
  CloudRain,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

import { api } from '../services/api';
import { ParameterSummary } from '../types';
import { TrendBadge } from '../components/TrendBadge';

export const ParameterAnalysisPage: React.FC = () => {
  const [activeParam, setActiveParam] = useState<string>('air_temperature');
  const [summary, setSummary] = useState<ParameterSummary | null>(null);
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const parameterTabs = [
    { id: 'air_temperature', label: 'Air Temperature', icon: Thermometer, variable: 'T2M', color: '#C06C54' },
    { id: 'water_temperature', label: 'Water Temperature', icon: Waves, variable: 'SST / LSWT', color: '#5A8F8E' },
    { id: 'water_level', label: 'Water Level', icon: Droplets, variable: 'CWC Reservoirs', color: '#789BA6' },
    { id: 'vegetation', label: 'Vegetation', icon: Trees, variable: 'NDVI & EVI', color: '#355E3B' },
    { id: 'soil_moisture', label: 'Soil Moisture', icon: Layers, variable: 'Surface & Root-zone', color: '#8A7155' },
    { id: 'rainfall', label: 'Rainfall', icon: CloudRain, variable: 'Accumulated mm', color: '#658296' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumRes, annRes] = await Promise.all([
          api.getParameterSummary(activeParam),
          api.getParameterAnnual(activeParam)
        ]);
        setSummary(sumRes);
        setAnnualData(annRes.records || []);
      } catch (err) {
        console.error('Failed to load parameter deep dive:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeParam]);

  const seasonalList = summary?.seasonal_breakdown
    ? Object.keys(summary.seasonal_breakdown).map((k) => summary.seasonal_breakdown[k])
    : [];

  const currentTab = parameterTabs.find((p) => p.id === activeParam) || parameterTabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif">
          Six Core Environmental Parameters Deep-Dive
        </h1>
        <p className="text-sm text-[#6B7367] mt-1">
          Detailed historical observation time series, statistical tests, seasonal breakdowns, and anomalies.
        </p>
      </div>

      {/* Parameter Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#FAF8F2] p-2 rounded-2xl border border-[#E2DAC9]">
        {parameterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeParam === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveParam(tab.id)}
              className={`flex flex-col items-start p-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-[#355E3B] text-[#F7F5ED] shadow-sm'
                  : 'text-[#6B7367] hover:text-[#343A32] hover:bg-[#EFECE1]'
              }`}
            >
              <div className="flex items-center space-x-2 w-full justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F7F5ED]' : 'text-[#8A7155]'}`} />
                <span className={`text-[10px] uppercase font-medium ${isActive ? 'text-[#DDE5D0]' : 'text-[#8A7155]'}`}>
                  {tab.variable}
                </span>
              </div>
              <span className="text-xs font-semibold mt-2">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
        </div>
      ) : summary ? (
        <div className="space-y-8">
          {/* Parameter Meta Header Card */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#EDE7D9] gap-4">
              <div>
                <span className="text-xs uppercase text-[#355E3B] tracking-wider font-semibold">
                  {summary.config.category} Environmental Indicator
                </span>
                <h2 className="text-2xl font-bold text-[#343A32] font-serif mt-1">
                  {summary.config.name} ({summary.config.variable})
                </h2>
                <p className="text-xs text-[#6B7367] mt-2 max-w-3xl leading-relaxed">
                  {summary.config.description}
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end space-y-1 text-xs">
                <div className="text-[#6B7367]">
                  Primary Unit: <span className="text-[#355E3B] font-bold">{summary.config.primary_unit}</span>
                </div>
                <div className="text-[#6B7367]">
                  Sources: <span className="text-[#343A32] font-medium">{summary.config.sources.join(', ')}</span>
                </div>
                <div className="text-[#6B7367]">
                  Historical Records: <span className="text-[#343A32] font-bold">{summary.total_observations.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Scientific Clarification Banners */}
            {activeParam === 'water_temperature' && (
              <div className="mt-4 p-3.5 bg-[#EBF5F5] border border-[#BFDFDB] rounded-xl text-xs text-[#285953] flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-[#346F68] mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">Scientific Segregation: </strong>
                  Arabian Sea Coastal Sea Surface Temperature (NOAA OISST v2.1 off Karwar/Mangalore) is strictly separated from Karnataka's Inland Freshwater Reservoirs (MODIS LSWT). They are never conflated.
                </div>
              </div>
            )}

            {activeParam === 'soil_moisture' && (
              <div className="mt-4 p-3.5 bg-[#F4ECE3] border border-[#DFCBB9] rounded-xl text-xs text-[#5C4532] flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-[#8A7155] mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">Physical Layer Distinction: </strong>
                  Surface Soil Moisture (0–10 cm) tracks rapid atmospheric solar drying and immediate rainfall recharge. Root-Zone Soil Moisture (10–100 cm) governs deep agricultural resilience and groundwater recharge.
                </div>
              </div>
            )}

            {activeParam === 'rainfall' && (
              <div className="mt-4 p-3.5 bg-[#EBF2F6] border border-[#C6D8E4] rounded-xl text-xs text-[#345266] flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-[#4B738C] mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">Scientifically Grounded Aggregation: </strong>
                  Monthly precipitation is calculated as total accumulated rainfall (daily rate × days in month in mm), rather than improperly averaging daily rates.
                </div>
              </div>
            )}

            {activeParam === 'vegetation' && (
              <div className="mt-4 p-3.5 bg-[#DDE5D0] border border-[#B8C4A4] rounded-xl text-xs text-[#29492E] flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-[#355E3B] mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">NDVI & EVI Formulations: </strong>
                  NDVI = (NIR - Red) / (NIR + Red). EVI incorporates blue reflectance to decouple atmospheric aerosols and prevents canopy saturation in dense Western Ghats rainforests.
                </div>
              </div>
            )}
          </div>

          {/* Statistical Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Mann-Kendall Trend</span>
              <div className="mt-2">
                <TrendBadge
                  trend={summary.mann_kendall.trend}
                  isSignificant={summary.mann_kendall.is_significant}
                  pValue={summary.mann_kendall.p_value}
                />
              </div>
              <p className="text-[10px] text-[#6B7367] mt-2">Z = {summary.mann_kendall.z_statistic}</p>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Sen's Median Rate</span>
              <p className="text-lg font-bold text-[#355E3B] font-serif mt-1">
                {summary.sens_slope.unit_per_decade > 0 ? '+' : ''}
                {summary.sens_slope.unit_per_decade}
              </p>
              <p className="text-[10px] text-[#6B7367] mt-1">Per Decade ({summary.config.primary_unit})</p>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Linear Fit (R²)</span>
              <p className="text-lg font-bold text-[#343A32] font-serif mt-1">{summary.linear_regression.r_squared}</p>
              <p className="text-[10px] text-[#6B7367] mt-1">OLS p={summary.linear_regression.p_value}</p>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Climatological Mean</span>
              <p className="text-lg font-bold text-[#343A32] font-serif mt-1">{summary.baseline_mean} {summary.config.primary_unit}</p>
              <p className="text-[10px] text-[#6B7367] mt-1">±{summary.baseline_std} σ</p>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Historical Range</span>
              <p className="text-sm font-bold text-[#343A32] font-serif mt-1">
                {summary.min_recorded} to {summary.max_recorded}
              </p>
              <p className="text-[10px] text-[#6B7367] mt-1">Min to Max observed</p>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-[#8A7155] uppercase font-semibold">Flagged Anomalies</span>
              <p className="text-lg font-bold text-[#C06C54] font-serif mt-1">{summary.total_anomalies_detected}</p>
              <p className="text-[10px] text-[#6B7367] mt-1">|Z| ≥ 1.645 Outliers</p>
            </div>
          </div>

          {/* 25-Year Annual Trendline Chart (Actual vs Fitted) */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-[#EDE7D9]">
              <div>
                <h3 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#355E3B]" />
                  <span>25-Year Historical Trajectory & OLS Regression Trendline</span>
                </h3>
                <p className="text-xs text-[#6B7367] mt-0.5">
                  Annual mean observations with fitted linear rate of change.
                </p>
              </div>
              <span className="text-xs text-[#355E3B] font-semibold bg-[#DDE5D0] px-3 py-1 rounded-full border border-[#B8C4A4]">
                Rate: {summary.linear_regression.rate_per_decade > 0 ? '+' : ''}{summary.linear_regression.rate_per_decade} {summary.config.primary_unit}/decade
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={annualData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DEC9" opacity={0.8} />
                  <XAxis dataKey="year" stroke="#8A7155" tick={{ fill: '#6B7367', fontSize: 11 }} />
                  <YAxis stroke="#8A7155" tick={{ fill: '#6B7367', fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FCFAF5',
                      borderColor: '#D5CDBE',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#343A32',
                      boxShadow: '0 4px 16px rgba(52, 58, 50, 0.08)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="actual_value"
                    name={`Observed Mean (${summary.config.primary_unit})`}
                    stroke={currentTab.color}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: currentTab.color }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trendline_value"
                    name="Linear Trendline Fit"
                    stroke="#526B43"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Seasonal Analysis Breakdown */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2 mb-4 pb-3 border-b border-[#EDE7D9]">
              <BarChart2 className="w-4 h-4 text-[#355E3B]" />
              <span>Seasonal Variations & Sub-Annual Mann-Kendall Trend Results</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {seasonalList.map((s) => (
                <div key={s.season_name} className="p-4 rounded-xl bg-[#F4EFE6] border border-[#DDD6C5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#343A32] text-sm font-serif">{s.season_name}</span>
                    <span className="text-xs font-semibold text-[#355E3B]">{s.mean_value} {summary.config.primary_unit}</span>
                  </div>
                  <div className="text-[11px] text-[#6B7367]">
                    Range: {s.min_value} – {s.max_value} {summary.config.primary_unit} (σ = {s.std_dev})
                  </div>
                  <div className="pt-2 border-t border-[#E0D8C8]">
                    <TrendBadge
                      trend={s.mann_kendall.trend}
                      isSignificant={s.mann_kendall.is_significant}
                      pValue={s.mann_kendall.p_value}
                      rate={`${s.sens_slope.unit_per_decade > 0 ? '+' : ''}${s.sens_slope.unit_per_decade}/dec`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
