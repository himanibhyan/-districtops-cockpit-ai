import React from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  PlusCircle, 
  AlertTriangle,
  Clock,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../data/mockData';
import { RiskAlert } from '../../types';

interface AlertDetailModalProps {
  alert: RiskAlert | null;
  onClose: () => void;
  onCreateIntervention: (alert: RiskAlert) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose, onCreateIntervention }) => {
  const { grievances, setSelectedGrievance, setActiveTab } = useApp();

  if (!alert) return null;

  const dept = DEPARTMENTS[alert.department];
  const relatedGrievanceRecords = grievances.filter(g => alert.relatedRecordIds.includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-slate-800 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                  {alert.id}
                </span>
                <span className="text-xs bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/40 font-mono">
                  RISK SCORE: {alert.riskScore}/100
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-900">{dept?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Ward</span>
              <span className="font-bold text-slate-900">{alert.wardName} ({alert.wardId})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Comparison Baseline</span>
              <span className="font-mono text-slate-800 text-[11px]">{alert.comparisonBaseline}</span>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-1.5 mb-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>Evidence-Backed Anomaly Explanation</span>
            </h4>
            <p className="bg-slate-50 p-3 rounded-md border border-slate-200 text-slate-800 leading-relaxed">
              {alert.shortExplanation}
            </p>
          </div>

          {/* Risk Scoring Methodology */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-md p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">
              Transparent Risk Formula Breakdown (Score: {alert.riskScore}/100)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Volume Surge:</span>
                <p className="font-bold text-slate-900 font-mono">+{alert.supportingMetrics.surgePercentage}% (wt: 35%)</p>
              </div>
              <div>
                <span className="text-slate-500">Delay Delta:</span>
                <p className="font-bold text-slate-900 font-mono">+{alert.supportingMetrics.resolutionDeteriorationHours}h (wt: 25%)</p>
              </div>
              <div>
                <span className="text-slate-500">Backlog Cases:</span>
                <p className="font-bold text-slate-900 font-mono">{alert.supportingMetrics.unresolvedBacklogCount} unassigned (wt: 25%)</p>
              </div>
              <div>
                <span className="text-slate-500">SLA Standard:</span>
                <p className="font-bold text-slate-900 font-mono">{alert.supportingMetrics.baselineResolutionHours}h max</p>
              </div>
            </div>
          </div>

          {/* Recommended Investigation */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
              Suggested Administrative Investigation & Response
            </h4>
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md text-blue-950 font-medium">
              {alert.suggestedInvestigation}
            </div>
          </div>

          {/* Cited Citizen Grievance Records */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
              <span>Supporting Citizen Grievances ({relatedGrievanceRecords.length} records)</span>
              <span className="text-[10px] text-slate-400 font-normal">Click ticket to view details</span>
            </h4>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md max-h-48 overflow-y-auto">
              {relatedGrievanceRecords.map((grv) => (
                <div
                  key={grv.id}
                  onClick={() => {
                    setSelectedGrievance(grv);
                    onClose();
                    setActiveTab('grievances');
                  }}
                  className="p-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.2 rounded border">
                        {grv.id}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">
                        {grv.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                      {grv.description}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {grv.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onCreateIntervention(alert);
            }}
            className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded shadow-xs flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Trackable Intervention</span>
          </button>
        </div>
      </div>
    </div>
  );
};
