import React, { useEffect, useState } from 'react';
import {
  Database,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import { api } from '../services/api';

export const DataExplorerPage: React.FC = () => {
  const [paramId, setParamId] = useState<string>('air_temperature');
  const [yearMin, setYearMin] = useState<number>(2000);
  const [yearMax, setYearMax] = useState<number>(2024);
  const [season, setSeason] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const datasetOptions = [
    { id: 'air_temperature', label: 'Air Temperature (NASA POWER T2M)' },
    { id: 'rainfall', label: 'Rainfall (GPM / POWER Corrected mm)' },
    { id: 'water_temperature', label: 'Water Temp (Coastal SST vs Inland LSWT)' },
    { id: 'water_level', label: 'Water Level (10 Major Reservoirs)' },
    { id: 'vegetation', label: 'Vegetation (MODIS NDVI & EVI)' },
    { id: 'soil_moisture', label: 'Soil Moisture (GLDAS Surface & Root-zone)' },
    { id: 'master', label: 'Harmonized Statewide Master Dataset' },
  ];

  useEffect(() => {
    async function fetchRecords() {
      try {
        setLoading(true);
        const res = await api.getExplorerRecords({
          parameter_id: paramId,
          year_min: yearMin,
          year_max: yearMax,
          season: season || undefined,
          location: locationQuery || undefined,
          page,
          page_size: pageSize,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load explorer records:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [paramId, yearMin, yearMax, season, locationQuery, page, pageSize]);

  const handleDownload = () => {
    window.open(`/api/explorer/download-csv?parameter_id=${paramId}`, '_blank');
  };

  const columns = data?.columns || [];
  const records = data?.records || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#E5DEC9] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
            <Database className="w-6 h-6 text-[#355E3B]" />
            <span>Environmental Data Explorer & CSV Export</span>
          </h1>
          <p className="text-sm text-[#6B7367] mt-1">
            Inspect raw observations, verify quality flags, and download analysis-ready datasets.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#355E3B] hover:bg-[#29492E] text-[#F7F5ED] font-medium text-xs transition-all shadow-sm self-start lg:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Dataset (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Dataset Selector */}
        <div>
          <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">Dataset</label>
          <select
            value={paramId}
            onChange={(e) => {
              setParamId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-[#355E3B]"
          >
            {datasetOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">
            Year Range ({yearMin}–{yearMax})
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={yearMin}
              onChange={(e) => { setYearMin(Number(e.target.value)); setPage(1); }}
              className="w-1/2 bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2 py-1.5 outline-none font-medium"
            >
              {Array.from({ length: 25 }, (_, i) => 2000 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="text-[#8A7155] text-xs">to</span>
            <select
              value={yearMax}
              onChange={(e) => { setYearMax(Number(e.target.value)); setPage(1); }}
              className="w-1/2 bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2 py-1.5 outline-none font-medium"
            >
              {Array.from({ length: 25 }, (_, i) => 2000 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Season Filter */}
        <div>
          <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">Season</label>
          <select
            value={season}
            onChange={(e) => { setSeason(e.target.value); setPage(1); }}
            className="w-full bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl px-2.5 py-1.5 font-medium outline-none focus:border-[#355E3B]"
          >
            <option value="">All Seasons</option>
            <option value="Pre-Monsoon">Pre-Monsoon (Mar-May)</option>
            <option value="Southwest Monsoon">Southwest Monsoon (Jun-Sep)</option>
            <option value="Post-Monsoon">Post-Monsoon (Oct-Dec)</option>
            <option value="Winter">Winter (Jan-Feb)</option>
          </select>
        </div>

        {/* Search Location */}
        <div>
          <label className="block text-[10px] uppercase text-[#8A7155] font-semibold mb-1">Location Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. KRS, Bengaluru..."
              value={locationQuery}
              onChange={(e) => { setLocationQuery(e.target.value); setPage(1); }}
              className="w-full bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-[#355E3B]"
            />
            <Search className="w-3.5 h-3.5 text-[#8A7155] absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Row count summary */}
        <div className="flex flex-col justify-end">
          <div className="text-[11px] text-[#6B7367]">
            Total Matches: <span className="text-[#355E3B] font-bold">{data?.total_records?.toLocaleString() || 0}</span>
          </div>
          <div className="text-[10px] text-[#8A7155] mt-0.5">
            Flag 0: Validated Observation
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-[#355E3B] animate-spin" />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0EDE1] text-[#8A7155] uppercase font-medium tracking-wider text-[11px] border-b border-[#DDD6C5]">
                  <tr>
                    {columns.map((col: string) => (
                      <th key={col} className="py-3 px-4 whitespace-nowrap">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7D9] text-[#343A32]">
                  {records.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-[#F4EFE6] transition-colors">
                      {columns.map((col: string) => {
                        const val = row[col];
                        const isQualityFlag = col === 'quality_flag';
                        return (
                          <td key={col} className="py-2.5 px-4 whitespace-nowrap text-[11px]">
                            {isQualityFlag ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DDE5D0] text-[#29492E] border border-[#B8C4A4]">
                                0: Validated
                              </span>
                            ) : val !== null && val !== undefined ? (
                              String(val)
                            ) : (
                              <span className="text-[#A8A190]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#EDE7D9] flex items-center justify-between text-xs text-[#6B7367]">
              <div>
                Page {data?.page} of {data?.total_pages || 1}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] hover:bg-[#EFECE1] disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= (data?.total_pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#F4EFE6] border border-[#DDD6C5] text-[#343A32] hover:bg-[#EFECE1] disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
