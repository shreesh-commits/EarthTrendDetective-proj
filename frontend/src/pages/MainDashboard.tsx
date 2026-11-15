import React, { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  Layers,
  Database,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Droplets,
  Sprout
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
import { PlatformStats, KeyFinding } from '../types';
import { StatCard } from '../components/StatCard';
import { TrendBadge } from '../components/TrendBadge';

interface MainDashboardProps {
  onNavigate: (tab: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [findings, setFindings] = useState<KeyFinding[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, findingsRes, masterRes] = await Promise.all([
          api.getStats(),
          api.getKeyFindings(),
          api.getExplorerRecords({ parameter_id: 'master', page_size: 300 })
        ]);
        setStats(statsRes);
        setFindings(findingsRes);

        // Process annual averages for clean dashboard visualization
        if (masterRes && masterRes.records) {
          const records = masterRes.records;
          const byYear: Record<number, any> = {};
          records.forEach((r: any) => {
            const y = r.year;
            if (!byYear[y]) {
              byYear[y] = {
                year: y,
                air_temp: [],
                rainfall: [],
                storage: [],
                ndvi: [],
                soil: [],
              };
            }
            if (r.air_temperature) byYear[y].air_temp.push(r.air_temperature);
            if (r.rainfall_accumulated) byYear[y].rainfall.push(r.rainfall_accumulated);
            if (r.percent_storage) byYear[y].storage.push(r.percent_storage);
            if (r.ndvi) byYear[y].ndvi.push(r.ndvi);
            if (r.surface_soil_moisture) byYear[y].soil.push(r.surface_soil_moisture);
          });

          const annualSeries = Object.keys(byYear).map((yStr) => {
            const y = Number(yStr);
            const obj = byYear[y];
            const avg = (arr: number[]) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0);
            return {
              year: y,
              'Air Temperature (°C)': avg(obj.air_temp),
              'Rainfall (Monthly mm)': avg(obj.rainfall),
              'Reservoir Storage (%)': avg(obj.storage),
              'Vegetation (NDVI x100)': Number((avg(obj.ndvi) * 100).toFixed(1)),
              'Surface Soil Moisture (%)': Number((avg(obj.soil) * 100).toFixed(1)),
            };
          });

          setChartData(annualSeries.sort((a, b) => a.year - b.year));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
          <p className="text-sm text-[#6B7367]">Synchronizing Karnataka environmental observations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif">
            Executive Environmental Dashboard
          </h1>
          <p className="text-sm text-[#6B7367] mt-1">
            Real-time synthesis of 25-year historical trends across Karnataka's 6 environmental pillars.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#DDE5D0] text-[#29492E] border border-[#B8C4A4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
            <span>100% Quality Audited Data</span>
          </span>
          <button
            onClick={() => onNavigate('map')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#355E3B] hover:bg-[#29492E] text-[#F7F5ED] font-medium text-xs transition-all shadow-sm"
          >
            <span>Open Geospatial Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Monitored Parameters"
          value={stats?.total_parameters_monitored || 6}
          subtext="Atmosphere to Hydrosphere"
          icon={Layers}
          badge="Full Spectrum"
        />
        <StatCard
          title="Historical Span"
          value="2000–2024"
          unit="25 Yrs"
          subtext="300 Synced Months"
          icon={Calendar}
          badge="Long-Term"
        />
        <StatCard
          title="Total Observations"
          value={(stats?.total_historical_observations || 12600).toLocaleString()}
          subtext="Harmonized Records"
          icon={Database}
          badge="Multi-Point"
        />
        <StatCard
          title="Agro-Climatic Zones"
          value={stats?.agro_climatic_zones_count || 8}
          subtext="Coastal to Dry Plains"
          icon={Activity}
          badge="Regional"
        />
        <StatCard
          title="Major Reservoirs"
          value={stats?.major_reservoirs_monitored || 10}
          subtext="CWC Monitored Dams"
          icon={Droplets}
          badge="Hydrology"
        />
      </div>

      {/* Multi-Parameter Historical Synchronized Chart */}
      <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-[#EDE7D9]">
          <div>
            <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#355E3B]" />
              <span>Statewide 25-Year Synchronized Environmental Trajectory</span>
            </h2>
            <p className="text-xs text-[#6B7367] mt-0.5">
              Annual statewide mean observations from 2000 to 2024.
            </p>
          </div>
          <span className="text-xs text-[#8A7155] mt-2 sm:mt-0 font-medium">
            Natural Earth Palette • Multi-Sensor Synthesized
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DEC9" opacity={0.8} />
              <XAxis dataKey="year" stroke="#8A7155" tick={{ fill: '#6B7367', fontSize: 11 }} />
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
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="Air Temperature (°C)"
                stroke="#C06C54"
                strokeWidth={2.4}
                dot={{ r: 3, fill: '#C06C54' }}
              />
              <Line
                type="monotone"
                dataKey="Reservoir Storage (%)"
                stroke="#5A8F8E"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Vegetation (NDVI x100)"
                stroke="#355E3B"
                strokeWidth={2.2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Surface Soil Moisture (%)"
                stroke="#8A7155"
                strokeWidth={1.8}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Six Key Environmental Findings */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#343A32] font-serif">
              Key Environmental Findings (2000–2024)
            </h2>
            <p className="text-xs text-[#6B7367]">
              Validated through Mann-Kendall trend tests, Sen's slopes, and climatological baseline anomalies.
            </p>
          </div>
          <button
            onClick={() => onNavigate('trends')}
            className="text-xs text-[#355E3B] hover:text-[#29492E] font-medium flex items-center space-x-1"
          >
            <span>View all statistical tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {findings.map((f) => (
            <div
              key={f.id}
              className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-5 hover:border-[#A3B18A] hover:shadow-[0_4px_16px_rgba(52,58,50,0.06)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-[#8A7155] uppercase tracking-wider">
                    {f.parameter}
                  </span>
                  <TrendBadge trend={f.trend} />
                </div>
                <h3 className="text-base font-bold text-[#343A32] font-serif">{f.finding}</h3>
                <p className="text-xs font-semibold text-[#355E3B] mt-1">{f.metric}</p>
                <p className="text-xs text-[#6B7367] mt-2.5 leading-relaxed">{f.details}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EDE7D9] text-[11px] text-[#8A7155] flex items-center justify-between">
                <span>{f.significance}</span>
                <span
                  onClick={() => onNavigate('parameters')}
                  className="text-[#355E3B] hover:underline cursor-pointer font-medium"
                >
                  Deep Dive →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
