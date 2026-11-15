import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
  trend: string;
  isSignificant?: boolean;
  rate?: string;
  pValue?: number;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  trend,
  isSignificant,
  rate,
  pValue
}) => {
  const isIncreasing = trend.toLowerCase().includes('increasing') || trend.toLowerCase().includes('warming') || trend.toLowerCase().includes('greening');
  const isDecreasing = trend.toLowerCase().includes('decreasing') || trend.toLowerCase().includes('cooling') || trend.toLowerCase().includes('stress');

  return (
    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-[#FAF8F2] border-[#DDD6C5]">
      {isIncreasing ? (
        <TrendingUp className="w-3.5 h-3.5 text-[#C06C54]" />
      ) : isDecreasing ? (
        <TrendingDown className="w-3.5 h-3.5 text-[#5B7F8A]" />
      ) : (
        <Minus className="w-3.5 h-3.5 text-[#8A7155]" />
      )}

      <span
        className={`capitalize ${
          isIncreasing ? 'text-[#A3523B]' : isDecreasing ? 'text-[#416975]' : 'text-[#6B7367]'
        }`}
      >
        {trend}
      </span>

      {rate && (
        <span className="text-[#8A7155] text-[11px] border-l border-[#DDD6C5] pl-1.5 ml-1">
          {rate}
        </span>
      )}

      {isSignificant !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
            isSignificant
              ? 'bg-[#DDE5D0] text-[#29492E] border border-[#B8C4A4]'
              : 'bg-[#F0EDE1] text-[#7E857A]'
          }`}
        >
          {isSignificant ? (pValue !== undefined ? `p=${pValue.toFixed(3)}` : 'Sig (p<0.05)') : 'Not Sig'}
        </span>
      )}
    </div>
  );
};
