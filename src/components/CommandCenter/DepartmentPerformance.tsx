import React from 'react';
import { BarChart3, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDepartmentMetrics } from '../../services/riskEngine';
import { DepartmentId } from '../../types';

export const DepartmentPerformance: React.FC = () => {
  const { incidents, grievances, setFilterDepartment, setActiveTab } = useApp();
  const metrics = calculateDepartmentMetrics(incidents, grievances);

  const handleDeptClick = (deptId: DepartmentId) => {
    setFilterDepartment(deptId);
    setActiveTab('grievances');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Department Performance & SLA Adherence
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            Click row to filter grievances
          </span>
        </div>

        {/* List of Departments */}
        <div className="space-y-2.5">
          {metrics.map((dept) => {
            const hasBreaches = dept.slaBreachCount > 0;
            return (
              <div
                key={dept.departmentId}
                onClick={() => handleDeptClick(dept.departmentId)}
                className="group p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    ></span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800 transition-colors">
                      {dept.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                      {dept.code}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Backlog: <strong className="text-slate-800 font-mono">{dept.unresolvedCount}</strong>
                    </span>
                    {hasBreaches && (
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 font-semibold px-1.5 py-0.2 rounded font-mono">
                        {dept.slaBreachCount} High-Priority
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dept.resolutionRatePercent}%`,
                        backgroundColor: dept.resolutionRatePercent < 60 ? '#ef4444' : dept.color,
                      }}
                    ></div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-600 w-10 text-right">
                    {dept.resolutionRatePercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>District standard SLA: 18 - 48 Hours</span>
        </span>
        <button
          onClick={() => setActiveTab('grievances')}
          className="text-amber-700 font-semibold hover:underline"
        >
          View Full Grievance Registry →
        </button>
      </div>
    </div>
  );
};
