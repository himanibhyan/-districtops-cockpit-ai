import React from 'react';
import { DepartmentType, SeverityLevel, AlertStatus, InterventionStatus } from '../../types';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';

export interface MapFiltersState {
  department: string;
  severity: string;
  alertStatus: string;
  interventionStatus: string;
  showAlerts: boolean;
  showInterventions: boolean;
}

interface MapFilterBarProps {
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
  onReset: () => void;
  displayedAlertsCount: number;
  displayedInterventionsCount: number;
  totalAlertsCount: number;
  totalInterventionsCount: number;
}

const DEPARTMENTS: ('All' | DepartmentType)[] = [
  'All',
  'Water Supply',
  'Sanitation',
  'Healthcare',
  'Public Grievances',
  'Roads & Infrastructure'
];

const SEVERITIES: ('All' | SeverityLevel)[] = ['All', 'Critical', 'High', 'Medium', 'Low'];
const ALERT_STATUSES: ('All' | AlertStatus)[] = ['All', 'Action Required', 'Escalated', 'Investigating', 'Monitoring', 'Resolved'];
const INTERVENTION_STATUSES: ('All' | InterventionStatus)[] = ['All', 'Assigned', 'In Progress', 'Completed'];

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  displayedAlertsCount,
  displayedInterventionsCount,
  totalAlertsCount,
  totalInterventionsCount
}) => {
  const isFiltered =
    filters.department !== 'All' ||
    filters.severity !== 'All' ||
    filters.alertStatus !== 'All' ||
    filters.interventionStatus !== 'All' ||
    !filters.showAlerts ||
    !filters.showInterventions;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Toggle Toggles */}
        <div className="flex items-center gap-2">
          {/* Show Alerts Toggle */}
          <button
            onClick={() => onChange({ ...filters, showAlerts: !filters.showAlerts })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border transition-colors ${
              filters.showAlerts
                ? 'bg-red-50 text-red-700 border-red-200 shadow-xs'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {filters.showAlerts ? <Eye className="w-3.5 h-3.5 text-red-600" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Alerts</span>
            <span className="font-mono text-[10px] ml-0.5 px-1.5 py-0.2 rounded bg-white border border-red-200 text-red-800">
              {displayedAlertsCount}/{totalAlertsCount}
            </span>
          </button>

          {/* Show Interventions Toggle */}
          <button
            onClick={() => onChange({ ...filters, showInterventions: !filters.showInterventions })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border transition-colors ${
              filters.showInterventions
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {filters.showInterventions ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Directives</span>
            <span className="font-mono text-[10px] ml-0.5 px-1.5 py-0.2 rounded bg-white border border-blue-200 text-blue-800">
              {displayedInterventionsCount}/{totalInterventionsCount}
            </span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center flex-wrap gap-2 text-[11px]">
          {/* Department */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Dept:</span>
            <select
              value={filters.department}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Depts' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={filters.severity}
              onChange={(e) => onChange({ ...filters, severity: e.target.value })}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Severities' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Status */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Alert St:</span>
            <select
              value={filters.alertStatus}
              onChange={(e) => onChange({ ...filters, alertStatus: e.target.value })}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none"
            >
              {ALERT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Alert Status' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Intervention Status */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Directive St:</span>
            <select
              value={filters.interventionStatus}
              onChange={(e) => onChange({ ...filters, interventionStatus: e.target.value })}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none"
            >
              {INTERVENTION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Directive Status' : st}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Reset all map filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
