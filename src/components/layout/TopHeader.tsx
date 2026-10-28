import React from 'react';
import { RefreshCw, Plus, Clock, Search, Layers, Sparkles } from 'lucide-react';
import { NavTab, useApp } from '../../context/AppContext';

interface TopHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onRefresh, isRefreshing }) => {
  const {
    activeTab,
    dashboardData,
    searchQuery,
    setSearchQuery,
    setIsAssistantOpen,
    setIsInterventionModalOpen,
    setPrefillInterventionAlert
  } = useApp();

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'District Administrative Overview',
      subtitle: 'Comprehensive real-time telemetry across municipal departments in Gurugram'
    },
    map: {
      title: 'District Geographic Intelligence Map',
      subtitle: 'Interactive Leaflet GIS situational radar with official Gurugram boundary and marker layers'
    },
    departments: {
      title: 'Department Operational Performance',
      subtitle: 'Water Supply, Sanitation, Healthcare & Public Grievance SLA compliance'
    },
    alerts: {
      title: 'Early Warning & Anomaly Radar',
      subtitle: 'Prioritized algorithmic risk scores and cluster detection across Gurugram wards'
    },
    grievances: {
      title: 'Citizen Grievance Redressal Registry',
      subtitle: 'Consolidated municipal complaints queue with citizen affidavits and triage status'
    },
    interventions: {
      title: 'Intervention Operations Center',
      subtitle: 'Administrative directives, field squad dispatch & resolution verification'
    },
    planning: {
      title: 'Workload & Resource Simulator',
      subtitle: 'Field squad allocations, backlog queueing model, and mutual-aid surge evaluation'
    }
  };

  const current = titles[activeTab] || titles.overview;

  const handleOpenGeneralIntervention = () => {
    setPrefillInterventionAlert(null);
    setIsInterventionModalOpen(true);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{current.title}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              <Layers className="w-3 h-3 text-slate-500" />
              HQ Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wards, alerts, tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Sync Time Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-500 bg-slate-100 rounded-lg border border-slate-200 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {dashboardData.lastUpdated}</span>
          </div>

          {/* AI Decision Assistant Button */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask AI Assistant</span>
          </button>

          {/* New Intervention Button */}
          <button
            onClick={handleOpenGeneralIntervention}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Intervention</span>
          </button>
        </div>
      </div>
    </header>
  );
};
