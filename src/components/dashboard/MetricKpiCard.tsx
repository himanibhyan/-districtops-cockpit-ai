import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricKpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  changeVsLastWeek?: number;
  changeLabel?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'danger' | 'warning' | 'info' | 'neutral';
  };
  highlightColor?: 'blue' | 'red' | 'amber' | 'emerald';
  onClick?: () => void;
}

export const MetricKpiCard: React.FC<MetricKpiCardProps> = ({
  title,
  value,
  unit,
  changeVsLastWeek,
  changeLabel = 'vs last week',
  subtext,
  icon: Icon,
  badge,
  highlightColor = 'blue',
  onClick
}) => {
  const colorStyles = {
    blue: 'border-l-4 border-l-blue-600',
    red: 'border-l-4 border-l-red-600',
    amber: 'border-l-4 border-l-amber-500',
    emerald: 'border-l-4 border-l-emerald-600'
  };

  const iconBgStyles = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  const badgeStyles = {
    danger: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const isPositive = (changeVsLastWeek ?? 0) > 0;
  const isZero = (changeVsLastWeek ?? 0) === 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 transition-all hover:shadow-md ${
        colorStyles[highlightColor]
      } ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${iconBgStyles[highlightColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-1 text-xs">
        {changeVsLastWeek !== undefined ? (
          <div className="flex items-center gap-1 font-medium">
            {isZero ? (
              <span className="inline-flex items-center text-slate-500">
                <Minus className="w-3.5 h-3.5 mr-0.5" /> 0%
              </span>
            ) : isPositive ? (
              <span className="inline-flex items-center text-rose-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{changeVsLastWeek}%
              </span>
            ) : (
              <span className="inline-flex items-center text-emerald-600">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {changeVsLastWeek}%
              </span>
            )}
            <span className="text-slate-400 font-normal">{changeLabel}</span>
          </div>
        ) : subtext ? (
          <span className="text-slate-500">{subtext}</span>
        ) : null}

        {badge && (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${badgeStyles[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
