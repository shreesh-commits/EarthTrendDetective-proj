import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  trend,
}) => {
  return (
    <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-5 hover:border-[#A3B18A] hover:shadow-[0_4px_16px_rgba(52,58,50,0.06)] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#6B7367]">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-[#DDE5D0]/70 text-[#355E3B]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-[#343A32]">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-[#6B7367]">{unit}</span>}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-[#EDE7D9]">
          {subtext && <span className="text-[#6B7367]">{subtext}</span>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                trend === 'up'
                  ? 'bg-[#FBECE8] text-[#A3523B] border border-[#F3C5BA]'
                  : trend === 'down'
                  ? 'bg-[#EBF2F4] text-[#416975] border border-[#C6DAE0]'
                  : 'bg-[#DDE5D0] text-[#3F5333] border border-[#B8C4A4]'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
