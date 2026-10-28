import React, { useState } from 'react';
import { 
  Flame, 
  ArrowRight, 
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../data/mockData';

export const IncidentFeed: React.FC = () => {
  const { incidents, setSelectedIncident, setActiveTab } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.wardName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">MEDIUM</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVESTIGATING':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">INVESTIGATING</span>;
      case 'ESCALATED':
        return <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">ESCALATED</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">RESOLVED</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">OPEN</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Live Incident Triage Feed
            </h3>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full font-mono">
              {filteredIncidents.length}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('incidents')}
            className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
          >
            <span>Full Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, ID, or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs border border-slate-300 rounded py-1 px-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No incidents matching current criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const dept = DEPARTMENTS[incident.department];
            return (
              <div
                key={incident.id}
                onClick={() => {
                  setSelectedIncident(incident);
                  setActiveTab('incidents');
                }}
                className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {incident.id}
                      </span>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {incident.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {incident.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <span className="font-medium text-slate-700">
                    {dept?.name} • {incident.wardName}
                  </span>
                  <span className="font-mono text-slate-400">
                    {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
