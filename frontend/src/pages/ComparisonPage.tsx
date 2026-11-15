import React, { useEffect, useState } from 'react';
import {
  GitCompare,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { api } from '../services/api';
import { CrossInsight } from '../types';

export const ComparisonPage: React.FC = () => {
  const [insights, setInsights] = useState<CrossInsight[]>([]);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom Bivariate Explorer state
  const [paramX, setParamX] = useState<string>('rainfall_accumulated');
  const [paramY, setParamY] = useState<string>('surface_soil_moisture');
  const [lag, setLag] = useState<number>(0);
  const [customPair, setCustomPair] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState<boolean>(false);

  const parameterOptions = [
    { id: 'air_temperature', label: 'Air Temperature (°C)' },
    { id: 'rainfall_accumulated', label: 'Accumulated Rainfall (mm)' },
    { id: 'water_temperature', label: 'Water Temperature (°C)' },
    { id: 'percent_storage', label: 'Reservoir Storage (%)' },
    { id: 'ndvi', label: 'Vegetation (NDVI)' },
    { id: 'surface_soil_moisture', label: 'Surface Soil Moisture (m³/m³)' },
    { id: 'root_zone_soil_moisture', label: 'Root-Zone Soil Moisture (m³/m³)' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [insightsRes, matrixRes] = await Promise.all([
          api.getCuratedInsights(),
          api.getCorrelationMatrix(),
        ]);
        setInsights(insightsRes || []);
        setMatrixData(matrixRes);
      } catch (err) {
        console.error('Failed to load comparison data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function runBivariate() {
      try {
        setCustomLoading(true);
        const res = await api.getBivariateAnalysis(paramX, paramY, lag);
        setCustomPair(res);
      } catch (err) {
        console.error('Failed to run bivariate analysis:', err);
      } finally {
        setCustomLoading(false);
      }
    }
    runBivariate();
  }, [paramX, paramY, lag]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
          <GitCompare className="w-6 h-6 text-[#355E3B]" />
          <span>Cross-Parameter Relationships & Environmental Couplings</span>
        </h1>
        <p className="text-sm text-[#6B7367] mt-1">
          Investigating synchrony, hydrological time lags, and rank correlations across atmospheric, terrestrial, and aquatic systems.
        </p>
      </div>

      {/* Critical Scientific Disclaimer Banner */}
      <div className="p-4 bg-[#F2EFE6] border border-[#DDD6C5] rounded-2xl flex items-start space-x-3 text-xs text-[#4A5247]">
        <AlertCircle className="w-5 h-5 text-[#8A7155] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#343A32] font-semibold uppercase tracking-wider">
            Scientific Rigor Note: Correlation Does Not Establish Causation
          </strong>
          <p className="mt-1 text-[#6B7367] leading-relaxed">
            Statistically significant correlations reflect coupled environmental dynamics and energy balance, but do not imply direct physical causation. Atmospheric moisture, soil water infiltration, and vegetation phenology operate across non-linear feedbacks and delayed hydrological lag intervals.
          </p>
        </div>
      </div>

      {/* Dynamic Bivariate Explorer with Scatter Plot */}
      <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#EDE7D9] gap-4">
          <div>
            <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#355E3B]" />
              <span>Interactive Bivariate Scatter & Lag Correlation Explorer</span>
            </h2>
            <p className="text-xs text-[#6B7367] mt-0.5">
              Select any two environmental parameters and apply monthly hydrological lag shifts.
            </p>
          </div>

          {/* Variable & Lag Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">X-Axis Variable</label>
              <select
                value={paramX}
                onChange={(e) => setParamX(e.target.value)}
                className="bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-[#355E3B]"
              >
                {parameterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">Y-Axis Variable</label>
              <select
                value={paramY}
                onChange={(e) => setParamY(e.target.value)}
                className="bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-[#355E3B]"
              >
                {parameterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">Hydrological Lag</label>
              <select
                value={lag}
                onChange={(e) => setLag(Number(e.target.value))}
                className="bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-[#355E3B]"
              >
                <option value={0}>Lag 0 (Synchronous)</option>
                <option value={1}>Lag +1 Month</option>
                <option value={2}>Lag +2 Months</option>
                <option value={3}>Lag +3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {customLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
          </div>
        ) : customPair ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Scatter Plot */}
            <div className="lg:col-span-2 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DEC9" opacity={0.8} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={paramX}
                    stroke="#8A7155"
                    tick={{ fill: '#6B7367', fontSize: 10 }}
                    label={{ value: paramX, position: 'bottom', fill: '#6B7367', fontSize: 11, offset: 0 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={paramY}
                    stroke="#8A7155"
                    tick={{ fill: '#6B7367', fontSize: 10 }}
                    label={{ value: paramY, angle: -90, position: 'left', fill: '#6B7367', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: '#FCFAF5',
                      borderColor: '#D5CDBE',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: '#343A32',
                      boxShadow: '0 4px 14px rgba(52, 58, 50, 0.08)'
                    }}
                  />
                  <Scatter
                    name="Observations"
                    data={customPair.scatter_points || []}
                    fill="#355E3B"
                    opacity={0.65}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Statistics Panel */}
            <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#DDD6C5] space-y-3">
              <h3 className="text-xs uppercase text-[#355E3B] tracking-wider font-semibold">Correlation Metrics</h3>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7367]">Pearson r</span>
                <span className="text-lg font-bold text-[#343A32] font-serif">
                  {customPair.pearson_r > 0 ? `+${customPair.pearson_r}` : customPair.pearson_r}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7367]">Pearson p-value</span>
                <span className="text-[#355E3B] font-semibold">
                  p = {customPair.pearson_p_value.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7367]">Spearman Rank ρ</span>
                <span className="text-[#343A32] font-medium">
                  {customPair.spearman_rho > 0 ? `+${customPair.spearman_rho}` : customPair.spearman_rho}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7367]">Coefficient of Det. (R²)</span>
                <span className="text-[#343A32] font-medium">{customPair.ols_r_squared}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7367]">Total Observations</span>
                <span className="text-[#343A32] font-medium">{customPair.n_samples} Months</span>
              </div>

              <div className="pt-3 border-t border-[#E0D8C8] text-xs text-[#4A5247] leading-relaxed">
                {customPair.scientific_interpretation}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Curated Scientific Environmental Couplings List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#343A32] font-serif">
            Curated Scientific Hypotheses & Environmental Couplings
          </h2>
          <p className="text-xs text-[#6B7367]">
            Pre-configured physical coupling pathways in Karnataka's climate and ecological system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.pair_id}
              className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-5 hover:border-[#A3B18A] hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#343A32] font-serif">{ins.name}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#DDE5D0] text-[#29492E] border border-[#B8C4A4] font-medium">
                  {ins.lag_months === 0 ? 'Synchronous' : `Lag +${ins.lag_months} Mo`}
                </span>
              </div>

              <p className="text-xs text-[#4A5247] leading-relaxed">{ins.expected_relationship}</p>

              <div className="pt-3 border-t border-[#EDE7D9] grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#F4EFE6] p-2 rounded-xl border border-[#DDD6C5]">
                  <span className="block text-[10px] text-[#8A7155] uppercase font-semibold">PEARSON r</span>
                  <span className="font-bold text-[#355E3B]">
                    {ins.statistics.pearson_r > 0 ? `+${ins.statistics.pearson_r}` : ins.statistics.pearson_r}
                  </span>
                </div>
                <div className="bg-[#F4EFE6] p-2 rounded-xl border border-[#DDD6C5]">
                  <span className="block text-[10px] text-[#8A7155] uppercase font-semibold">SPEARMAN ρ</span>
                  <span className="font-bold text-[#526B43]">
                    {ins.statistics.spearman_rho > 0 ? `+${ins.statistics.spearman_rho}` : ins.statistics.spearman_rho}
                  </span>
                </div>
                <div className="bg-[#F4EFE6] p-2 rounded-xl border border-[#DDD6C5]">
                  <span className="block text-[10px] text-[#8A7155] uppercase font-semibold">P-VALUE</span>
                  <span className="font-bold text-[#343A32]">
                    {ins.statistics.pearson_p_value < 0.001 ? '<0.001' : ins.statistics.pearson_p_value.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
