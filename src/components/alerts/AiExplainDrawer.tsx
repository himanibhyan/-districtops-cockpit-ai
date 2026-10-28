import React, { useState } from 'react';
import { AiExplainResponse, OperationalAlert } from '../../types';
import { apiService } from '../../services/api';
import {
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface AiExplainDrawerProps {
  alert: OperationalAlert;
  onCreateIntervention?: (suggestedTitle: string, suggestedDept: string) => void;
}

export const AiExplainDrawer: React.FC<AiExplainDrawerProps> = ({
  alert,
  onCreateIntervention
}) => {
  const [explanation, setExplanation] = useState<AiExplainResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.explainAlert(alert.id);
      setExplanation(response.data);
      setHasRequested(true);
    } catch (err) {
      console.error('Failed to run AI explain:', err);
      setError('Unable to retrieve AI explanation. Please check endpoint connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 rounded-xl border border-slate-800 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">AI Decision Assistant</h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                POST /api/alerts/{alert.id}/explain
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Root-cause telemetry synthesis & decision-support reasoning
            </p>
          </div>
        </div>

        {!hasRequested ? (
          <button
            onClick={handleExplain}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Telemetry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain This Alert</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleExplain}
            disabled={isLoading}
            title="Re-run synthesis"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate</span>
          </button>
        )}
      </div>

      {/* Initial Callout prior to analysis */}
      {!hasRequested && !isLoading && (
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-sm font-semibold text-slate-200">
              Generate AI Decision Dossier
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Click <strong className="text-blue-400">“Explain This Alert”</strong> to run an algorithmic diagnostic identifying metric shifts, potential root-causes, trade-off matrices, and crucial operational uncertainties.
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-8 space-y-4 text-center">
          <Loader2 className="w-7 h-7 text-blue-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-mono">
            Evaluating historical baseline vs current grievance cluster in {alert.affectedArea}...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Full AI Explanation Result */}
      {explanation && !isLoading && (
        <div className="mt-5 space-y-5 text-xs">
          {/* Section 1: What Changed */}
          <div className="bg-slate-800/60 rounded-lg border border-slate-700/70 p-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider mb-2.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>1. What Changed (Anomalous Shift)</span>
            </div>
            <ul className="space-y-2">
              {explanation.whatChanged.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Which Metrics Support the Alert */}
          <div className="bg-slate-800/60 rounded-lg border border-slate-700/70 p-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>2. Supporting Telemetric Evidence</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {explanation.metricsEvidence.map((ev, index) => (
                <div
                  key={index}
                  className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-200 text-[11px]">{ev.metric}</span>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          ev.confidence === 'High'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ev.confidence} Confidence
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{ev.finding}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Considered Corrective Actions */}
          <div className="bg-slate-800/60 rounded-lg border border-slate-700/70 p-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3. Considered Corrective Interventions</span>
            </div>
            <div className="space-y-3">
              {explanation.consideredActions.map((act, index) => (
                <div
                  key={index}
                  className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-slate-200 text-xs">
                      {act.action}
                    </div>
                    {onCreateIntervention && (
                      <button
                        onClick={() => onCreateIntervention(act.action, alert.department)}
                        className="shrink-0 text-[11px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                      >
                        Adopt Directives
                      </button>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="text-emerald-400/90 bg-emerald-950/40 p-2 rounded border border-emerald-900/50">
                      <strong>Expected Impact:</strong> {act.expectedImpact}
                    </div>
                    {act.tradeoff && (
                      <div className="text-amber-400/90 bg-amber-950/40 p-2 rounded border border-amber-900/50">
                        <strong>Operational Tradeoff:</strong> {act.tradeoff}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: What Remains Uncertain (Mandatory Ground-Truth Disclaimer) */}
          <div className="bg-amber-950/30 rounded-lg border border-amber-600/40 p-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>4. Operational Boundaries & What Remains Uncertain</span>
            </div>
            <ul className="space-y-2 mb-3">
              {explanation.uncertainties.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-amber-200/90 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Non-fabrication guarantee notice */}
            <div className="p-2.5 rounded bg-amber-900/40 border border-amber-700/50 flex items-start gap-2 text-[11px] text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Ground-Truth Integrity Rule:</strong> The AI does not claim to have physically inspected on-site conditions or confirmed water chemical assays. Ground-truth physical inspection by authorized municipal personnel is legally mandatory before irreversible sanctions.
              </div>
            </div>
          </div>

          {/* Footer timestamp & disclaimer */}
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Synthesis timestamp: {new Date(explanation.generatedAt).toLocaleTimeString()}</span>
            <span className="font-mono">Model: Operational Logic v1.2</span>
          </div>
        </div>
      )}
    </div>
  );
};
