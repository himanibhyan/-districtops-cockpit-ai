import React from 'react';
import {
  LayoutDashboard,
  Building2,
  AlertOctagon,
  ClipboardCheck,
  Shield,
  Activity,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type NavTab = 'overview' | 'departments' | 'alerts' | 'interventions';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  criticalAlertCount: number;
  activeInterventionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertCount,
  activeInterventionCount
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'District Overview',
      icon: LayoutDashboard,
      description: 'Unified administrative metrics'
    },
    {
      id: 'departments' as NavTab,
      label: 'Department Performance',
      icon: Building2,
      description: 'Water, Sanitation, Health, Grievances'
    },
    {
      id: 'alerts' as NavTab,
      label: 'Early Warnings',
      icon: AlertOctagon,
      description: 'Prioritized risk & anomaly radar',
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} Critical` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    {
      id: 'interventions' as NavTab,
      label: 'Intervention Center',
      icon: ClipboardCheck,
      description: 'Directives & corrective tracking',
      badge: activeInterventionCount > 0 ? `${activeInterventionCount} Active` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    }
  ];

  return (
    <aside className="w-72 bg-[#0b1120] text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand & Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">DistrictOps</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                COCKPIT AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
              From fragmented data to decisive governance.
            </p>
          </div>
        </div>
      </div>

      {/* District Context Badge */}
      <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span className="uppercase font-semibold tracking-wider text-slate-500">Jurisdiction</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE RADAR
          </span>
        </div>
        <div className="font-medium text-slate-200">Gurugram District, Haryana</div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
          <span>DC & GMDA Command HQ</span>
          <span className="font-mono text-slate-500 text-[10px]">MCG Zones 1–4</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-dark-scroll">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left px-3.5 py-3 rounded-lg flex items-center gap-3 transition-colors group relative ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-900/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {item.description}
                </div>
              </div>

              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Callout */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Decision Assistant</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Root-cause triage with transparent uncertainty disclosures on all alert panels.
        </p>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-800 bg-[#070b14] text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Telemetry Stream v0.1</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">PROD-DEMO</span>
      </div>
    </aside>
  );
};
