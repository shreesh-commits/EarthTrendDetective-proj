import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  GitCompare,
} from 'lucide-react';

import { api } from '../services/api';
import { TrendBadge } from '../components/TrendBadge';

export const TrendDetectionPage: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [periodComp, setPeriodComp] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSig, setFilterSig] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [trendsRes, periodRes] = await Promise.all([
          api.getAllTrends(),
          api.getPeriodComparison(2000, 2011, 2012, 2024),
        ]);
        setTrends(trendsRes || []);
        setPeriodComp(periodRes.comparisons || []);
      } catch (err) {
        console.error('Failed to load trends data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTrends = trends.filter((t) => {
    if (filterSig === 'sig') return t.is_statistically_significant;
    if (filterSig === 'non_sig') return !t.is_statistically_significant;
    if (filterSig === 'increasing') return t.mann_kendall_trend.includes('increasing');
    if (filterSig === 'decreasing') return t.mann_kendall_trend.includes('decreasing');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5DEC9] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-[#355E3B]" />
            <span>Statistical Trend Detection Engine</span>
          </h1>
          <p className="text-sm text-[#6B7367] mt-1">
            Non-parametric Mann-Kendall rank correlation tests and Theil-Sen median rate-of-change estimators.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-[#FAF8F2] p-1.5 rounded-xl border border-[#E2DAC9] text-xs">
          <button
            onClick={() => setFilterSig('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterSig === 'all'
                ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                : 'text-[#6B7367] hover:text-[#343A32]'
            }`}
          >
            All Parameters ({trends.length})
          </button>
          <button
            onClick={() => setFilterSig('sig')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterSig === 'sig'
                ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                : 'text-[#6B7367] hover:text-[#343A32]'
            }`}
          >
            Significant (p &lt; 0.05)
          </button>
          <button
            onClick={() => setFilterSig('increasing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterSig === 'increasing'
                ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                : 'text-[#6B7367] hover:text-[#343A32]'
            }`}
          >
            Warming / Increasing
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Master Trends Table */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EDE7D9] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#343A32] font-serif">
                  Mann-Kendall & Sen's Slope Comparative Results (2000–2024)
                </h2>
                <p className="text-xs text-[#6B7367] mt-0.5">
                  Evaluated across 25 consecutive annual state means. Significance established at α = 0.05.
                </p>
              </div>
              <span className="text-xs text-[#355E3B] font-semibold bg-[#DDE5D0] px-3 py-1 rounded-full border border-[#B8C4A4]">
                Two-Tailed p-value
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    <th className="py-3 px-4">Environmental Parameter</th>
                    <th className="py-3 px-4">Historical Mean</th>
                    <th className="py-3 px-4">Mann-Kendall Trend</th>
                    <th className="py-3 px-4">Z-Statistic</th>
                    <th className="py-3 px-4">p-value</th>
                    <th className="py-3 px-4">Sen's Slope / Dec</th>
                    <th className="py-3 px-4">OLS Slope / Dec</th>
                    <th className="py-3 px-4">R² Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {filteredTrends.map((t) => (
                    <tr key={t.parameter_id} className="hover:bg-[#F4EFE6] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#343A32] font-serif">
                        {t.parameter_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#4A5247]">
                        {t.mean_value} <span className="text-[#8A7155] text-[11px]">{t.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <TrendBadge
                          trend={t.mann_kendall_trend}
                          isSignificant={t.is_statistically_significant}
                        />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#4A5247]">
                        {t.z_statistic > 0 ? `+${t.z_statistic}` : t.z_statistic}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span
                          className={
                            t.is_statistically_significant ? 'text-[#355E3B] font-bold' : 'text-[#8A7155]'
                          }
                        >
                          {t.mann_kendall_p_value.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#355E3B]">
                        {t.sens_slope_per_decade > 0 ? `+${t.sens_slope_per_decade}` : t.sens_slope_per_decade}{' '}
                        <span className="text-[10px] text-[#8A7155]">{t.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#4A5247]">
                        {t.ols_slope_per_decade > 0 ? `+${t.ols_slope_per_decade}` : t.ols_slope_per_decade}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7367]">
                        {t.r_squared}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Period Comparison: 2000-2011 vs 2012-2024 */}
          <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EDE7D9]">
              <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-[#355E3B]" />
                <span>Historical Era Comparison: Period 1 (2000–2011) vs Period 2 (2012–2024)</span>
              </h2>
              <p className="text-xs text-[#6B7367] mt-0.5">
                Quantifies decadal baseline shifts between the early observation era and recent decade.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Era 1 Mean (2000–2011)</th>
                    <th className="py-3 px-4">Era 2 Mean (2012–2024)</th>
                    <th className="py-3 px-4">Absolute Shift</th>
                    <th className="py-3 px-4">Percentage Change (%)</th>
                    <th className="py-3 px-4">Physical Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {periodComp.map((p) => {
                    const isPositive = p.absolute_change > 0;
                    return (
                      <tr key={p.parameter_id} className="hover:bg-[#F4EFE6] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#343A32] font-serif">
                          {p.parameter_name}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A5247]">
                          {p.period1_mean} {p.unit}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A5247]">
                          {p.period2_mean} {p.unit}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          <span className={isPositive ? 'text-[#C06C54]' : 'text-[#5B7F8A]'}>
                            {isPositive ? `+${p.absolute_change}` : p.absolute_change} {p.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                              Math.abs(p.percentage_change) < 2
                                ? 'bg-[#F0EDE1] text-[#6B7367]'
                                : isPositive
                                ? 'bg-[#FBECE8] text-[#A3523B] border border-[#F3C5BA]'
                                : 'bg-[#EBF2F4] text-[#416975] border border-[#C6DAE0]'
                            }`}
                          >
                            {isPositive ? `+${p.percentage_change}%` : `${p.percentage_change}%`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6B7367]">
                          {p.parameter_id === 'air_temperature'
                            ? 'Steady Regional Warming'
                            : p.parameter_id === 'rainfall'
                            ? 'Intensified Monsoon Volatility'
                            : p.parameter_id === 'water_level'
                            ? 'Deeper Dry-Year Depletions'
                            : p.parameter_id === 'soil_moisture'
                            ? 'Topsoil Drying Acceleration'
                            : 'Consistent Monitored Response'}
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
