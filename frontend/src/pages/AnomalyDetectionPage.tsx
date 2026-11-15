import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

import { api } from '../services/api';
import { AnomalyRecord } from '../types';

export const AnomalyDetectionPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedParam, setSelectedParam] = useState<string>('all');
  const [minZ, setMinZ] = useState<number>(1.645);

  const parameterOptions = [
    { id: 'all', label: 'All 6 Parameters' },
    { id: 'air_temperature', label: 'Air Temperature' },
    { id: 'rainfall', label: 'Rainfall' },
    { id: 'water_level', label: 'Water Level' },
    { id: 'vegetation', label: 'Vegetation' },
    { id: 'soil_moisture', label: 'Soil Moisture' },
    { id: 'water_temperature', label: 'Water Temperature' },
  ];

  useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        const data = await api.getAnomalies({
          parameter_id: selectedParam === 'all' ? undefined : selectedParam,
          min_z_score: minZ,
          limit: 100
        });
        setAnomalies(data || []);
      } catch (err) {
        console.error('Failed to load anomalies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, [selectedParam, minZ]);

  // Chart data: Top 20 extreme anomalies
  const chartData = anomalies.slice(0, 20).map((a) => ({
    label: `${a.date.slice(0, 7)} (${a.parameter_name.slice(0, 8)})`,
    z_score: a.z_score,
    param: a.parameter_name,
    magnitude: a.anomaly_magnitude,
    unit: a.unit,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#E5DEC9] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-[#8A7155]" />
            <span>Historical Environmental Anomaly Detection</span>
          </h1>
          <p className="text-sm text-[#6B7367] mt-1">
            Statistical departures relative to 2000–2020 climatological monthly normals (Z-Score ≥ {minZ}σ).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Parameter Dropdown */}
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value)}
            className="bg-[#FAF8F2] border border-[#D5CDBE] text-[#343A32] text-xs rounded-xl px-3 py-2 font-medium focus:ring-1 focus:ring-[#355E3B] outline-none"
          >
            {parameterOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Threshold Switcher */}
          <div className="flex bg-[#FAF8F2] p-1 rounded-xl border border-[#D5CDBE] text-xs">
            <button
              onClick={() => setMinZ(1.645)}
              className={`px-3 py-1 rounded-lg transition-all ${
                minZ === 1.645
                  ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                  : 'text-[#6B7367] hover:text-[#343A32]'
              }`}
            >
              |Z| ≥ 1.65 (90%)
            </button>
            <button
              onClick={() => setMinZ(2.0)}
              className={`px-3 py-1 rounded-lg transition-all ${
                minZ === 2.0
                  ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                  : 'text-[#6B7367] hover:text-[#343A32]'
              }`}
            >
              |Z| ≥ 2.0 (95%)
            </button>
            <button
              onClick={() => setMinZ(2.5)}
              className={`px-3 py-1 rounded-lg transition-all ${
                minZ === 2.5
                  ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                  : 'text-[#6B7367] hover:text-[#343A32]'
              }`}
            >
              |Z| ≥ 2.5 (Severe)
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 20 Anomalies Chart */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2 mb-4 pb-3 border-b border-[#EDE7D9]">
              <SlidersHorizontal className="w-4 h-4 text-[#355E3B]" />
              <span>Standardized Anomaly Departures (Top 20 Z-Scores)</span>
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DEC9" opacity={0.8} />
                  <XAxis
                    dataKey="label"
                    stroke="#8A7155"
                    angle={-40}
                    textAnchor="end"
                    tick={{ fill: '#6B7367', fontSize: 10 }}
                  />
                  <YAxis stroke="#8A7155" tick={{ fill: '#6B7367', fontSize: 11 }} />
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
                  <Bar dataKey="z_score" name="Standard Deviations (Z-score)">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.z_score > 0 ? '#C06C54' : '#5B7F8A'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomalies Table */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EDE7D9] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#343A32] font-serif">
                  Flagged Historical Anomalies Log ({anomalies.length} Events)
                </h2>
                <p className="text-xs text-[#6B7367] mt-0.5">
                  Ordered by statistical extremity. Baseline calibrated against 2000–2020 month-specific distributions.
                </p>
              </div>
              <span className="text-xs text-[#355E3B] font-semibold bg-[#DDE5D0] px-3 py-1 rounded-full border border-[#B8C4A4]">
                Threshold: |Z| ≥ {minZ}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Observed</th>
                    <th className="py-3 px-4">Clim. Normal</th>
                    <th className="py-3 px-4">Anomaly</th>
                    <th className="py-3 px-4">Z-Score</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Scientific Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {anomalies.map((a, idx) => {
                    const isPositive = a.z_score > 0;
                    return (
                      <tr key={idx} className="hover:bg-[#F4EFE6] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#343A32] whitespace-nowrap">
                          {a.date.slice(0, 7)}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#343A32] font-serif">
                          {a.parameter_name}
                        </td>
                        <td className="py-3 px-4 text-[#4A5247]">
                          {a.location}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#343A32]">
                          {a.observed_value} <span className="text-[10px] text-[#8A7155] font-normal">{a.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-[#6B7367]">
                          {a.climatological_normal} {a.unit}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={isPositive ? 'text-[#C06C54]' : 'text-[#5B7F8A]'}>
                            {a.anomaly_magnitude > 0 ? `+${a.anomaly_magnitude}` : a.anomaly_magnitude} {a.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={isPositive ? 'text-[#A3523B]' : 'text-[#416975]'}>
                            {a.z_score > 0 ? `+${a.z_score}σ` : `${a.z_score}σ`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                              a.severity === 'Severe Outlier'
                                ? 'bg-[#FBECE8] text-[#A3523B] border border-[#F3C5BA]'
                                : 'bg-[#F7EFE1] text-[#8C6239] border border-[#E8D4B8]'
                            }`}
                          >
                            {a.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#4A5247] max-w-xs text-[11px] leading-tight">
                          {a.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
