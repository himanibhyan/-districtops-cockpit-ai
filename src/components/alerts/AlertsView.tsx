import React, { useState, useMemo } from 'react';
import { OperationalAlert } from '../../types';
import { AlertFilters } from './AlertFilters';
import { SeverityBadge, AlertStatusBadge } from '../common/StatusBadge';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  PlusCircle,
  Database
} from 'lucide-react';

interface AlertsViewProps {
  alerts: OperationalAlert[];
  initialDepartmentFilter?: string;
  onSelectAlert: (alert: OperationalAlert) => void;
  onCreateInterventionFromAlert: (alert: OperationalAlert) => void;
  onViewOnMap?: (alert: OperationalAlert) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  initialDepartmentFilter = 'All',
  onSelectAlert,
  onCreateInterventionFromAlert,
  onViewOnMap
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>(initialDepartmentFilter);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (departmentFilter !== 'All' && alert.department.toLowerCase() !== departmentFilter.toLowerCase()) {
        return false;
      }
      if (severityFilter !== 'All' && alert.severity.toLowerCase() !== severityFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'All' && alert.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesArea = alert.affectedArea.toLowerCase().includes(q);
        const matchesEvidence = alert.evidenceSummary.toLowerCase().includes(q);
        const matchesId = alert.id.toLowerCase().includes(q);
        const matchesDept = alert.department.toLowerCase().includes(q);
        if (!matchesTitle && !matchesArea && !matchesEvidence && !matchesId && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, departmentFilter, severityFilter, statusFilter, searchQuery]);

  const handleResetFilters = () => {
    setDepartmentFilter('All');
    setSeverityFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  const getRiskScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-red-600';
    if (score >= 75) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <div className="space-y-5">
      {/* Informational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              Prioritized Early Warnings Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic anomaly detection analyzing multi-channel municipal telemetry and citizen complaints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            Synthetic Demonstration Feed
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <AlertFilters
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
        totalCount={alerts.length}
        filteredCount={filteredAlerts.length}
      />

      {/* Alert Feed Cards */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No operational alerts match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your department, severity, or search parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left block: Title, Department, Area, Evidence */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {alert.id}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {alert.department}
                    </span>
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <AlertStatusBadge status={alert.status} size="sm" />
                    <span className="text-[11px] text-slate-400 font-mono ml-auto lg:ml-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {alert.timestamp}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {alert.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{alert.affectedArea}</span>
                  </div>

                  {/* Evidence Summary preview */}
                  <div className="mt-3 text-xs text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80 leading-relaxed font-sans">
                    <strong className="text-slate-900">Trigger Evidence: </strong>
                    {alert.evidenceSummary}
                  </div>

                  {/* Synthetic Metrics preview pills */}
                  <div className="mt-3 flex items-center flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Telemetry Signals:</span>
                    {alert.metrics.slice(0, 3).map((metric, mIdx) => (
                      <span
                        key={mIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200"
                      >
                        <span>{metric.label}:</span>
                        <strong className="text-slate-900">{metric.currentValue}</strong>
                        {metric.delta && <span className="text-rose-600 font-sans">{metric.delta}</span>}
                      </span>
                    ))}
                    {alert.metrics.length > 3 && (
                      <span className="text-slate-400 text-[10px]">
                        +{alert.metrics.length - 3} more indicators
                      </span>
                    )}
                  </div>
                </div>

                {/* Right block: Risk score meter & Action buttons */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 lg:pl-6 lg:border-l lg:border-slate-100">
                  {/* Risk Score */}
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Risk Index</div>
                    <div className="font-mono font-bold text-2xl text-slate-900">
                      {alert.riskScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </div>
                    <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskScoreBarColor(alert.riskScore)}`}
                        style={{ width: `${alert.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {onViewOnMap && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOnMap(alert);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                        title="Locate on Gurugram map"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Map</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateInterventionFromAlert(alert);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                      title="Issue directive for this alert"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Direct</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect & Explain</span>
                    </button>

                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
