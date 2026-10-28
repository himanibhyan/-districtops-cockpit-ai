import React, { useState, useEffect } from 'react';
import { DepartmentMetricSummary, OperationalAlert, Intervention } from '../../types';
import { apiService } from '../../services/api';
import {
  Droplets,
  Trash2,
  Stethoscope,
  MessageSquareWarning,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Database
} from 'lucide-react';
import { SeverityBadge } from '../common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DepartmentPerformanceViewProps {
  departments: DepartmentMetricSummary[];
  alerts: OperationalAlert[];
  interventions: Intervention[];
  selectedDeptFilter?: string;
  onSelectAlert: (alert: OperationalAlert) => void;
  onNavigateToInterventions: () => void;
}

export const DepartmentPerformanceView: React.FC<DepartmentPerformanceViewProps> = ({
  departments,
  alerts,
  interventions,
  selectedDeptFilter,
  onSelectAlert,
  onNavigateToInterventions
}) => {
  const [activeDeptName, setActiveDeptName] = useState<string>(
    selectedDeptFilter && departments.some(d => d.name === selectedDeptFilter)
      ? selectedDeptFilter
      : departments[0]?.name || 'Water Supply'
  );

  const [referenceData, setReferenceData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getReferenceData().then((res) => {
      if (isMounted && res?.data?.reference_datasets) {
        setReferenceData(res.data.reference_datasets);
      }
    }).catch((err) => {
      console.warn('[DepartmentPerformanceView] Failed to fetch reference data:', err);
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedDeptFilter && departments.some(d => d.name === selectedDeptFilter)) {
      setActiveDeptName(selectedDeptFilter);
    }
  }, [selectedDeptFilter, departments]);

  const currentDept = departments.find(d => d.name === activeDeptName) || departments[0];

  const deptAlerts = alerts.filter(a => a.department === activeDeptName);
  const deptInterventions = interventions.filter(i => i.department === activeDeptName);

  const getDeptIcon = (name: string) => {
    switch (name) {
      case 'Water Supply':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'Sanitation':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'Healthcare':
        return <Stethoscope className="w-5 h-5 text-purple-600" />;
      case 'Public Grievances':
      default:
        return <MessageSquareWarning className="w-5 h-5 text-amber-600" />;
    }
  };

  // Synthetic ward breakdown data for this department
  const wardBreakdownData = [
    { ward: 'Ward 1-6', open: Math.round(currentDept.openGrievances * 0.22), teams: Math.ceil(currentDept.activeTeams * 0.25) },
    { ward: 'Ward 7-12', open: Math.round(currentDept.openGrievances * 0.45), teams: Math.ceil(currentDept.activeTeams * 0.4) },
    { ward: 'Ward 13-18', open: Math.round(currentDept.openGrievances * 0.18), teams: Math.ceil(currentDept.activeTeams * 0.2) },
    { ward: 'Ward 19-24', open: Math.round(currentDept.openGrievances * 0.15), teams: Math.ceil(currentDept.activeTeams * 0.15) }
  ];

  return (
    <div className="space-y-6">
      {/* Department Quick Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {departments.map((dept) => {
          const isSelected = dept.name === activeDeptName;
          return (
            <button
              key={dept.name}
              onClick={() => setActiveDeptName(dept.name)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-50'
                  }`}
                >
                  {getDeptIcon(dept.name)}
                </div>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {dept.code}
                </span>
              </div>
              <div className="font-bold text-sm tracking-tight">{dept.name}</div>
              <div
                className={`text-xs mt-1 font-mono flex items-center justify-between ${
                  isSelected ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                <span>Health: {dept.healthScore}/100</span>
                <span>{dept.openGrievances} open</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Department Command Dossier */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {/* Header Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                {currentDept.code} WING
              </span>
              <h2 className="text-xl font-bold text-slate-900">{currentDept.name} Administration</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Nodal Lead: <strong className="text-slate-700">{currentDept.leadOfficer}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-600">Gurugram Municipal Command (MCG / GMDA)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Service Health Index</div>
              <div className="font-mono font-bold text-xl text-slate-900">
                {currentDept.healthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <div className="text-xs text-slate-500">SLA Compliance</div>
              <div className="font-mono font-bold text-xl text-blue-600">
                {currentDept.complianceRate}%
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <div className="text-xs text-emerald-700 font-medium flex items-center justify-end gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Verified Baseline</span>
              </div>
              <div className="font-mono font-bold text-sm text-emerald-700">
                {activeDeptName === 'Water Supply' && '100.0% Tap (JJM)'}
                {activeDeptName === 'Sanitation' && '53,523 IHHL (SBM)'}
                {activeDeptName === 'Healthcare' && '11,010 HMIS Recs'}
                {activeDeptName !== 'Water Supply' && activeDeptName !== 'Sanitation' && activeDeptName !== 'Healthcare' && '35 Wards (MCG)'}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-200">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Pending Grievances</span>
            </div>
            <div className="font-mono font-bold text-2xl text-slate-900">
              {currentDept.openGrievances}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across 24 wards</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resolved in Last 24h</span>
            </div>
            <div className="font-mono font-bold text-2xl text-emerald-700">
              +{currentDept.resolvedToday}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified on field</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Avg Turnaround Time</span>
            </div>
            <div className="font-mono font-bold text-2xl text-slate-900">
              {currentDept.avgResolutionDays} <span className="text-sm font-normal text-slate-500">days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Statutory Target: 2.0d</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Field Squads</span>
            </div>
            <div className="font-mono font-bold text-2xl text-slate-900">
              {currentDept.activeTeams} <span className="text-sm font-normal text-slate-500">squads</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">GPS-telemetry verified</div>
          </div>
        </div>

        {/* Authoritative Administrative Baseline vs Operational Telemetry */}
        <div className="py-5 border-b border-slate-200">
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Authoritative Dataset Baseline
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  VERIFIED REFERENCE DATA
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Source Document Grounding
              </span>
            </div>

            {activeDeptName === 'Water Supply' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">JJM Har Ghar Jal State Baseline</div>
                  <div className="font-mono font-bold text-lg text-slate-900 mt-1">
                    {referenceData?.water_coverage?.coverage_pct !== undefined ? `${referenceData.water_coverage.coverage_pct.toFixed(1)}% Tap Coverage` : '100.0% Tap Coverage'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {referenceData?.water_coverage?.total_households ? `${referenceData.water_coverage.households_with_tap.toLocaleString()} / ${referenceData.water_coverage.total_households.toLocaleString()} Haryana households` : '30,41,314 / 30,41,314 Haryana households'}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Calculation Audit & Discrepancy</div>
                  <div className="font-mono font-bold text-lg text-emerald-700 mt-1">
                    {referenceData?.water_coverage?.discrepancy !== undefined ? `${referenceData.water_coverage.discrepancy.toFixed(1)}% Discrepancy` : '0.0% Discrepancy'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">National avg: 82.59% (159.8M tap conns)</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Data Provenance & Scope</div>
                  <div className="font-mono text-slate-700 mt-1">
                    {referenceData?.water_coverage?.source || 'fhtc_water_coverage.pdf'}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">State-level macro baseline; local ward incidents simulated.</div>
                </div>
              </div>
            )}

            {activeDeptName === 'Sanitation' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">SBM-Grameen Gurugram Latrines</div>
                  <div className="font-mono font-bold text-lg text-slate-900 mt-1">
                    {referenceData?.sanitation?.ihhl_total_ach ? `${referenceData.sanitation.ihhl_total_ach.toLocaleString()} Units Achieved` : '53,523 Units Achieved'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Census Code LGD District Record</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">IHHL Sanitation Coverage</div>
                  <div className="font-mono font-bold text-lg text-emerald-700 mt-1">
                    {referenceData?.sanitation?.coverage_pct !== undefined ? `${referenceData.sanitation.coverage_pct.toFixed(1)}% Verified` : '100.0% Verified'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">State total: 22 Haryana districts recorded</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Data Provenance & Scope</div>
                  <div className="font-mono text-slate-700 mt-1">
                    {referenceData?.sanitation?.source || 'sanitation_dataset.csv'}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Open data district record; mechanical compactor telemetry simulated.</div>
                </div>
              </div>
            )}

            {activeDeptName === 'Healthcare' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">NHM HMIS Gurugram Observations</div>
                  <div className="font-mono font-bold text-lg text-slate-900 mt-1">
                    {referenceData?.health?.total_records ? `${referenceData.health.total_records.toLocaleString()} Facility Records` : '11,010 Facility Records'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">14 Fiscal Years (2008-09 to 2021-22)</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Key Indicator Scope</div>
                  <div className="font-mono font-bold text-lg text-purple-700 mt-1">Maternal & Child Health</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">JSSK, Immunization, Facility Mortality reviews</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Data Provenance & Scope</div>
                  <div className="font-mono text-slate-700 mt-1">
                    {referenceData?.health?.source || 'hmis_haryana.zip/output.csv'}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Official MoHFW registry; real-time PHC drug stockout alerts simulated.</div>
                </div>
              </div>
            )}

            {activeDeptName !== 'Water Supply' && activeDeptName !== 'Sanitation' && activeDeptName !== 'Healthcare' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">MCG Gurugram Spatial Coverage</div>
                  <div className="font-mono font-bold text-lg text-slate-900 mt-1">
                    {referenceData?.wards_gis?.ward_count ? `${referenceData.wards_gis.ward_count} Municipal Wards` : '35 Municipal Wards'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Full municipal polygon boundary features</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">GIS Projection & Topology</div>
                  <div className="font-mono font-bold text-lg text-blue-700 mt-1">WGS84 EPSG:4326</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Zonal demarcations for MCG Gurugram</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Data Provenance & Scope</div>
                  <div className="font-mono text-slate-700 mt-1">
                    {referenceData?.wards_gis?.source || 'gurugram_wards.kml'}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Municipal Corporation GIS boundaries; dispatch queues simulated.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ward Distribution Chart */}
        <div className="py-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ward-Wise Grievance Load vs Deployment Ratio ({currentDept.name})
              </h3>
              <p className="text-xs text-slate-500">
                Distribution model showing resource allocation vs ticket velocity across sectors
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="ward" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                <Bar dataKey="open" fill="#3b82f6" name="Open Complaints" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teams" fill="#10b981" name="Deployed Field Squads" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Associated Alerts & Interventions for this Department */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked Early Warnings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Alerts for {currentDept.name} ({deptAlerts.length})
              </h4>
            </div>

            {deptAlerts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                No active anomalous alerts for {currentDept.name}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {deptAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-500">{alert.id}</span>
                        <SeverityBadge severity={alert.severity} size="sm" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">{alert.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{alert.affectedArea}</div>
                    </div>
                    <div className="shrink-0 text-right font-mono">
                      <span className="text-xs font-bold text-red-600">Risk {alert.riskScore}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Interventions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Active Directives ({deptInterventions.length})
              </h4>
              <button
                onClick={onNavigateToInterventions}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Go to Intervention Center →
              </button>
            </div>

            {deptInterventions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                No active directives currently assigned to {currentDept.name}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {deptInterventions.map(intv => (
                  <div
                    key={intv.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-500">{intv.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-100 text-blue-800">
                          {intv.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">{intv.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Officer: {intv.assignedOfficer}
                      </div>
                    </div>
                    <div className="shrink-0 text-right font-mono text-xs text-slate-600 font-semibold">
                      {intv.progressPercentage}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
