import React, { useState } from 'react';
import { DepartmentType, PriorityLevel, InterventionStatus, OperationalAlert } from '../../types';
import { X, PlusCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    department: DepartmentType;
    priority: PriorityLevel;
    status: InterventionStatus;
    targetArea: string;
    assignedOfficer: string;
    assignedTeam?: string;
    linkedAlertId?: string;
    linkedAlertTitle?: string;
  }) => Promise<void>;
  prefillAlert?: OperationalAlert | null;
  prefillAction?: string;
}

const DEPARTMENTS: DepartmentType[] = [
  'Water Supply',
  'Sanitation',
  'Healthcare',
  'Public Grievances',
  'Roads & Infrastructure',
  'Electricity'
];

const PRIORITIES: PriorityLevel[] = ['Urgent', 'High', 'Medium', 'Low'];

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillAlert,
  prefillAction
}) => {
  const [title, setTitle] = useState(
    prefillAction || (prefillAlert ? `Emergency Response Directive: ${prefillAlert.title}` : '')
  );
  const [description, setDescription] = useState(
    prefillAlert
      ? `Deploy specialized field squads to address anomaly in ${prefillAlert.affectedArea}. Root evidence: ${prefillAlert.evidenceSummary}`
      : ''
  );
  const [department, setDepartment] = useState<DepartmentType>(
    prefillAlert?.department || 'Water Supply'
  );
  const [priority, setPriority] = useState<PriorityLevel>(
    prefillAlert?.severity === 'Critical' ? 'Urgent' : prefillAlert?.severity === 'High' ? 'High' : 'Medium'
  );
  const [targetArea, setTargetArea] = useState(prefillAlert?.affectedArea || 'Ward 7 (Indirapuram Sector 4)');
  const [assignedOfficer, setAssignedOfficer] = useState('Dr. A. Ramanathan (Nodal Officer)');
  const [assignedTeam, setAssignedTeam] = useState(prefillAlert?.assignedTeam || 'Rapid Response Hydraulic Squad 2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(prefillAction || (prefillAlert ? `Emergency Response Directive: ${prefillAlert.title}` : ''));
      setDescription(
        prefillAlert
          ? `Deploy specialized field squads to address anomaly in ${prefillAlert.affectedArea}. Root evidence: ${prefillAlert.evidenceSummary}`
          : ''
      );
      setDepartment(prefillAlert?.department || 'Water Supply');
      setPriority(
        prefillAlert?.severity === 'Critical' ? 'Urgent' : prefillAlert?.severity === 'High' ? 'High' : 'Medium'
      );
      setTargetArea(prefillAlert?.affectedArea || 'Ward 7 (Indirapuram Sector 4)');
      setAssignedOfficer('Dr. A. Ramanathan (Nodal Officer)');
      setAssignedTeam(prefillAlert?.assignedTeam || 'Rapid Response Hydraulic Squad 2');
      setFormError(null);
    }
  }, [isOpen, prefillAlert, prefillAction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter an action title for the intervention.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter operational instructions / description.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        department,
        priority,
        status: 'Assigned',
        targetArea: targetArea.trim() || 'General District Area',
        assignedOfficer: assignedOfficer.trim() || 'Assigned Nodal Officer',
        assignedTeam: assignedTeam.trim() || undefined,
        linkedAlertId: prefillAlert?.id,
        linkedAlertTitle: prefillAlert?.title
      });
      onClose();
    } catch (err) {
      console.error('Error creating intervention:', err);
      setFormError('Failed to record intervention. Please check parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Issue Administrative Intervention
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch binding directive to field personnel with tracked resolution SLAs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
              {formError}
            </div>
          )}

          {prefillAlert && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[11px] uppercase tracking-wide text-blue-700">
                  Linked Operational Alert:
                </span>
                <p className="font-medium text-xs text-slate-900 mt-0.5">
                  [{prefillAlert.id}] {prefillAlert.title}
                </p>
              </div>
            </div>
          )}

          {/* Action Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Directive / Action Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deploy 4 mobile water tankers to Indirapuram Sector 4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-xs"
            />
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Department <span className="text-red-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority Tier <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Area & Assigned Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Ward / Location
              </label>
              <input
                type="text"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                placeholder="e.g. Ward 7 Indirapuram"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lead Nodal Officer
              </label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                placeholder="e.g. Er. Rajesh Nair"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
              />
            </div>
          </div>

          {/* Assigned Squad/Team */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Field Execution Squad / Unit
            </label>
            <input
              type="text"
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              placeholder="e.g. Rapid Hydraulic Squad 2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Action Description & Operational Scope <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific instructions, required personnel allocation, logistics, and milestone verification criteria..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs leading-relaxed"
            />
          </div>

          {/* Footer controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors text-xs disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Authorize & Assign Directive'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
