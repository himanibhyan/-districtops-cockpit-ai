import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  FileText, 
  History,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../data/mockData';
import { Incident, IncidentStatus } from '../../types';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose }) => {
  const { 
    updateIncidentStatus, 
    assignIncidentTeam, 
    addIncidentNote, 
    grievances, 
    setSelectedGrievance, 
    setActiveTab 
  } = useApp();

  const [teamInput, setTeamInput] = useState<string>(incident?.assignedTeam || '');
  const [noteInput, setNoteInput] = useState<string>('');
  const [statusVal, setStatusVal] = useState<IncidentStatus>(incident?.status || 'OPEN');

  if (!incident) return null;

  const dept = DEPARTMENTS[incident.department];
  const relatedGrievances = grievances.filter(g => incident.relatedGrievanceIds.includes(g.id));

  const handleStatusChange = (newStatus: IncidentStatus) => {
    setStatusVal(newStatus);
    updateIncidentStatus(incident.id, newStatus);
  };

  const handleAssignTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamInput.trim()) return;
    assignIncidentTeam(incident.id, teamInput.trim());
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addIncidentNote(incident.id, noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                  {incident.id}
                </span>
                <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/40 font-mono">
                  {incident.severity} SEVERITY
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                {incident.title}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-900">{dept?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ward Locus</span>
              <span className="font-bold text-slate-900">{incident.wardName} ({incident.wardId})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">GPS Coordinates</span>
              <span className="font-mono text-slate-900 font-bold">{incident.coordinates.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Reported At</span>
              <span className="font-mono text-slate-800">
                {new Date(incident.reportedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
              Field Situation Summary
            </h4>
            <p className="bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed text-slate-800">
              {incident.description}
            </p>
          </div>

          {/* Suggested Next Steps */}
          {incident.suggestedAction && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-md p-3">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider font-mono block mb-1">
                AI / Operational Recommendation
              </span>
              <p className="text-blue-950 font-medium leading-relaxed">
                {incident.suggestedAction}
              </p>
            </div>
          )}

          {/* Two-Column Management Section: Status & Team Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {/* Status Transition */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Current Operational Status
              </label>
              <select
                value={statusVal}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500"
              >
                <option value="OPEN">OPEN (Unassigned)</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="ESCALATED">ESCALATED TO HEADQUARTERS</option>
                <option value="IN_PROGRESS">IN PROGRESS (Work Underway)</option>
                <option value="RESOLVED">RESOLVED (Service Restored)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            {/* Team Assignment Form */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Assign Response Squadron
              </label>
              <form onSubmit={handleAssignTeam} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. DJB Rapid Repair Squad"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded transition text-xs shrink-0"
                >
                  Save Team
                </button>
              </form>
            </div>
          </div>

          {/* Investigation Notes Feed */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2">
              Investigation Field Notes ({incident.investigationNotes.length})
            </h4>

            <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto pr-1">
              {incident.investigationNotes.map((note, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded text-xs text-slate-800 font-mono leading-relaxed">
                  {note}
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add executive order or technical dispatch note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                Add Note
              </button>
            </form>
          </div>

          {/* Linked Citizen Complaints */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
              <span>Related Citizen Complaints ({relatedGrievances.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Click ticket to view details</span>
            </h4>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md max-h-36 overflow-y-auto">
              {relatedGrievances.map((grv) => (
                <div
                  key={grv.id}
                  onClick={() => {
                    setSelectedGrievance(grv);
                    onClose();
                    setActiveTab('grievances');
                  }}
                  className="p-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-1 rounded mr-2">
                      {grv.id}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {grv.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {grv.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit History */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Audit Trail</span>
            </h4>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-32 overflow-y-auto text-[11px]">
              {incident.auditHistory.map((hist) => (
                <div key={hist.id} className="p-2 flex items-start justify-between">
                  <div>
                    <strong className="text-slate-800">{hist.actor}: </strong>
                    <span className="text-slate-600">{hist.details}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                    {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded transition"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
