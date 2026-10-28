import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckCircle,
  HelpCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RiskAlert } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface EarlyWarningViewProps {
  onCreateInterventionClick: (alert: RiskAlert) => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({ onCreateInterventionClick }) => {
  const { alerts, setSelectedAlert, setSelectedIncident, incidents, setActiveTab } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.wardName.toLowerCase().includes(q) ||
        a.shortExplanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string, score: number) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="bg-red-950 text-red-200 border border-red-500/50 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
            <span>CRITICAL</span>
            <span className="text-red-400">({score}/100)</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-orange-950 text-orange-200 border border-orange-500/50 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
            <span>HIGH</span>
            <span className="text-orange-400">({score}/100)</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-950 text-amber-200 border border-amber-500/50 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
            <span>MEDIUM</span>
            <span className="text-amber-400">({score}/100)</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1">
            <span>LOW</span>
            <span className="text-slate-400">({score}/100)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining the Risk Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
                  Early Warning & Risk Detection Engine
                </h2>
                <span className="text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded font-mono font-semibold">
                  Signal Normalization 0 - 100
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Deterministic detection evaluates: <strong>(1) Volume surge vs baseline (35%)</strong>, <strong>(2) Resolution turnaround deterioration (25%)</strong>, <strong>(3) Backlog volume (25%)</strong>, and <strong>(4) Spatial/Cross-sector nexus (15%)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-950 p-2.5 rounded border border-slate-800 shrink-0">
            <div>
              <span className="text-slate-400 text-[10px] block">Thresholds:</span>
              <div className="flex items-center space-x-2 text-[11px] font-mono mt-0.5">
                <span className="text-red-400">Crit: ≥80</span>
                <span className="text-orange-400">High: 60-79</span>
                <span className="text-amber-400">Med: 35-59</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter alerts by title, ward, or explanation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs border border-slate-300 rounded py-1 px-2.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities ({alerts.length})</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 text-xs">
            No risk alerts matching current filters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const dept = DEPARTMENTS[alert.department];
            const relatedInc = incidents.find(i => i.department === alert.department && i.wardId === alert.wardId);

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-lg p-4 shadow-xs transition-all hover:shadow-md ${
                  alert.severity === 'CRITICAL'
                    ? 'border-red-300 ring-1 ring-red-500/20'
                    : alert.severity === 'HIGH'
                    ? 'border-orange-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {alert.id}
                      </span>
                      {getSeverityBadge(alert.severity, alert.riskScore)}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {dept?.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {alert.wardName} ({alert.wardId})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.shortExplanation}
                    </p>
                  </div>

                  {/* Actions on Alert */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded transition border border-slate-200"
                    >
                      Inspect Evidence
                    </button>

                    {alert.associatedInterventionId ? (
                      <button
                        onClick={() => setActiveTab('interventions')}
                        className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded flex items-center space-x-1 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tracking: {alert.associatedInterventionId}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onCreateInterventionClick(alert)}
                        className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded flex items-center space-x-1.5 shadow-xs transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create Intervention</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Supporting Code-Calculated Metrics Bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Grievance Surge</span>
                    <span className="font-mono text-sm font-bold text-red-600">
                      +{alert.supportingMetrics.surgePercentage}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {alert.supportingMetrics.complaintCount} vs {alert.supportingMetrics.baselineCount} baseline
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Resolution Turnaround</span>
                    <span className="font-mono text-sm font-bold text-amber-700">
                      {alert.supportingMetrics.resolutionTimeAvgHours}h
                    </span>
                    <span className="text-[10px] text-red-600 font-semibold block">
                      +{alert.supportingMetrics.resolutionDeteriorationHours}h vs {alert.supportingMetrics.baselineResolutionHours}h SLA
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Unresolved Backlog</span>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {alert.supportingMetrics.unresolvedBacklogCount} tickets
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Awaiting field closure
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Suggested Next Step</span>
                    <p className="text-[11px] font-medium text-slate-800 line-clamp-2">
                      {alert.suggestedInvestigation.split('.')[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
