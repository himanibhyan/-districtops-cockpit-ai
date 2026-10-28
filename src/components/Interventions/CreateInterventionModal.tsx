import React, { useState } from 'react';
import { X, CheckSquare, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS, WARDS } from '../../data/mockData';
import { DepartmentId, RiskAlert } from '../../types';

interface CreateInterventionModalProps {
  initialAlert?: RiskAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInterventionModal: React.FC<CreateInterventionModalProps> = ({
  initialAlert,
  isOpen,
  onClose,
}) => {
  const { createIntervention, setActiveTab } = useApp();

  const [title, setTitle] = useState<string>(
    initialAlert ? `Intervention: ${initialAlert.title}` : 'Emergency Service Intervention'
  );
  const [department, setDepartment] = useState<DepartmentId>(
    initialAlert?.department || 'WATER_SUPPLY'
  );
  const [wardId, setWardId] = useState<string>(initialAlert?.wardId || 'W-04');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(
    initialAlert?.severity || 'HIGH'
  );
  const [assignedTo, setAssignedTo] = useState<string>(
    initialAlert?.department === 'WATER_SUPPLY'
      ? 'DJB Rapid Emergency Repair Squad (North-West)'
      : initialAlert?.department === 'SANITATION'
      ? 'Municipal Sanitation Taskforce - East Zone'
      : 'District Rapid Response Squadron'
  );
  const [proposedAction, setProposedAction] = useState<string>(
    initialAlert?.suggestedInvestigation || 'Deploy emergency repair unit and provide status updates every 4 hours.'
  );
  const [targetDate, setTargetDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wardObj = WARDS.find((w) => w.id === wardId);
    const wardName = wardObj ? wardObj.name : wardId;

    createIntervention({
      alertId: initialAlert?.id,
      title,
      department,
      wardId,
      wardName,
      priority,
      assignedTo,
      proposedAction,
      targetDate,
    });

    onClose();
    setActiveTab('interventions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Create Executive Intervention
              </h3>
              <p className="text-[11px] text-slate-400">
                {initialAlert ? `Linked to ${initialAlert.id}` : 'Manual Intervention Entry'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Intervention Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentId)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
              >
                {Object.values(DEPARTMENTS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Ward
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
              >
                {WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Field Team / Squadron
            </label>
            <input
              type="text"
              required
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mandated Operational Action
            </label>
            <textarea
              rows={3}
              required
              value={proposedAction}
              onChange={(e) => setProposedAction(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded leading-relaxed focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded shadow-xs flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Authorize & Save Intervention</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
