import React from 'react';
import {
  LayoutDashboard,
  Building2,
  AlertOctagon,
  ClipboardCheck,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
  MapPin,
  Inbox,
  Calculator
} from 'lucide-react';
import { NavTab, useApp } from '../../context/AppContext';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    interventions,
    grievances,
    setIsAssistantOpen
  } = useApp();

  const criticalAlertCount = alerts.filter((a) => a.severity === 'Critical').length;
  const activeInterventionCount = interventions.filter(
    (i) => i.status !== 'Completed' && i.status !== 'RESOLVED'
  ).length;
  const pendingGrievanceCount = grievances.filter((g) => g.status !== 'RESOLVED').length;

  const coreNavItems: NavItem[] = [
    {
      id: 'overview',
      label: 'District Overview',
      icon: LayoutDashboard,
      description: 'Unified administrative metrics'
    },
    {
      id: 'map',
      label: 'GIS Intelligence Map',
      icon: MapPin,
      description: 'Gurugram spatial incident radar',
      badge: 'GIS Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    {
      id: 'departments',
      label: 'Department Performance',
      icon: Building2,
      description: 'Water, Sanitation, Health, PWD'
    }
  ];

  const triageNavItems: NavItem[] = [
    {
      id: 'alerts',
      label: 'Early Warnings',
      icon: AlertOctagon,
      description: 'Algorithmic risk radar',
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} Critical` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    {
      id: 'grievances',
      label: 'Citizen Grievances',
      icon: Inbox,
      description: 'Unified public ticket registry',
      badge: pendingGrievanceCount > 0 ? `${pendingGrievanceCount} Pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    }
  ];

  const actionNavItems: NavItem[] = [
    {
      id: 'interventions',
      label: 'Intervention Center',
      icon: ClipboardCheck,
      description: 'Directives & field squad dispatch',
      badge: activeInterventionCount > 0 ? `${activeInterventionCount} Active` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'planning',
      label: 'Resource Simulator',
      icon: Calculator,
      description: 'Capacity & backlog planning'
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1 mb-3">
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors group relative cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-900/50'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div
                className={`text-[10px] truncate mt-0.5 ${
                  isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {item.description}
              </div>
            </div>

            {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-72 bg-[#0b1120] text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand & Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm tracking-tight font-mono">DistrictOps</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                COCKPIT AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
              From fragmented data to decisive governance.
            </p>
          </div>
        </div>
      </div>

      {/* District Context Badge */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5 font-mono">
          <span className="uppercase font-semibold tracking-wider text-slate-500">Jurisdiction</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            GURUGRAM HQ
          </span>
        </div>
        <div className="font-medium text-slate-200 text-xs">Haryana, India</div>
        <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
          <span>DC & GMDA Command</span>
          <span className="font-mono text-slate-500 text-[9px]">Wards W-01 to W-24</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        {renderNavGroup('Command Radar', coreNavItems)}
        {renderNavGroup('Intelligence & Triage', triageNavItems)}
        {renderNavGroup('Action & Simulator', actionNavItems)}
      </nav>

      {/* AI Decision Assistant Quick Launch Card */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-br from-slate-900 to-[#0e1629] border border-amber-500/30 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Decision Assistant</span>
          </div>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded border border-amber-500/30">
            Grounded
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
          Root-cause synthesis & telemetry cross-correlation with cited evidence.
        </p>
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="w-full bg-amber-600/90 hover:bg-amber-500 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Launch AI Assistant</span>
        </button>
      </div>

      {/* Footer / System Status */}
      <div className="p-2.5 border-t border-slate-800 bg-[#070b14] text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span>Telemetry Stream v1.0</span>
        </div>
        <span className="text-slate-400">GURUGRAM-UNIFIED</span>
      </div>
    </aside>
  );
};
