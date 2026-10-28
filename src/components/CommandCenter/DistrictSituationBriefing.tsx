import React from 'react';
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDashboardKPIs, calculateDepartmentMetrics, generateSituationBriefing } from '../../services/riskEngine';

export const DistrictSituationBriefing: React.FC = () => {
  const { incidents, grievances, alerts, interventions, setActiveTab, setSelectedAlert, setIsAssistantOpen } = useApp();
  const kpis = calculateDashboardKPIs(incidents, grievances, alerts, interventions);
  const deptMetrics = calculateDepartmentMetrics(incidents, grievances);
  const briefing = generateSituationBriefing(alerts, kpis, deptMetrics);

  const topAlert = alerts[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0d172e] to-slate-900 border border-slate-800 rounded-lg shadow-md p-4 text-white mb-5 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Executive Situation Briefing
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                Ingested: 28 Oct 2026, 11:00 IST
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100 mt-0.5">
              {briefing.headline}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded shadow-sm flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Decision Assistant</span>
          </button>

          {topAlert && (
            <button
              onClick={() => {
                setSelectedAlert(topAlert);
                setActiveTab('alerts');
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded flex items-center space-x-1 transition"
            >
              <span>Inspect Critical Alert</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Detected Patterns vs Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
        {/* Left: Detected Risk Patterns */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-md p-3 space-y-2">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Key Detected Patterns (Code-Calculated Evidence)</span>
          </p>
          <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            {briefing.summaryBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Suggested Administrative Priorities */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-md p-3 space-y-2">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Actionable Priorities for Today</span>
          </p>
          <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            {briefing.recommendedPriorities.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>{briefing.backlogStatus}</span>
        <span className="font-mono text-emerald-400 text-[10px]">
          Demonstration Dataset • 100% In-Memory Deterministic Validation
        </span>
      </div>
    </div>
  );
};
