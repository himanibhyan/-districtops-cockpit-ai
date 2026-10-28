import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  RotateCcw, 
  Filter, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS, WARDS } from '../../data/mockData';
import { Grievance, GrievancePriority, GrievanceStatus } from '../../types';

export const GrievanceTable: React.FC = () => {
  const { 
    grievances, 
    setSelectedGrievance, 
    filterDepartment, 
    setFilterDepartment, 
    filterWard, 
    setFilterWard 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDepartment('ALL');
    setFilterWard('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
  };

  const filteredGrievances = grievances.filter((g) => {
    if (filterDepartment !== 'ALL' && g.department !== filterDepartment) return false;
    if (filterWard !== 'ALL' && g.wardId !== filterWard) return false;
    if (filterStatus !== 'ALL' && g.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && g.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        g.citizenName.toLowerCase().includes(q) ||
        g.wardName.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: GrievancePriority) => {
    switch (p) {
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

  const getStatusBadge = (s: GrievanceStatus) => {
    switch (s) {
      case 'PENDING':
        return <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-semibold font-mono">PENDING</span>;
      case 'ACKNOWLEDGED':
        return <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded font-semibold font-mono">ACKNOWLEDGED</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded font-semibold font-mono">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded font-semibold font-mono">RESOLVED</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">CLOSED</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wide text-slate-900 uppercase">
                Citizen Grievance Redressal Registry
              </h2>
              <p className="text-xs text-slate-500">
                Single unified queue consolidating public grievances across Water, Sanitation, Health, PWD, and Education.
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
              placeholder="Search title, citizen, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value as any)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Departments</option>
            {Object.values(DEPARTMENTS).map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Wards</option>
            {WARDS.map((w) => (
              <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Action Required)</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-slate-300 bg-slate-50 rounded py-1.5 px-2 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Grievance Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Citizen</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No grievance records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredGrievances.map((grv) => {
                  const dept = DEPARTMENTS[grv.department];
                  return (
                    <tr
                      key={grv.id}
                      onClick={() => setSelectedGrievance(grv)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 group-hover:text-amber-700 whitespace-nowrap">
                        {grv.id}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {grv.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {grv.category}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {dept?.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                        {grv.wardName}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800 leading-none">{grv.citizenName}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5 leading-none">{grv.citizenPhoneMasked}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getPriorityBadge(grv.priority)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getStatusBadge(grv.status)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(grv.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredGrievances.length} of {grievances.length} grievances</span>
          <span className="font-mono text-[11px]">Click row to view full citizen affidavit & update ticket status</span>
        </div>
      </div>
    </div>
  );
};
