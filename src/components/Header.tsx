import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  ChevronDown,
  Server,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient, BackendHealth } from '../services/apiClient';

export const Header: React.FC = () => {
  const { 
    currentDistrict, 
    setCurrentDistrict, 
    resetDemoData, 
    setIsAssistantOpen,
    alerts 
  } = useApp();

  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [isBackendChecking, setIsBackendChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      const h = await apiClient.getHealth();
      if (mounted) {
        setBackendHealth(h);
        setIsBackendChecking(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <header className="bg-[#0b1329] border-b border-slate-800 text-white sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md">
      {/* Brand & Wordmark */}
      <div className="flex items-center space-x-3.5">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-400/30">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-wider text-slate-100 font-mono">DISTRICTOPS COCKPIT AI</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-mono">
              Enterprise v2.8
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            "From Scattered Data to Decisive Action." • Theme: <span className="text-slate-300">Better Communities, Better Governance</span>
          </p>
        </div>
      </div>

      {/* Center: District Selector & Backend Live Status */}
      <div className="hidden md:flex items-center space-x-3">
        <div className="relative">
          <select 
            value={currentDistrict} 
            onChange={(e) => setCurrentDistrict(e.target.value)}
            className="appearance-none bg-slate-900/90 text-xs font-semibold text-slate-200 border border-slate-700 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
          >
            <option value="Central District (HQ)">Indraprastha Central (HQ)</option>
            <option value="North District">North Administrative Zone</option>
            <option value="South-West Zone">South-West Industrial Corridor</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px]">28 Oct 2026, 11:00 IST</span>
        </div>

        {/* Backend API live indicator */}
        {backendHealth ? (
          <div 
            title={`Connected to FastAPI Backend at http://localhost:8000 (IHHL: ${backendHealth.datasets.sanitation.rows} rows, HMIS: ${backendHealth.datasets.hmis.rows} rows, Water: ${backendHealth.datasets.water_coverage.rows} states/UTs, KML: ${backendHealth.datasets.kml_wards.features} wards)`}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold tracking-wide"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>API CONNECTED (PORT 8000)</span>
          </div>
        ) : isBackendChecking ? (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700 text-slate-400 text-[10px] font-semibold">
            <Server className="w-3 h-3 text-slate-400 animate-spin" />
            <span>CONNECTING API...</span>
          </div>
        ) : (
          <div 
            title="Backend offline — utilizing local deterministic sandbox."
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-semibold"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>SYNTHETIC SANDBOX</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          title="Reset demonstration database to pristine baseline"
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded transition shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:rotate-180 transition-transform duration-500" />
          <span className="hidden xl:inline">Reset Demo</span>
        </button>

        {/* AI Decision Assistant Button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center space-x-2 text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-3 py-1.5 rounded shadow-sm border border-amber-400/30 transition group"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span>Decision Assistant</span>
          {criticalAlertsCount > 0 && (
            <span className="bg-red-950 text-red-200 border border-red-500/40 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {criticalAlertsCount}
            </span>
          )}
        </button>

        {/* Administrator Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
            DM
          </div>
          <div className="hidden lg:block text-left text-xs leading-tight">
            <p className="font-semibold text-slate-200">K. R. Varma, IAS</p>
            <p className="text-[10px] text-slate-400">District Magistrate</p>
          </div>
        </div>
      </div>
    </header>
  );
};
