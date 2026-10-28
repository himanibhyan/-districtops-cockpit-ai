import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { DepartmentType, SeverityLevel } from '../../types';

interface AlertFiltersProps {
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  severityFilter: string;
  onSeverityChange: (severity: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const DEPARTMENTS: ('All' | DepartmentType)[] = [
  'All',
  'Water Supply',
  'Sanitation',
  'Healthcare',
  'Public Grievances'
];

const SEVERITIES: ('All' | SeverityLevel)[] = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low'
];

const STATUSES = ['All', 'Action Required', 'Escalated', 'Investigating', 'Monitoring', 'Resolved'];

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  departmentFilter,
  onDepartmentChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onReset,
  totalCount,
  filteredCount
}) => {
  const hasActiveFilters =
    departmentFilter !== 'All' ||
    severityFilter !== 'All' ||
    statusFilter !== 'All' ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, ward, evidence keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Department"
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Severity:</label>
            <select
              value={severityFilter}
              onChange={(e) => onSeverityChange(e.target.value)}
              aria-label="Severity"
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'All' ? 'All Severities' : `${sev}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Status"
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter summary bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>
            Showing <strong className="text-slate-800 font-mono">{filteredCount}</strong> of{' '}
            <span className="font-mono">{totalCount}</span> prioritized operational alerts
          </span>
        </div>
        {hasActiveFilters && (
          <span className="text-blue-600 font-medium">Filtered View Active</span>
        )}
      </div>
    </div>
  );
};
