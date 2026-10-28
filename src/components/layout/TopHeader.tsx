import React from 'react';
import { RefreshCw, Plus, Clock, Search, Layers } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: NavTab;
  onOpenNewIntervention: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lastUpdated: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenNewIntervention,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  lastUpdated
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'District Administrative Overview',
      subtitle: 'Comprehensive real-time telemetry across municipal departments'
    },
    departments: {
      title: 'Department Operational Performance',
      subtitle: 'Water Supply, Sanitation, Healthcare & Public Grievance compliance'
    },
    alerts: {
      title: 'Early Warning & Risk Radar',
      subtitle: 'Prioritized algorithmic risk scores and anomalous cluster detection'
    },
    interventions: {
      title: 'Intervention Operations Center',
      subtitle: 'Administrative directives, field squad dispatch & resolution verification'
    }
  };

  const { title, subtitle } = titles[activeTab];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Layers className="w-3 h-3 text-slate-500" />
              HQ Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts, wards, teams..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh operational telemetry"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Sync Time Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-500 bg-slate-100 rounded-lg border border-slate-200 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {lastUpdated}</span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewIntervention}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Intervention</span>
          </button>
        </div>
      </div>
    </header>
  );
};
