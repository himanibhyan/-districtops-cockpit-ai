import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Database,
  ExternalLink,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { queryDistrictOpsAssistant, SUGGESTED_QUESTIONS, AssistantAnswer } from '../../services/assistantEngine';
import { RiskAlert } from '../../types';

interface AIAssistantDrawerProps {
  onOpenCreateIntervention: (alert: RiskAlert) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ onOpenCreateIntervention }) => {
  const { 
    isAssistantOpen, 
    setIsAssistantOpen, 
    incidents, 
    grievances, 
    alerts, 
    interventions,
    setSelectedIncident,
    setSelectedAlert,
    setActiveTab
  } = useApp();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<AssistantAnswer | null>(() => {
    return queryDistrictOpsAssistant(
      'Which issues require attention first?',
      incidents,
      grievances,
      alerts,
      interventions
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isAssistantOpen) return null;

  const handleAsk = (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    // Simulate brief AI synthesis latency (200ms) for realistic UX
    setTimeout(() => {
      const resp = queryDistrictOpsAssistant(query, incidents, grievances, alerts, interventions);
      setCurrentResponse(resp);
      setIsLoading(false);
    }, 200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  const handleActionClick = (resp: AssistantAnswer) => {
    if (resp.suggestedActionType === 'CREATE_INTERVENTION' && resp.actionTargetId) {
      const targetAlert = alerts.find(a => a.id === resp.actionTargetId) || alerts[0];
      if (targetAlert) {
        setIsAssistantOpen(false);
        onOpenCreateIntervention(targetAlert);
      }
    } else if (resp.suggestedActionType === 'VIEW_INCIDENT' && resp.actionTargetId) {
      const targetInc = incidents.find(i => i.id === resp.actionTargetId);
      if (targetInc) {
        setSelectedIncident(targetInc);
        setActiveTab('incidents');
        setIsAssistantOpen(false);
      }
    } else if (resp.suggestedActionType === 'VIEW_ALERT' && resp.actionTargetId) {
      const targetAlert = alerts.find(a => a.id === resp.actionTargetId);
      if (targetAlert) {
        setSelectedAlert(targetAlert);
        setActiveTab('alerts');
        setIsAssistantOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#0b1329] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold font-mono tracking-wide">
                  DISTRICT DECISION ASSISTANT
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  GROUNDED AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in current telemetry • Zero hallucinations
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAssistantOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1.5">
            Suggested Strategic Questions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(q);
                  handleAsk(q);
                }}
                className="text-[11px] font-medium bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Main Answer Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Synthesizing multi-department records and computing statistical baselines...
              </p>
            </div>
          ) : currentResponse ? (
            <div className="space-y-4">
              {/* Question Asked Tag */}
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>"{currentResponse.question}"</span>
                <span className="text-[10px] text-slate-500 font-mono">Telemetry Grounded</span>
              </div>

              {/* Direct Answer Box */}
              <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-200 rounded-lg p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono block">
                  Direct Executive Synthesis
                </span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {currentResponse.directAnswer}
                </p>
                <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-700">
                  <strong className="text-amber-900 font-semibold">Why It Matters: </strong>
                  {currentResponse.whyItMatters}
                </div>
              </div>

              {/* Key Insights List */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono block">
                  Key Operational Insights
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {currentResponse.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Next Steps */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono block">
                  Recommended Administrative Directives
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {currentResponse.recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsible Department Chip */}
              <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Designated Lead Department:</span>
                <span className="font-bold text-slate-900">{currentResponse.responsibleDepartment}</span>
              </div>

              {/* Supporting Evidence Box */}
              <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Supporting Verification Evidence</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Audit Grade</span>
                </div>

                {/* Computed Metrics Key-Value */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(currentResponse.evidence.computedMetrics).map(([k, v]) => (
                    <div key={k} className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">{k}:</span>
                      <span className="font-mono font-bold text-amber-400">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Cited Record IDs */}
                {currentResponse.evidence.citedRecordIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400 text-[10px] block mb-1">Cited Telemetry IDs:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentResponse.evidence.citedRecordIds.map((id) => (
                        <span key={id} className="font-mono text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Limitations */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed italic">
                  <strong>Known Limitations: </strong>
                  {currentResponse.evidence.limitations}
                </div>
              </div>

              {/* Action Trigger Button */}
              {currentResponse.suggestedActionType && (
                <button
                  onClick={() => handleActionClick(currentResponse)}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {currentResponse.suggestedActionType === 'CREATE_INTERVENTION'
                      ? 'Launch Trackable Intervention from this Evidence'
                      : 'Open Detailed Incident Investigation'}
                  </span>
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Query Input Bar in Footer */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about district backlogs, wards, or incidents..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="bg-[#0b1329] hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
