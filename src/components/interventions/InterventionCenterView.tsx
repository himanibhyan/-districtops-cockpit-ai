import React, { useState, useMemo } from 'react';
import { Intervention, InterventionStatus } from '../../types';
import { InterventionCard } from './InterventionCard';
import {
  ClipboardCheck,
  Plus,
  Search,
  Hourglass,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';

interface InterventionCenterViewProps {
  interventions: Intervention[];
  onOpenCreateModal: () => void;
  onUpdateStatus: (id: string, newStatus: InterventionStatus) => Promise<void>;
}

export const InterventionCenterView: React.FC<InterventionCenterViewProps> = ({
  interventions,
  onOpenCreateModal,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | InterventionStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: interventions.length,
      assigned: interventions.filter(i => i.status === 'Assigned').length,
      inProgress: interventions.filter(i => i.status === 'In Progress').length,
      completed: interventions.filter(i => i.status === 'Completed').length
    };
  }, [interventions]);

  // Filtered List
  const filteredInterventions = useMemo(() => {
    return interventions.filter(i => {
      if (activeTab !== 'ALL' && i.status !== activeTab) return false;
      if (departmentFilter !== 'All' && i.department.toLowerCase() !== departmentFilter.toLowerCase()) return false;
      if (priorityFilter !== 'All' && i.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = i.title.toLowerCase().includes(q);
        const matchesDesc = i.description.toLowerCase().includes(q);
        const matchesArea = i.targetArea.toLowerCase().includes(q);
        const matchesOfficer = i.assignedOfficer.toLowerCase().includes(q);
        const matchesId = i.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesArea && !matchesOfficer && !matchesId) return false;
      }
      return true;
    });
  }, [interventions, activeTab, departmentFilter, priorityFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: InterventionStatus) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Intervention Command & Tracking Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue, track and verify corrective field directives assigned to municipal executive wings
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Issue New Directive</span>
        </button>
      </div>

      {/* KPI Metric Summary Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] uppercase font-semibold tracking-wider opacity-80">
            Total Directives
          </div>
          <div className="font-mono font-bold text-2xl mt-1">{counts.all}</div>
        </button>

        <button
          onClick={() => setActiveTab('Assigned')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'Assigned'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] uppercase font-semibold tracking-wider opacity-80 flex items-center justify-between">
            <span>Pending Dispatch</span>
            <Hourglass className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="font-mono font-bold text-2xl mt-1">{counts.assigned}</div>
        </button>

        <button
          onClick={() => setActiveTab('In Progress')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'In Progress'
              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] uppercase font-semibold tracking-wider opacity-80 flex items-center justify-between">
            <span>In Field Execution</span>
            <PlayCircle className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="font-mono font-bold text-2xl mt-1">{counts.inProgress}</div>
        </button>

        <button
          onClick={() => setActiveTab('Completed')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'Completed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] uppercase font-semibold tracking-wider opacity-80 flex items-center justify-between">
            <span>Verified & Closed</span>
            <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="font-mono font-bold text-2xl mt-1">{counts.completed}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search directives by officer, ward, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
          />
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none text-xs"
            >
              <option value="All">All Departments</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Public Grievances">Public Grievances</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none text-xs"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Intervention Cards List */}
      {filteredInterventions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No interventions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no directives matching the selected filter criteria.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Directive Now
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInterventions.map((intv) => (
            <InterventionCard
              key={intv.id}
              intervention={intv}
              onStatusChange={handleStatusChange}
              isUpdating={updatingId === intv.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
