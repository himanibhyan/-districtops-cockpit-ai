import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../data/mockData';
import { Grievance, GrievanceStatus } from '../../types';

interface GrievanceDetailModalProps {
  grievance: Grievance | null;
  onClose: () => void;
}

export const GrievanceDetailModal: React.FC<GrievanceDetailModalProps> = ({ grievance, onClose }) => {
  const { updateGrievanceStatus, setSelectedIncident, incidents, setActiveTab } = useApp();

  const [statusVal, setStatusVal] = useState<GrievanceStatus>(grievance?.status || 'PENDING');
  const [resolutionNotes, setResolutionNotes] = useState<string>(grievance?.resolutionNotes || '');

  if (!grievance) return null;

  const dept = DEPARTMENTS[grievance.department];
  const linkedIncident = grievance.relatedIncidentId
    ? incidents.find(i => i.id === grievance.relatedIncidentId)
    : null;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateGrievanceStatus(grievance.id, statusVal, resolutionNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                  {grievance.id}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase font-mono">
                  {grievance.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-1">
                {grievance.title}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-900">{dept?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Ward</span>
              <span className="font-bold text-slate-900">{grievance.wardName} ({grievance.wardId})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Citizen Complainant</span>
              <span className="font-bold text-slate-900">{grievance.citizenName}</span>
              <span className="font-mono text-slate-500 text-[10px] block">{grievance.citizenPhoneMasked}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Address</span>
              <span className="text-slate-800">{grievance.address}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
              Complainant Statement & Problem Description
            </h4>
            <p className="bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed text-slate-800">
              {grievance.description}
            </p>
          </div>

          {/* Associated Incident Link if correlated */}
          {linkedIncident && (
            <div className="bg-red-50/70 border border-red-200 rounded-md p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider font-mono block">
                  Correlated Incident Detected
                </span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">
                  {linkedIncident.id}: {linkedIncident.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedIncident(linkedIncident);
                  onClose();
                  setActiveTab('incidents');
                }}
                className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold px-2.5 py-1 rounded flex items-center space-x-1"
              >
                <span>Investigate</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Status Update Form */}
          <form onSubmit={handleUpdateStatus} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
              Administrative Status Transition
            </h4>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">Update Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as GrievanceStatus)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500"
              >
                <option value="PENDING">PENDING (Action Required)</option>
                <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED (Ticket Closed)</option>
                <option value="REJECTED">REJECTED (Out of Jurisdiction)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase mb-1">
                Field Resolution / Progress Notes
              </label>
              <textarea
                rows={2}
                placeholder="Enter field inspection notes or resolution outcome..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded transition"
              >
                Save Ticket Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
