import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  RotateCcw, 
  Clock, 
  ExternalLink,
  Flame,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS, WARDS } from '../../data/mockData';
import { Incident } from '../../types';

export const IncidentList: React.FC = () => {
  const { incidents, setSelectedIncident } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'reportedAt' | 'severity'>('reportedAt');

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDept('ALL');
    setFilterSeverity('ALL');
    setFilterStatus('ALL');
    setSortBy('reportedAt');
  };

  const filteredIncidents = incidents
    .filter((inc) => {
      if (filterDept !== 'ALL' && inc.department !== filterDept) return false;
      if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
      if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inc.title.toLowerCase().includes(q) ||
          inc.id.toLowerCase().includes(q) ||
          inc.wardName.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return order[a.severity] - order[b.severity];
      }
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">MEDIUM</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVESTIGATING':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">INVESTIGATING</span>;
      case 'ESCALATED':
        return <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">ESCALATED</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">RESOLVED</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">OPEN</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wide text-slate-900 uppercase">
                Incident Intelligence Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Track high-impact field disruptions, review subterranean correlations, and record executive directives.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, ID, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Departments</option>
            {Object.values(DEPARTMENTS).map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="ESCALATED">Escalated</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs font-semibold text-slate-800"
          >
            <option value="reportedAt">Sort: Most Recent</option>
            <option value="severity">Sort: Highest Severity</option>
          </select>
        </div>
      </div>

      {/* Incident Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 text-xs">
            No incidents match the active search or filter criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const dept = DEPARTMENTS[incident.department];
            return (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className={`bg-white border rounded-lg p-4 shadow-xs hover:shadow-md transition cursor-pointer group ${
                  incident.severity === 'CRITICAL' ? 'border-red-300 ring-1 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {incident.id}
                      </span>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
                        {dept?.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {incident.wardName} ({incident.wardId})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {incident.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {incident.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-semibold text-amber-700 group-hover:underline flex items-center space-x-1">
                      <span>Investigate</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center space-x-4">
                    <span>
                      Squadron: <strong className="text-slate-800">{incident.assignedTeam || 'Unassigned'}</strong>
                    </span>
                    <span>
                      Linked Complaints: <strong className="font-mono text-slate-800">{incident.relatedGrievanceIds.length}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-slate-400">
                    Reported: {new Date(incident.reportedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
