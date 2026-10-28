import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, TrendingDown, HelpCircle, Layers, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId } from '../../types';

export const ResourcePlanningView: React.FC = () => {
  const { grievances } = useApp();

  const [selectedDept, setSelectedDept] = useState<DepartmentId>('WATER_SUPPLY');

  // Compute actual backlog for selected department
  const actualBacklog = grievances.filter(
    (g) => g.department === selectedDept && g.status !== 'RESOLVED'
  ).length || 8;

  // Scenario A (Status Quo Baseline)
  const [teamsA, setTeamsA] = useState<number>(2);
  const [avgHoursA, setAvgHoursA] = useState<number>(4.5);
  const [workHoursA, setWorkHoursA] = useState<number>(8);

  // Scenario B (Emergency Surge Deployment)
  const [teamsB, setTeamsB] = useState<number>(5);
  const [avgHoursB, setAvgHoursB] = useState<number>(3.5);
  const [workHoursB, setWorkHoursB] = useState<number>(10);

  // Formulas
  const totalWorkloadA = actualBacklog * avgHoursA;
  const dailyCapacityA = teamsA * workHoursA;
  const daysA = Math.max(0.5, Math.round((totalWorkloadA / Math.max(1, dailyCapacityA)) * 10) / 10);

  const totalWorkloadB = actualBacklog * avgHoursB;
  const dailyCapacityB = teamsB * workHoursB;
  const daysB = Math.max(0.5, Math.round((totalWorkloadB / Math.max(1, dailyCapacityB)) * 10) / 10);

  const daysSaved = Math.round((daysA - daysB) * 10) / 10;
  const percentFaster = Math.round(((daysA - daysB) / Math.max(0.1, daysA)) * 100);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold font-mono tracking-wide text-slate-900 uppercase">
                Workload & Resource Capacity Simulator
              </h2>
              <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-500/30 font-mono font-semibold px-2 py-0.5 rounded">
                Hypothetical Estimation Model
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate field repair capacity, evaluate squad re-allocation, and project completion days using transparent queueing formulas.
            </p>
          </div>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Target Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as DepartmentId)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {Object.values(DEPARTMENTS).map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A: Baseline */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Scenario A
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Baseline Queue Allocation
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Status Quo
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Active Backlog Cases:</span>
                <span className="font-mono font-bold text-slate-900">{actualBacklog} tickets</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Field Teams Deployed:</span>
                <span className="font-mono font-bold text-slate-900">{teamsA} squads</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={teamsA}
                onChange={(e) => setTeamsA(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Avg Hours Required per Case:</span>
                <span className="font-mono font-bold text-slate-900">{avgHoursA} hrs</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={0.5}
                value={avgHoursA}
                onChange={(e) => setAvgHoursA(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Work Hours per Day:</span>
                <span className="font-mono font-bold text-slate-900">{workHoursA} hrs/day</span>
              </div>
              <input
                type="range"
                min={6}
                max={16}
                value={workHoursA}
                onChange={(e) => setWorkHoursA(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>
          </div>

          {/* Outcome Result Box A */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Estimated Resolution Timeline
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {daysA}
              </span>
              <span className="text-xs font-semibold text-slate-600">Work Days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Total workload: {totalWorkloadA}h • Daily output: {dailyCapacityA}h/day
            </p>
          </div>
        </div>

        {/* Scenario B: Surge */}
        <div className="bg-white border border-amber-300 ring-1 ring-amber-500/20 rounded-lg p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">
                Scenario B
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Emergency Mutual-Aid Surge
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              Intervention Target
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Active Backlog Cases:</span>
                <span className="font-mono font-bold text-slate-900">{actualBacklog} tickets</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Field Teams Deployed:</span>
                <span className="font-mono font-bold text-amber-800">{teamsB} squads</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={teamsB}
                onChange={(e) => setTeamsB(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Avg Hours Required per Case:</span>
                <span className="font-mono font-bold text-amber-800">{avgHoursB} hrs</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={0.5}
                value={avgHoursB}
                onChange={(e) => setAvgHoursB(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Work Hours per Day:</span>
                <span className="font-mono font-bold text-amber-800">{workHoursB} hrs/day</span>
              </div>
              <input
                type="range"
                min={6}
                max={16}
                value={workHoursB}
                onChange={(e) => setWorkHoursB(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>
          </div>

          {/* Outcome Result Box B */}
          <div className="pt-3 border-t border-amber-100 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-900 uppercase tracking-wider block">
              Estimated Resolution Timeline
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-bold font-mono text-amber-700">
                {daysB}
              </span>
              <span className="text-xs font-semibold text-slate-600">Work Days</span>
              {daysSaved > 0 && (
                <span className="ml-2 font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  -{daysSaved} Days ({percentFaster}% Faster)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              Total workload: {totalWorkloadB}h • Daily output: {dailyCapacityB}h/day
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Formula Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-1 font-mono">
        <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          Simulation Formula & Mathematical Assumptions:
        </p>
        <p>• Total Workload Hours = (Backlog Cases) × (Avg Hours per Case)</p>
        <p>• Daily Processing Capacity = (Teams Deployed) × (Effective Work Hours per Day)</p>
        <p>• Estimated Resolution Days = Total Workload Hours ÷ Daily Processing Capacity</p>
        <p className="text-[10px] text-slate-400 italic pt-1">
          *Note: This simulator produces hypothetical capacity estimations to assist administrative resource allocation and does not constitute a certified engineering guarantee.
        </p>
      </div>
    </div>
  );
};
