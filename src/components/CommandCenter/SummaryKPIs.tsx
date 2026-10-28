import React from 'react';
import { 
  Flame, 
  ShieldAlert, 
  FileSpreadsheet, 
  Clock, 
  CheckSquare, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDashboardKPIs } from '../../services/riskEngine';

export const SummaryKPIs: React.FC = () => {
  const { incidents, grievances, alerts, interventions, setActiveTab, setSelectedAlert } = useApp();
  const kpis = calculateDashboardKPIs(incidents, grievances, alerts, interventions);

  const cards = [
    {
      title: 'Active Incidents',
      value: kpis.activeIncidents,
      subtext: `${kpis.criticalIncidents} Critical Priority`,
      trend: `${kpis.comparison.incidentsDelta > 0 ? '+' : ''}${kpis.comparison.incidentsDelta} vs 7d ago`,
      trendType: kpis.comparison.incidentsDelta > 0 ? 'negative' : 'positive',
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20',
      onClick: () => setActiveTab('incidents'),
    },
    {
      title: 'Early Warning Alerts',
      value: kpis.criticalAlertsCount,
      subtext: `Max Risk Score: 92/100`,
      trend: `${kpis.totalAlertsCount} automated patterns`,
      trendType: 'negative',
      icon: ShieldAlert,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      onClick: () => setActiveTab('alerts'),
    },
    {
      title: 'Unresolved Backlog',
      value: kpis.unresolvedGrievances,
      subtext: `Out of ${kpis.totalGrievances} logged complaints`,
      trend: `+${kpis.comparison.grievancesSurgePercent}% in 48h`,
      trendType: 'negative',
      icon: FileSpreadsheet,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      onClick: () => setActiveTab('grievances'),
    },
    {
      title: 'Avg Resolution Turnaround',
      value: `${kpis.avgResolutionTimeHours}h`,
      subtext: 'Across resolved tickets',
      trend: `+${kpis.comparison.resolutionTimeDeteriorationHours}h deterioration`,
      trendType: 'negative',
      icon: Clock,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      onClick: () => setActiveTab('alerts'),
    },
    {
      title: 'Active Interventions',
      value: kpis.activeInterventionsCount,
      subtext: 'Executive tasks in progress',
      trend: '100% SLA Tracking',
      trendType: 'positive',
      icon: CheckSquare,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      onClick: () => setActiveTab('interventions'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                  {card.title}
                </p>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 group-hover:text-amber-700 transition-colors">
                    {card.value}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg border ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 truncate max-w-[110px]">
                {card.subtext}
              </span>
              <span
                className={`font-mono font-semibold px-1.5 py-0.5 rounded ${
                  card.trendType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
