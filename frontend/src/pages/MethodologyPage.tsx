import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Database,
  ShieldCheck,
  ExternalLink,
  Award,
  RefreshCw
} from 'lucide-react';

import { api } from '../services/api';
import { DataSourceMeta } from '../types';

export const MethodologyPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceMeta[]>([]);
  const [audits, setAudits] = useState<Record<string, any>>({});
  const [methodology, setMethodology] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [srcRes, audRes, methRes] = await Promise.all([
          api.getDataSources(),
          api.getQualityAudits(),
          api.getMethodology(),
        ]);
        setSources(srcRes || []);
        setAudits(audRes || {});
        setMethodology(methRes);
      } catch (err) {
        console.error('Failed to load methodology data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-[#355E3B]" />
          <span>Scientific Methodology, Data Provenance & Citations</span>
        </h1>
        <p className="text-sm text-[#6B7367] mt-1">
          Complete transparent documentation of datasets, statistical formulas, quality audits, and scientific boundaries.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Registered Data Sources Table */}
          <section className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EDE7D9] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#355E3B]" />
                  <span>Earth Observation Data Sources Registry</span>
                </h2>
                <p className="text-xs text-[#6B7367] mt-0.5">
                  Real environmental data providers, spatial resolutions, variables, and DOIs.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#355E3B] bg-[#DDE5D0] px-3 py-1 rounded-full border border-[#B8C4A4]">
                {sources.length} Active Feeds
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    <th className="py-3 px-4">Dataset Name & Provider</th>
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Primary Variable</th>
                    <th className="py-3 px-4">Resolution (Spatial / Temp)</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4">Source / DOI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {sources.map((s) => (
                    <tr key={s.source_id} className="hover:bg-[#F4EFE6] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#343A32] font-serif text-sm">{s.dataset_name}</div>
                        <div className="text-[11px] text-[#355E3B] font-semibold">{s.organization}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-[#4A5247]">
                        {s.parameter_id.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-[#343A32] font-medium">
                        {s.primary_variable} ({s.original_unit})
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#6B7367]">
                        {s.spatial_resolution} • {s.temporal_resolution}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#355E3B] font-bold">
                        {s.available_date_range}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[#355E3B] hover:underline text-[11px] font-semibold"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Data Quality & Integrity Audit Log */}
          <section className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EDE7D9]">
              <h2 className="text-base font-bold text-[#343A32] font-serif flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#355E3B]" />
                <span>Automated Data Quality & Integrity Audit</span>
              </h2>
              <p className="text-xs text-[#6B7367] mt-0.5">
                Every observation is audited for spatial validity, temporal continuity, and physical range constraints.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    <th className="py-3 px-4">Dataset</th>
                    <th className="py-3 px-4">Total Records</th>
                    <th className="py-3 px-4">Duplicates</th>
                    <th className="py-3 px-4">Invalid Coordinates</th>
                    <th className="py-3 px-4">Completeness (%)</th>
                    <th className="py-3 px-4">Plausibility Check</th>
                    <th className="py-3 px-4">Quality Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {Object.keys(audits).map((key) => {
                    const a = audits[key];
                    return (
                      <tr key={key} className="hover:bg-[#F4EFE6] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#343A32] font-serif capitalize">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-[#4A5247]">
                          {a.total_records.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[#4A5247]">
                          {a.duplicate_records}
                        </td>
                        <td className="py-3 px-4 text-[#4A5247]">
                          {a.invalid_spatial_coordinates}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#355E3B]">
                          {a.completeness_percentage}%
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#6B7367]">
                          {a.plausibility_flags.join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#DDE5D0] text-[#29492E] border border-[#B8C4A4]">
                            {a.quality_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Statistical Methodology Walkthrough */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 space-y-3 shadow-sm">
              <span className="text-xs uppercase text-[#355E3B] font-semibold">Test 1: Monotonic Trend</span>
              <h3 className="text-lg font-bold text-[#343A32] font-serif">Mann-Kendall Rank Test</h3>
              <p className="text-xs text-[#4A5247] leading-relaxed">
                A non-parametric statistical test assessing monotonic upward or downward trends over time. Because it does not assume normal distribution and is resilient against missing observations and extreme outliers, it represents the World Meteorological Organization (WMO) gold standard for hydro-climatic time series.
              </p>
              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] text-[11px] text-[#343A32] font-mono">
                S = Σ Σ sgn(x_j - x_k) for all k &lt; j
              </div>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 space-y-3 shadow-sm">
              <span className="text-xs uppercase text-[#355E3B] font-semibold">Test 2: Robust Rate of Change</span>
              <h3 className="text-lg font-bold text-[#343A32] font-serif">Theil-Sen Median Slope Estimator</h3>
              <p className="text-xs text-[#4A5247] leading-relaxed">
                Calculates the median of the slopes of all lines through pairs of points. Unlike ordinary least squares (OLS) which can be skewed by a single anomalous drought or deluge year, Sen's slope yields a true robust median rate of change per year and per decade.
              </p>
              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] text-[11px] text-[#343A32] font-mono">
                Sen's Slope = Median( (y_j - y_k) / (t_j - t_k) )
              </div>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 space-y-3 shadow-sm">
              <span className="text-xs uppercase text-[#355E3B] font-semibold">Test 3: Anomaly Departure</span>
              <h3 className="text-lg font-bold text-[#343A32] font-serif">Climatological Z-Score Standardization</h3>
              <p className="text-xs text-[#4A5247] leading-relaxed">
                To isolate genuine environmental anomalies from natural seasonal cycles (e.g. naturally hotter Aprils vs cooler Decembers), each observation is compared exclusively to its corresponding calendar month normal over the 2000–2020 reference baseline.
              </p>
              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] text-[11px] text-[#343A32] font-mono">
                {"Z = (Value_obs - Mean_month) / Std_month"}
              </div>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 space-y-3 shadow-sm">
              <span className="text-xs uppercase text-[#355E3B] font-semibold">Test 4: Cross-Coupling</span>
              <h3 className="text-lg font-bold text-[#343A32] font-serif">Pearson & Spearman Lag Correlations</h3>
              <p className="text-xs text-[#4A5247] leading-relaxed">
                Evaluates synchronous and lagged hydrological response times (e.g. 1-month lag between monsoon rainfall peak and peak vegetation greenness or reservoir storage crest). Explicitly documents that statistical correlation does not establish causality.
              </p>
              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] text-[11px] text-[#343A32] font-mono">
                {"r = Cov(X, Y_lagged) / (σ_X · σ_Y)"}
              </div>
            </div>
          </section>

          {/* Section 4: Hackathon Student Presentation Guide */}
          <section className="bg-[#FAF8F2] border border-[#B8C4A4] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-[#355E3B] text-xs uppercase font-semibold mb-2">
              <Award className="w-4 h-4 text-[#355E3B]" />
              <span>Hackathon Judge & Presentation Summary</span>
            </div>
            <h3 className="text-xl font-bold text-[#343A32] font-serif">
              Key Pitch Points for EarthTrend Detective
            </h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#4A5247]">
              <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] space-y-1.5">
                <strong className="text-[#343A32] font-serif text-sm block">1. True Historical Grounding</strong>
                <p className="text-[#6B7367] leading-relaxed">
                  Refused speculative future ML forecasting in favor of 100% verifiable NASA Earth observations (2000–2024).
                </p>
              </div>

              <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] space-y-1.5">
                <strong className="text-[#343A32] font-serif text-sm block">2. Zero Fabrication & Separation</strong>
                <p className="text-[#6B7367] leading-relaxed">
                  Never conflates Arabian Sea SST with inland rivers; clearly delineates topsoil from root-zone soil moisture.
                </p>
              </div>

              <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#DDD6C5] space-y-1.5">
                <strong className="text-[#343A32] font-serif text-sm block">3. Mathematical Proof</strong>
                <p className="text-[#6B7367] leading-relaxed">
                  No claims of trends or anomalies without Mann-Kendall p-values, Sen's slopes, and Z-score proofs.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
