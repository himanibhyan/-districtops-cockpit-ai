import React from 'react';
import { Intervention, InterventionStatus } from '../../types';
import { PriorityBadge, InterventionStatusBadge } from '../common/StatusBadge';
import {
  MapPin,
  Clock,
  User,
  Users
} from 'lucide-react';

interface InterventionCardProps {
  intervention: Intervention;
  onStatusChange: (id: string, newStatus: InterventionStatus) => Promise<void>;
  isUpdating?: boolean;
}

export const InterventionCard: React.FC<InterventionCardProps> = ({
  intervention,
  onStatusChange,
  isUpdating = false
}) => {
  const getStatusBgColor = (status: InterventionStatus) => {
    switch (status) {
      case 'Completed':
        return 'border-emerald-200 bg-white';
      case 'In Progress':
        return 'border-blue-200 bg-white';
      case 'Assigned':
      default:
        return 'border-amber-200 bg-white';
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${getStatusBgColor(
        intervention.status
      )}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {intervention.id}
          </span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            {intervention.department}
          </span>
          <PriorityBadge priority={intervention.priority} size="sm" />
          <InterventionStatusBadge status={intervention.status} size="sm" />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Issued: {intervention.createdAt}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-3 space-y-2">
        <h3 className="font-bold text-base text-slate-900 tracking-tight leading-snug">
          {intervention.title}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {intervention.description}
        </p>

        {/* Linked alert pill if present */}
        {intervention.linkedAlertId && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700">
            <span className="text-slate-400">Trigger Alert:</span>
            <span className="font-mono font-semibold text-blue-700">{intervention.linkedAlertId}</span>
            <span className="text-slate-500 truncate max-w-[280px]">
              {intervention.linkedAlertTitle}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div className="flex justify-between items-center text-xs mb-1 font-mono">
          <span className="text-slate-500 font-medium font-sans">Field Execution Progress</span>
          <span className="font-bold text-slate-800">{intervention.progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              intervention.status === 'Completed'
                ? 'bg-emerald-500'
                : intervention.status === 'In Progress'
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${intervention.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Context metadata: Location, Officer, Team */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{intervention.targetArea}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{intervention.assignedOfficer}</span>
        </div>
        {intervention.assignedTeam && (
          <div className="flex items-center gap-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{intervention.assignedTeam}</span>
          </div>
        )}
      </div>

      {/* Status Transition Action Bar */}
      <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400">
          Last updated: <span className="text-slate-600 font-medium">{intervention.updatedAt}</span>
        </div>

        {/* Status Transition Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] text-slate-500 mr-1 font-medium">Update Status:</span>

          <button
            onClick={() => onStatusChange(intervention.id, 'Assigned')}
            disabled={isUpdating || intervention.status === 'Assigned'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              intervention.status === 'Assigned'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Assigned
          </button>

          <button
            onClick={() => onStatusChange(intervention.id, 'In Progress')}
            disabled={isUpdating || intervention.status === 'In Progress'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              intervention.status === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => onStatusChange(intervention.id, 'Completed')}
            disabled={isUpdating || intervention.status === 'Completed'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              intervention.status === 'Completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
};
