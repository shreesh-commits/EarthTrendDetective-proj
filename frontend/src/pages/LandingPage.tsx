import React from 'react';
import {
  Compass,
  Thermometer,
  Droplets,
  Waves,
  Trees,
  CloudRain,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sprout,
  Sun,
  Mountain,
  Leaf
} from 'lucide-react';

interface LandingPageProps {
  onExplore: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore }) => {
  const parameters = [
    {
      id: 'air_temperature',
      name: 'Air Temperature',
      icon: Thermometer,
      source: 'NASA POWER MERRA-2',
      variable: 'T2M (2-metre air temperature)',
      unit: '°C',
      description: 'Historical temperature dynamics, annual means, climatological anomalies, and warming rates across Karnataka.',
      badgeColor: 'bg-[#FBECE8] text-[#A3523B] border-[#F3C5BA]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#C06C54]',
      accentColor: 'text-[#C06C54]',
      iconBg: 'bg-[#FBECE8] text-[#C06C54]'
    },
    {
      id: 'water_temperature',
      name: 'Water Temperature',
      icon: Waves,
      source: 'NOAA OISST v2.1 & MODIS LSWT',
      variable: 'SST (Coastal) & LSWT (Inland)',
      unit: '°C',
      description: 'Strict segregation between Arabian Sea coastal surface temperature and inland Karnataka freshwater reservoirs.',
      badgeColor: 'bg-[#EBF5F5] text-[#346F68] border-[#BFDFDB]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#5A8F8E]',
      accentColor: 'text-[#5A8F8E]',
      iconBg: 'bg-[#EBF5F5] text-[#5A8F8E]'
    },
    {
      id: 'water_level',
      name: 'Water Level & Storage',
      icon: Droplets,
      source: 'Central Water Commission & NWIC',
      variable: 'Storage Level (m MSL) & % Capacity',
      unit: 'm MSL / %',
      description: 'Historical storage levels across 10 major Karnataka reservoirs (KRS, Tungabhadra, Almatti, Linganamakki, Kabini).',
      badgeColor: 'bg-[#EBF2F4] text-[#416975] border-[#C6DAE0]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#789BA6]',
      accentColor: 'text-[#789BA6]',
      iconBg: 'bg-[#EBF2F4] text-[#789BA6]'
    },
    {
      id: 'vegetation',
      name: 'Vegetation Index',
      icon: Trees,
      source: 'NASA MODIS MOD13Q1 / MYD13Q1',
      variable: 'NDVI & EVI',
      unit: 'Index [-1 to +1]',
      description: 'Photosynthetic biomass greenness, Western Ghats canopy integrity, and peri-urban fragmentation patterns.',
      badgeColor: 'bg-[#DDE5D0] text-[#29492E] border-[#B8C4A4]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#355E3B]',
      accentColor: 'text-[#355E3B]',
      iconBg: 'bg-[#DDE5D0] text-[#355E3B]'
    },
    {
      id: 'soil_moisture',
      name: 'Soil Moisture',
      icon: Layers,
      source: 'NASA GLDAS Noah & SMAP',
      variable: 'Surface (0-10cm) & Root-zone (10-100cm)',
      unit: 'm³/m³',
      description: 'Explicit physical distinction between evaporative topsoil moisture and resilient subsurface root-zone moisture.',
      badgeColor: 'bg-[#F4ECE3] text-[#6E543D] border-[#DFCBB9]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#8A7155]',
      accentColor: 'text-[#8A7155]',
      iconBg: 'bg-[#F4ECE3] text-[#8A7155]'
    },
    {
      id: 'rainfall',
      name: 'Rainfall / Precipitation',
      icon: CloudRain,
      source: 'NASA GPM IMERG & NASA POWER',
      variable: 'PRECTOTCORR Accumulated Sum',
      unit: 'mm / month',
      description: 'Monthly accumulated precipitation sums, Southwest monsoons, and extreme cloudburst deluge signatures.',
      badgeColor: 'bg-[#EBF2F6] text-[#416175] border-[#C6D8E4]',
      cardBg: 'bg-[#FAF8F2] border-[#E8DFC9] hover:border-[#658296]',
      accentColor: 'text-[#658296]',
      iconBg: 'bg-[#EBF2F6] text-[#658296]'
    },
  ];

  const questions = [
    { q: 'WHAT has changed?', a: 'Quantifies historical trajectories across 6 environmental variables from 2000 to 2024 with zero synthetic gaps.' },
    { q: 'WHERE has it changed?', a: 'High-resolution geospatial attribution across Karnataka\'s 8 agro-climatic zones and 30 official districts.' },
    { q: 'HOW MUCH has it changed?', a: 'Calculates decadal differences, period shifts (2000–11 vs 2012–24), and standard deviation anomalies.' },
    { q: 'HOW FAST is it changing?', a: 'Non-parametric Theil-Sen median slope estimator calculating true rates per year and per decade.' },
    { q: 'IS IT STATISTICALLY SIGNIFICANT?', a: 'Rigorous Mann-Kendall rank correlation tests with tie corrections (validated against α = 0.05 thresholds).' },
    { q: 'HOW ARE PARAMETERS RELATED?', a: 'Cross-parameter Pearson & Spearman correlation matrices combined with multi-month hydrological lag modeling.' },
  ];

  const ecologicalZones = [
    {
      title: 'Western Ghats & Malnad Rainforests',
      subtitle: 'Biodiversity Hotspot & Orographic Moisture Gateway',
      desc: 'Densely forested ridges of Shivamogga, Chikkamagaluru, and Kodagu maintaining high baseline NDVI (0.65–0.82) and feeding Karnataka\'s major river origins.',
      tag: 'Biosphere & Water Catchment',
      icon: Trees,
    },
    {
      title: 'Cauvery & Krishna River Basins',
      subtitle: 'Critical Reservoir Telemetry & Storage Lifelines',
      desc: '10 major reservoirs (KRS, Almatti, Tungabhadra, Linganamakki) showing distinct monsoonal filling and multi-year drought depletion signatures.',
      tag: 'Hydrological Storage',
      icon: Waves,
    },
    {
      title: 'Northern & Central Agricultural Plains',
      subtitle: 'Semi-Arid Black & Red Soils under Thermal Stress',
      desc: 'Expansive agro-climatic dry zones prone to rapid surface soil desiccation and intensifying summer heatwaves, buffered by canal irrigation networks.',
      tag: 'Soil & Terrestrial',
      icon: Mountain,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-[#FAF8F2] border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DDE5D0] border border-[#B8C4A4] text-[#355E3B] text-xs font-medium tracking-wide mb-6">
            <Sprout className="w-3.5 h-3.5 text-[#355E3B]" />
            <span>NASA Space Apps Hackathon Initiative • Environmental Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#343A32] font-serif leading-tight max-w-4xl">
            EarthTrend <span className="text-[#355E3B] italic">Detective</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-[#526B43] font-serif max-w-3xl leading-relaxed">
            Historical Environmental Intelligence for the Landscapes of Karnataka, India.
          </p>
          <p className="mt-3 text-base text-[#6B7367] max-w-2xl leading-relaxed">
            A scientifically credible observation platform analyzing 25 years of multi-sensor NASA Earth observation datasets to uncover long-term trends, seasonal shifts, ecological anomalies, and parameter couplings.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onExplore('dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#355E3B] hover:bg-[#29492E] text-[#F7F5ED] font-medium text-sm transition-all shadow-[0_4px_14px_rgba(53,94,59,0.25)]"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplore('map')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EFECE1] text-[#343A32] border border-[#D5CDBE] font-medium text-sm transition-all"
            >
              <MapPin className="w-4 h-4 text-[#355E3B]" />
              <span>Interactive Karnataka Map</span>
            </button>
            <button
              onClick={() => onExplore('methodology')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-transparent hover:bg-[#F2EFE6] text-[#6B7367] hover:text-[#343A32] border border-transparent font-medium text-sm transition-all"
            >
              <span>Methodology & Sources</span>
            </button>
          </div>

          {/* Key Region Stats Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#E5DEC9]">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8A7155] font-semibold">Geographical Scope</p>
              <p className="text-xl font-bold text-[#343A32] font-serif mt-1">Karnataka State</p>
              <p className="text-xs text-[#6B7367]">191,791 km² • 30 Districts</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8A7155] font-semibold">Historical Coverage</p>
              <p className="text-xl font-bold text-[#355E3B] font-serif mt-1">2000–2024</p>
              <p className="text-xs text-[#6B7367]">25 Consecutive Years</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8A7155] font-semibold">Total Observations</p>
              <p className="text-xl font-bold text-[#343A32] font-serif mt-1">12,600+</p>
              <p className="text-xs text-[#6B7367]">Multi-Point Synchronized</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8A7155] font-semibold">Research Mandate</p>
              <p className="text-xl font-bold text-[#526B43] font-serif mt-1">Historical Analytics</p>
              <p className="text-xs text-[#6B7367]">No Speculative Forecasts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ecological Landscapes of Karnataka */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-widest text-[#355E3B] uppercase">Regional Geography</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif mt-1">
            Ecological Landscapes of Karnataka
          </h2>
          <p className="text-sm text-[#6B7367] mt-2">
            The platform models environmental changes across the distinct bioclimatic corridors of Karnataka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ecologicalZones.map((zone, idx) => {
            const Icon = zone.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 hover:shadow-[0_4px_16px_rgba(52,58,50,0.06)] hover:border-[#A3B18A] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#DDE5D0] text-[#355E3B]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-[#526B43] bg-[#EFECE1] px-2.5 py-1 rounded-full border border-[#DDD6C5]">
                      {zone.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#343A32] font-serif">{zone.title}</h3>
                  <p className="text-xs text-[#8A7155] font-medium mt-1">{zone.subtitle}</p>
                  <p className="text-xs text-[#6B7367] mt-3 leading-relaxed">{zone.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 6 Core Scientific Questions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-widest text-[#355E3B] uppercase">Scientific Inquiries</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif mt-1">
            Six Fundamental Scientific Questions
          </h2>
          <p className="text-sm text-[#6B7367] mt-2">
            Every analysis, chart, and statistical test in EarthTrend Detective directly answers these questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-5 hover:border-[#A3B18A] hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#355E3B] bg-[#DDE5D0] px-2 py-0.5 rounded-full border border-[#B8C4A4]">
                  Question {idx + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#343A32] font-serif mt-3">{q.q}</h3>
              <p className="text-xs text-[#6B7367] mt-2 leading-relaxed">{q.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Six Core Environmental Parameters Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#355E3B] uppercase">Earth Observation Core</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif mt-1">
              Six Core Environmental Parameters
            </h2>
            <p className="text-sm text-[#6B7367] mt-1">
              Derived from NASA Earth observations, NOAA oceanographic products, and Central Water Commission telemetry.
            </p>
          </div>
          <button
            onClick={() => onExplore('parameters')}
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-medium text-[#355E3B] hover:text-[#29492E] transition-colors"
          >
            <span>View deep-dive parameter analyses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parameters.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => onExplore('parameters')}
                className={`rounded-2xl p-6 cursor-pointer hover:shadow-[0_6px_20px_rgba(52,58,50,0.08)] hover:-translate-y-0.5 transition-all duration-200 border ${p.cardBg}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${p.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.unit}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#343A32] font-serif">{p.name}</h3>
                <p className={`text-xs font-medium mt-0.5 ${p.accentColor}`}>{p.variable}</p>
                <p className="text-xs text-[#6B7367] mt-3 leading-relaxed">{p.description}</p>

                <div className="mt-5 pt-3 border-t border-[#E8DFC9] flex items-center justify-between text-[11px] text-[#8A7155]">
                  <span>{p.source}</span>
                  <span className="text-[#355E3B] font-medium flex items-center space-x-1 hover:underline">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scientific Credibility & Ethics Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F2] border border-[#B8C4A4] rounded-2xl p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-[#355E3B] text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-[#355E3B]" />
              <span>Scientific Credibility & Transparency Standards</span>
            </div>
            <h3 className="text-2xl font-bold text-[#343A32] font-serif">
              Strict Adherence to Scientific Integrity
            </h3>
            <p className="text-sm text-[#4A5247] mt-3 leading-relaxed">
              EarthTrend Detective enforces rigorous data provenance: no simulated or fabricated NASA observations, no conflation of Arabian Sea SST with inland freshwater reservoirs, explicit physical separation of surface vs root-zone soil moisture, and zero claims of statistical significance without mathematical proof from Mann-Kendall tests (p &lt; 0.05).
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 text-xs text-[#526B43] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#355E3B]" />
                <span>Survey of India Official Karnataka Boundary</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#526B43] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#355E3B]" />
                <span>Theil-Sen Robust Rate of Change</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#526B43] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#355E3B]" />
                <span>100% Quality Audited Observations</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
