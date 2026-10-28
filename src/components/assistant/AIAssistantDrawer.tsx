import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  Database,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { queryDistrictOpsAssistant, SUGGESTED_QUESTIONS, AssistantAnswer } from '../../services/assistantEngine';

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantInitialQuery,
    alerts,
    grievances,
    interventions,
    dashboardData,
    setSelectedAlert,
    setActiveTab,
    openCreateInterventionForAlert
  } = useApp();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<AssistantAnswer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial query or default prompt when opened
  useEffect(() => {
    if (isAssistantOpen) {
      const initial = assistantInitialQuery || 'Which issues require attention first?';
      setInputQuery(initial);
      const answer = queryDistrictOpsAssistant(initial, alerts, grievances, interventions, dashboardData);
      setCurrentResponse(answer);
    }
  }, [isAssistantOpen, assistantInitialQuery, alerts, grievances, interventions, dashboardData]);

  if (!isAssistantOpen) return null;

  const handleAsk = (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    // Brief 150ms simulation for smooth UI feedback
    setTimeout(() => {
      const resp = queryDistrictOpsAssistant(query, alerts, grievances, interventions, dashboardData);
      setCurrentResponse(resp);
      setIsLoading(false);
    }, 150);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  const handleActionClick = (resp: AssistantAnswer) => {
    if (resp.suggestedActionType === 'CREATE_INTERVENTION' && resp.actionTargetId) {
      const targetAlert = alerts.find((a) => a.id === resp.actionTargetId) || alerts[0];
      if (targetAlert) {
        setIsAssistantOpen(false);
        openCreateInterventionForAlert(targetAlert);
      }
    } else if (resp.suggestedActionType === 'VIEW_ALERT' && resp.actionTargetId) {
      const targetAlert = alerts.find((a) => a.id === resp.actionTargetId);
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
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  GROUNDED AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in Gurugram municipal telemetry • Zero hallucinations
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAssistantOpen(false)}
            aria-label="Close Assistant"
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
                className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 px-2 py-1 rounded transition text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Assistant Response Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-mono">Synthesizing live Gurugram data...</span>
            </div>
          ) : currentResponse ? (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Strategic Executive Briefing</span>
                </div>
                <p className="text-xs text-slate-900 leading-relaxed font-semibold">
                  {currentResponse.summary}
                </p>
              </div>

              {/* Assessment Breakdown */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Ground-Truth Situation Assessment
                </h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                  {currentResponse.assessment}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Recommended Immediate Operations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {currentResponse.recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 font-medium bg-emerald-50/50 border border-emerald-100 p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
              <div className="bg-[#0b1329] text-white p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Supporting Verification Evidence</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Audit Grade</span>
                </div>

                {/* Computed Metrics Key-Value */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(currentResponse.evidence.computedMetrics).map(([k, v]) => (
                    <div key={k} className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">{k}:</span>
                      <span className="font-mono font-bold text-blue-300">{v}</span>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {currentResponse.suggestedActionType === 'CREATE_INTERVENTION'
                      ? 'Launch Trackable Intervention from this Evidence'
                      : 'Open Detailed Operational Alert'}
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
            placeholder="Ask about Gurugram wards, backlogs, water leaks..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="bg-[#0b1329] hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
