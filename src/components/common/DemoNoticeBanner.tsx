import React from 'react';
import { AlertTriangle, Database, ShieldCheck } from 'lucide-react';

interface DemoNoticeBannerProps {
  isDemo?: boolean;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({ isDemo = true }) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
        </span>
        <div className="flex items-center gap-1.5 font-semibold tracking-wide uppercase">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>DEMO ENVIRONMENT</span>
          <span className="text-amber-400 font-normal">|</span>
        </div>
        <span className="text-amber-800">
          Reference datasets are loaded; operational alerts, grievances and intervention scenarios may be simulated.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300 font-mono text-[11px]">
          <Database className="w-3 h-3 text-amber-700" />
          {isDemo ? 'Reference Datasets + Synthetic Incidents' : 'Live Gateway + Reference Datasets'}
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3 h-3 text-slate-500" />
          Tamper-Evident Ops Audit Active
        </span>
      </div>
    </div>
  );
};
