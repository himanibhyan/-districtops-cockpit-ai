import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  AlertTriangle, 
  Inbox, 
  CheckSquare, 
  Calculator,
  Activity,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, incidents, grievances, alerts, interventions } = useApp();

  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const pendingGrievances = grievances.filter(g => g.status !== 'RESOLVED').length;
  const activeInterventions = interventions.filter(i => i.status !== 'RESOLVED').length;

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Command Center',
      sublabel: 'District Executive Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'alerts' as const,
      label: 'Early Warning Engine',
      sublabel: 'Risk Scores & Detection',
      icon: ShieldAlert,
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} Alerts` : null,
      badgeColor: 'bg-red-500/90 text-white font-mono',
    },
    {
      id: 'interventions' as const,
      label: 'Intervention Tracker',
      sublabel: 'Action Tracking & Notes',
      icon: CheckSquare,
      badge: activeInterventions > 0 ? activeInterventions : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold font-mono',
    },
    {
      id: 'incidents' as const,
      label: 'Incident Intelligence',
      sublabel: 'Field Triage & Repairs',
      icon: AlertTriangle,
      badge: activeIncidents > 0 ? activeIncidents : null,
      badgeColor: 'bg-red-500 text-white font-mono',
    },
    {
      id: 'grievances' as const,
      label: 'Grievance Management',
      sublabel: 'Citizen Service Records',
      icon: Inbox,
      badge: pendingGrievances > 0 ? pendingGrievances : null,
      badgeColor: 'bg-slate-700 text-slate-200 font-mono',
    },
    {
      id: 'planning' as const,
      label: 'Resource Simulator',
      sublabel: 'Hypothetical Scenarios',
      icon: Calculator,
      badge: 'SIM',
      badgeColor: 'bg-sky-950 border border-sky-500/30 text-sky-300 text-[9px] font-mono',
    },
  ];

  return (
    <aside className="w-64 bg-[#070b14] border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
          Operations Workflow
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group relative ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600/20 to-transparent text-white border-l-4 border-amber-500'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold leading-none">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">{item.sublabel}</p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Operational Pipeline Monitor */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px]">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Telemetry Ingestion</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Risk Sentry</span>
            </span>
            <span className="text-amber-400 font-mono text-[10px]">ARMED</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 flex justify-between">
            <span>Workflow Step:</span>
            <span className="font-mono text-amber-400 font-semibold uppercase">
              {activeTab}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
