import React from 'react';
import { SeverityLevel, AlertStatus, PriorityLevel, InterventionStatus } from '../../types';

export const SeverityBadge: React.FC<{ severity: SeverityLevel; size?: 'sm' | 'md' }> = ({
  severity,
  size = 'md'
}) => {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20 font-semibold',
    High: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20 font-medium',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20 font-medium',
    Low: 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
  };

  const dots = {
    Critical: 'bg-red-600 animate-pulse',
    High: 'bg-amber-500',
    Medium: 'bg-blue-500',
    Low: 'bg-slate-400'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${styles[severity]} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[severity]}`} />
      {severity}
    </span>
  );
};

export const AlertStatusBadge: React.FC<{ status: AlertStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const styles = {
    'Action Required': 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    'Escalated': 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
    'Investigating': 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    'Monitoring': 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'} ${sizeClasses}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md'
}) => {
  const styles = {
    Urgent: 'bg-red-100 text-red-800 border-red-300 font-semibold',
    High: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
    Medium: 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
    Low: 'bg-slate-100 text-slate-700 border-slate-300 font-medium'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded border ${styles[priority]} ${sizeClasses}`}>
      {priority} Priority
    </span>
  );
};

export const InterventionStatusBadge: React.FC<{ status: InterventionStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const styles = {
    Assigned: 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const dots = {
    Assigned: 'bg-amber-500',
    'In Progress': 'bg-blue-500 animate-pulse',
    Completed: 'bg-emerald-500'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${styles[status]} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};
