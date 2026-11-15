import React from 'react';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  LineChart,
  TrendingUp,
  AlertTriangle,
  GitCompare,
  Database,
  BookOpen,
  Sprout
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Karnataka Map', icon: MapPin },
    { id: 'parameters', label: '6 Parameters', icon: LineChart },
    { id: 'trends', label: 'Trend Detection', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'comparison', label: 'Comparison', icon: GitCompare },
    { id: 'explorer', label: 'Data Explorer', icon: Database },
    { id: 'methodology', label: 'Methodology & Sources', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#E5DEC9] shadow-[0_2px_10px_rgba(52,58,50,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DDE5D0] border border-[#B8C4A4] flex items-center justify-center shadow-sm group-hover:bg-[#355E3B] transition-colors duration-300">
              <Sprout className="w-5 h-5 text-[#355E3B] group-hover:text-[#F7F5ED] transition-colors duration-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-[#343A32] font-serif">
                  EarthTrend <span className="text-[#355E3B] font-serif italic">Detective</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] tracking-wide font-medium bg-[#DDE5D0] text-[#3F5333] border border-[#B8C4A4] rounded-full">
                  NASA Hackathon
                </span>
              </div>
              <p className="text-xs text-[#6B7367]">Environmental Intelligence • Karnataka, India</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-[#F2EFE6] border border-[#DDD6C5] rounded-full text-xs text-[#4A5247]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#526B43] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#355E3B]"></span>
            </span>
            <span className="font-medium text-[#355E3B]">Verified Observations</span>
            <span className="text-[#A8A190]">•</span>
            <span className="text-[#6B7367]">2000–2024 Historical Record</span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-[#EDE7D9]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#355E3B] text-[#F7F5ED] shadow-sm font-semibold'
                    : 'text-[#6B7367] hover:text-[#343A32] hover:bg-[#EFECE1]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F7F5ED]' : 'text-[#8A7155]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
