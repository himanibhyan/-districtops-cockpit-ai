import React from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckSquare,
  Building2,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { DashboardSummary, OperationalAlert } from '../../types';
import { MetricKpiCard } from './MetricKpiCard';
import { DepartmentCard } from './DepartmentCard';
import { SeverityBadge } from '../common/StatusBadge';
import { DistrictIntelligenceMap } from '../map/DistrictIntelligenceMap';
import { Intervention } from '../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DistrictOverviewProps {
  data: DashboardSummary;
  alerts: OperationalAlert[];
  interventions: Intervention[];
  selectedAlertId?: string | null;
  onNavigateToAlerts: (department?: string) => void;
  onNavigateToInterventions: () => void;
  onNavigateToDepartments: (department?: string) => void;
  onSelectAlert: (alert: OperationalAlert) => void;
}

export const DistrictOverview: React.FC<DistrictOverviewProps> = ({
  data,
  alerts,
  interventions,
  selectedAlertId,
  onNavigateToAlerts,
  onNavigateToInterventions,
  onNavigateToDepartments,
  onSelectAlert
}) => {
  const topCriticalAlerts = alerts
    .filter(a => a.severity === 'Critical' || a.severity === 'High')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Prominent Demo Notice Box as requested */}
      <div className="rounded-xl bg-amber-500/10 border-2 border-dashed border-amber-500/30 p-4 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight flex items-center gap-2">
              <span>DEMO ENVIRONMENT — Reference datasets are loaded; operational alerts, grievances and intervention scenarios may be simulated.</span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Verified baseline datasets loaded (HMIS Haryana health registry, Jal Jeevan Mission water report, SBM sanitation, and 35 MCG Gurugram ward boundaries); real-time operational incident streams and rapid dispatch interventions are simulated for district command demonstration.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs">
          <span className="font-mono bg-white/80 px-2.5 py-1 rounded border border-amber-300 text-amber-900 font-semibold">
            HYBRID DEMO
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricKpiCard
          title="Open Public Grievances"
          value={data.kpis.openGrievances.value.toLocaleString()}
          unit="active tickets"
          changeVsLastWeek={data.kpis.openGrievances.changeVsLastWeek}
          changeLabel="vs last week"
          icon={FileText}
          highlightColor="blue"
          badge={{ text: '84% inside SLA', variant: 'info' }}
          onClick={() => onNavigateToDepartments('Public Grievances')}
        />

        <MetricKpiCard
          title="High-Priority Alerts"
          value={data.kpis.highPriorityAlerts.value}
          unit="anomalies"
          changeVsLastWeek={data.kpis.highPriorityAlerts.changeVsLastWeek}
          changeLabel="new alerts today"
          icon={AlertTriangle}
          highlightColor="red"
          badge={{
            text: `${data.kpis.highPriorityAlerts.criticalCount} Critical`,
            variant: 'danger'
          }}
          onClick={() => onNavigateToAlerts()}
        />

        <MetricKpiCard
          title="Average Resolution Time"
          value={`${data.kpis.averageResolutionTime.value}`}
          unit="days"
          changeVsLastWeek={data.kpis.averageResolutionTime.changeVsLastWeek}
          changeLabel="days delay"
          icon={Clock}
          highlightColor="amber"
          badge={{
            text: `Target: ${data.kpis.averageResolutionTime.targetDays}.0d`,
            variant: 'warning'
          }}
          onClick={() => onNavigateToDepartments()}
        />

        <MetricKpiCard
          title="Active Interventions"
          value={data.kpis.activeInterventions.value}
          unit="field directives"
          changeVsLastWeek={data.kpis.activeInterventions.changeVsLastWeek}
          changeLabel="active mandates"
          icon={CheckSquare}
          highlightColor="emerald"
          badge={{
            text: `${data.kpis.activeInterventions.completedThisMonth} closed this mo`,
            variant: 'neutral'
          }}
          onClick={onNavigateToInterventions}
        />
      </div>

      {/* Critical Early Warning Callout Banner */}
      {topCriticalAlerts.length > 0 && (
        <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Immediate Attention: High-Risk Anomalies Detected</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                {topCriticalAlerts.length} Action Required
              </span>
            </div>
            <button
              onClick={() => onNavigateToAlerts()}
              className="text-xs font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1"
            >
              View All Alerts <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topCriticalAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="bg-white rounded-lg border border-red-200/80 p-3.5 hover:shadow-md hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[11px] text-slate-500">{alert.id}</span>
                    <SeverityBadge severity={alert.severity} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                    {alert.evidenceSummary}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-medium text-slate-700">{alert.affectedArea}</span>
                  <span className="font-mono font-bold text-red-600">Risk {alert.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* District Operations Intelligence Map Section */}
      <div id="district-intelligence-map" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 text-blue-700">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                District Spatial Intelligence & Incident Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live geographic operational picture for Gurugram (MCG & GMDA jurisdiction) with Survey of India boundary vectors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Interactive Geospatial Layer
            </span>
          </div>
        </div>

        <DistrictIntelligenceMap
          alerts={alerts}
          interventions={interventions}
          selectedAlertId={selectedAlertId}
          onSelectAlert={onSelectAlert}
          onNavigateToInterventions={onNavigateToInterventions}
          height="520px"
        />
      </div>

      {/* Analytics & Operational Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Grievance Intake vs Resolution Velocity</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily incoming public complaints vs cases resolved across all 24 wards (Synthetic Demo Series)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Received
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.resolutionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReceived)"
                  name="Received Tickets"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved Tickets"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Compliance Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">Department SLA Compliance</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Statutory 48h grievance compliance percentage
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.departmentComparisonData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
                  <YAxis type="category" dataKey="department" stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Compliance Rate']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="resolutionCompliance" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>District Target: 85%</span>
            <button
              onClick={() => onNavigateToDepartments()}
              className="text-blue-600 font-medium hover:underline text-xs"
            >
              Full Breakdown →
            </button>
          </div>
        </div>
      </div>

      {/* Department Performance Cards Section */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">
                Department Performance & Service Health
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity and operational metrics for core public utilities
            </p>
          </div>
          <button
            onClick={() => onNavigateToDepartments()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Manage All Departments →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.departmentSummaries.map((dept) => (
            <DepartmentCard
              key={dept.name}
              department={dept}
              onSelect={(deptName) => onNavigateToDepartments(deptName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
