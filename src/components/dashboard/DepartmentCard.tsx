import React from 'react';
import { DepartmentMetricSummary } from '../../types';
import {
  Droplets,
  Trash2,
  Stethoscope,
  MessageSquareWarning,
  TrendingDown,
  TrendingUp,
  Minus,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database
} from 'lucide-react';

interface DepartmentCardProps {
  department: DepartmentMetricSummary;
  onSelect: (name: string) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onSelect }) => {
  const getDeptIcon = (name: string) => {
    switch (name) {
      case 'Water Supply':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'Sanitation':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'Healthcare':
        return <Stethoscope className="w-5 h-5 text-purple-600" />;
      case 'Public Grievances':
      default:
        return <MessageSquareWarning className="w-5 h-5 text-amber-600" />;
    }
  };

  const getTrendBadge = (trend: DepartmentMetricSummary['trend']) => {
    switch (trend) {
      case 'deteriorating':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <TrendingUp className="w-3 h-3 text-rose-600" /> Backlog Rising
          </span>
        );
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <TrendingDown className="w-3 h-3 text-emerald-600" /> Improving
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Minus className="w-3 h-3 text-slate-500" /> Stable
          </span>
        );
    }
  };

  const getHealthBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              {getDeptIcon(department.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{department.name}</h3>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {department.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{department.leadOfficer}</p>
            </div>
          </div>
          <div>{getTrendBadge(department.trend)}</div>
        </div>

        {/* Health Index Bar */}
        <div className="mb-4 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Service Health Index</span>
            <span className="font-mono font-bold text-slate-800">{department.healthScore}/100</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getHealthBarColor(department.healthScore)}`}
              style={{ width: `${department.healthScore}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-slate-400" /> Open Tickets
            </div>
            <div className="font-mono font-bold text-base text-slate-900">
              {department.openGrievances}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-slate-400" /> Resolved Today
            </div>
            <div className="font-mono font-bold text-base text-emerald-700">
              +{department.resolvedToday}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] mb-1">SLA Compliance</div>
            <div className="font-mono font-bold text-base text-slate-900">
              {department.complianceRate}%
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-slate-400" /> Field Teams
            </div>
            <div className="font-mono font-bold text-base text-slate-900">
              {department.activeTeams}
            </div>
          </div>
        </div>
        {/* Verified Reference Baseline Badge */}
        <div className="mb-3 p-2 bg-blue-50/70 rounded-lg border border-blue-200/60 text-[11px]">
          <div className="flex items-center justify-between text-blue-900 font-medium mb-0.5">
            <span className="flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider text-blue-800">
              <Database className="w-3 h-3 text-blue-600" />
              Verified Baseline
            </span>
            <span className="font-mono text-[9px] text-blue-600 uppercase">OFFICIAL</span>
          </div>
          <div className="text-slate-700 font-semibold text-[11px]">
            {department.name === 'Water Supply' && '100% Verified Tap Water (JJM PDF)'}
            {department.name === 'Sanitation' && '53,523 Latrines (100% SBM Grameen)'}
            {department.name === 'Healthcare' && '11,010 HMIS Haryana Health Records'}
            {department.name !== 'Water Supply' && department.name !== 'Sanitation' && department.name !== 'Healthcare' && '35 MCG Ward Spatial Boundary'}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          Avg turnaround: {department.avgResolutionDays}d
        </span>
        <button
          onClick={() => onSelect(department.name)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Diagnostics <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
