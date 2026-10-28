import React from 'react';
import { OperationalAlert, Intervention } from '../../types';
import { SeverityBadge, AlertStatusBadge, InterventionStatusBadge } from '../common/StatusBadge';
import {
  MapPin,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';

interface MarkerDetailCardProps {
  item: { type: 'alert'; alert: OperationalAlert } | { type: 'intervention'; intervention: Intervention };
  onOpenAlertDetail?: (alert: OperationalAlert) => void;
  onNavigateToInterventions?: () => void;
}

export const MarkerDetailCard: React.FC<MarkerDetailCardProps> = ({
  item,
  onOpenAlertDetail,
  onNavigateToInterventions
}) => {
  if (item.type === 'alert') {
    const { alert } = item;
    return (
      <div className="p-3.5 max-w-sm text-xs space-y-2.5 font-sans">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {alert.id}
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {alert.department}
            </span>
          </div>
          <SeverityBadge severity={alert.severity} size="sm" />
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-sm leading-snug">
            {alert.title}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{alert.affectedArea}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Evidence: </strong>
          {alert.evidenceSummary}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            <AlertStatusBadge status={alert.status} size="sm" />
            <span className="font-mono font-bold text-red-600">Risk {alert.riskScore}/100</span>
          </div>

          {onOpenAlertDetail && (
            <button
              onClick={() => onOpenAlertDetail(alert)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Inspect & Explain</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Intervention Detail
  const { intervention } = item;
  return (
    <div className="p-3.5 max-w-sm text-xs space-y-2.5 font-sans">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {intervention.id}
          </span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            {intervention.department}
          </span>
        </div>
        <InterventionStatusBadge status={intervention.status} size="sm" />
      </div>

      <div>
        <h4 className="font-bold text-slate-900 text-sm leading-snug">
          {intervention.title}
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700">{intervention.targetArea}</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
        {intervention.description}
      </p>

      {/* Progress */}
      <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 font-sans">Field Progress</span>
          <span className="font-bold text-slate-800">{intervention.progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full ${
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

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        <span className="text-slate-500 flex items-center gap-1">
          <User className="w-3 h-3 text-slate-400" />
          {intervention.assignedOfficer}
        </span>

        {onNavigateToInterventions && (
          <button
            onClick={onNavigateToInterventions}
            className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline text-[11px]"
          >
            Manage Directive <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
