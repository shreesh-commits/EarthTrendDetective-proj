import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { MainDashboard } from './pages/MainDashboard';
import { KarnatakaMapPage } from './pages/KarnatakaMapPage';
import { ParameterAnalysisPage } from './pages/ParameterAnalysisPage';
import { TrendDetectionPage } from './pages/TrendDetectionPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { Sprout } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');

  return (
    <div className="min-h-screen bg-[#F7F5ED] text-[#343A32] flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'landing' && <LandingPage onExplore={(tab) => setActiveTab(tab)} />}
        {activeTab === 'dashboard' && <MainDashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'map' && <KarnatakaMapPage />}
        {activeTab === 'parameters' && <ParameterAnalysisPage />}
        {activeTab === 'trends' && <TrendDetectionPage />}
        {activeTab === 'anomalies' && <AnomalyDetectionPage />}
        {activeTab === 'comparison' && <ComparisonPage />}
        {activeTab === 'explorer' && <DataExplorerPage />}
        {activeTab === 'methodology' && <MethodologyPage />}
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF8F2] border-t border-[#E5DEC9] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-[#6B7367] gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#DDE5D0] text-[#355E3B] flex items-center justify-center border border-[#B8C4A4]">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#343A32] font-serif text-sm">EarthTrend Detective</span>
              <span className="text-[#8A7155] ml-2 font-medium">| NASA Space Apps Hackathon Initiative</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-[#526B43]">
            <span>Karnataka, India Focus</span>
            <span>•</span>
            <span className="font-semibold text-[#355E3B]">100% Real Historical Observations</span>
            <span>•</span>
            <span>2000–2024 Records</span>
          </div>

          <div className="text-[11px] text-[#8A7155]">
            NASA POWER • GPM IMERG • MODIS • GLDAS • NOAA OISST • CWC India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
