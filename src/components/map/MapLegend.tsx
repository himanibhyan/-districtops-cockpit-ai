import React from 'react';
import { Layers } from 'lucide-react';

interface MapLegendProps {
  totalAlerts: number;
  totalInterventions: number;
  compact?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  totalAlerts,
  totalInterventions,
  compact = false
}) => {
  return (
    <div className={`bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-md rounded-xl p-3 text-xs text-slate-700 ${compact ? 'py-2 px-3' : 'p-3'}`}>
      <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-100">
        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Map Legend
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {totalAlerts} Alerts • {totalInterventions} Directives
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        {/* Red: Critical alerts */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white shadow-xs"></span>
          </span>
          <span className="font-medium text-slate-800">Critical Alert</span>
        </div>

        {/* Amber: High-priority alerts */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500 border border-white shadow-xs"></span>
          <span className="font-medium text-slate-800">High-Priority</span>
        </div>

        {/* Blue: Active interventions */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-md bg-blue-600 border border-white shadow-xs"></span>
          <span className="font-medium text-slate-800">Active Directive</span>
        </div>

        {/* Green: Completed interventions */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-md bg-emerald-600 border border-white shadow-xs"></span>
          <span className="font-medium text-slate-800">Completed Directive</span>
        </div>
      </div>

      {/* Boundary reference */}
      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-blue-500 inline-block"></span>
          <span>Official Gurugram District Boundary (Census / DataMeet)</span>
        </div>
      </div>
    </div>
  );
};
