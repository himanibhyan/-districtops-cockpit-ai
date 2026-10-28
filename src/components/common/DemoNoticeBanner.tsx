import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

interface DemoNoticeBannerProps {
  isDemo?: boolean;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = () => {
  return (
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-medium tracking-wide">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>OPERATIONAL TELEMETRY GATEWAY</span>
          <span className="text-slate-300 font-normal">|</span>
        </div>
        <span className="text-slate-500 text-[11px]">
          Reference datasets loaded (HMIS, JJM, SBM, MCG GIS) • Incident telemetry dynamic scenario active
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Audit Trail Connected
        </span>
      </div>
    </div>
  );
};
