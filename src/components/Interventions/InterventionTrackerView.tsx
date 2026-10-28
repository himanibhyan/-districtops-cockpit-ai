import React, { useState } from 'react';
import { 
  CheckSquare, 
  PlusCircle, 
  Search, 
  Calendar, 
  UserCheck, 
  Clock, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  History,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Intervention, InterventionStatus } from '../../types';
import { DEPARTMENTS } from '../../data/mockData';

interface InterventionTrackerViewProps {
  onOpenCreateModal: () => void;
}

export const InterventionTrackerView: React.FC<InterventionTrackerViewProps> = ({ onOpenCreateModal }) => {
  const { 
    interventions, 
    updateInterventionStatus, 
    addInterventionNote, 
    selectedIntervention, 
    setSelectedIntervention 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [noteAuthor, setNoteAuthor] = useState<string>('District Magistrate Office');

  // Active intervention to inspect
  const activeItem = selectedIntervention || interventions[0];

  const filteredInterventions = interventions.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.assignedTo.toLowerCase().includes(q) ||
        item.wardName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded font-mono font-bold">OPEN</span>;
      case 'ASSIGNED':
        return <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded font-mono font-bold">ASSIGNED</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">RESOLVED</span>;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !newNoteText.trim()) return;
    addInterventionNote(activeItem.id, newNoteText.trim(), noteAuthor);
    setNewNoteText('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wide text-slate-900 uppercase">
              Administrative Intervention Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Convert risk alerts into assigned tasks, track field progress, record notes, and audit resolution milestones.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded shadow-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Intervention</span>
        </button>
      </div>

      {/* Main Grid: List on Left, Active Item Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interventions List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search interventions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Status Filter:</span>
              <div className="flex items-center space-x-1">
                {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      filterStatus === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredInterventions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No interventions match criteria.
              </div>
            ) : (
              filteredInterventions.map((item) => {
                const isSelected = activeItem?.id === item.id;
                const dept = DEPARTMENTS[item.department];

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIntervention(item)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/60 border-l-4 border-amber-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.id}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {item.proposedAction}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{dept?.code} • {item.wardName}</span>
                      <span className="font-mono text-slate-600">Due: {item.targetDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Intervention Inspection & Management (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col h-[650px] overflow-hidden">
          {activeItem ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded">
                      {activeItem.id}
                    </span>
                    {getStatusBadge(activeItem.status)}
                    <span className="text-[11px] font-semibold text-slate-600">
                      Priority: <strong className="text-red-700 uppercase">{activeItem.priority}</strong>
                    </span>
                  </div>

                  {/* Status Transition Control */}
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="text-slate-500 text-[11px]">Update Status:</span>
                    <select
                      value={activeItem.status}
                      onChange={(e) => updateInterventionStatus(activeItem.id, e.target.value as InterventionStatus)}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  {activeItem.title}
                </h3>
              </div>

              {/* Scrollable Details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Assigned Squadron</span>
                    <span className="font-bold text-slate-900">{activeItem.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Responsible Ward</span>
                    <span className="font-bold text-slate-900">{activeItem.wardName} ({activeItem.wardId})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Completion</span>
                    <span className="font-mono font-bold text-amber-800">{activeItem.targetDate}</span>
                  </div>
                </div>

                {/* Proposed Action */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
                    Mandated Operational Action
                  </h4>
                  <p className="bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed text-slate-800">
                    {activeItem.proposedAction}
                  </p>
                </div>

                {/* Progress Notes Thread */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2 flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Progress Notes ({activeItem.notes.length})</span>
                  </h4>

                  <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                    {activeItem.notes.map((note) => (
                      <div key={note.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold text-slate-700">{note.author}</span>
                          <span className="font-mono">
                            {new Date(note.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-800">{note.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Progress Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Add Field Progress Note</span>
                      <select
                        value={noteAuthor}
                        onChange={(e) => setNoteAuthor(e.target.value)}
                        className="text-[10px] border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                      >
                        <option value="District Magistrate Office">District Magistrate Office</option>
                        <option value="Zonal Assistant Engineer">Zonal Assistant Engineer</option>
                        <option value="Chief Sanitation Inspector">Chief Sanitation Inspector</option>
                        <option value="Duty Officer (HQ)">Duty Officer (HQ)</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Type update note (persists in LocalStorage)..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center space-x-1 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Audit & Execution History */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono mb-2 flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Intervention Audit Log</span>
                  </h4>
                  <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-32 overflow-y-auto">
                    {activeItem.history.map((hist) => (
                      <div key={hist.id} className="p-2 text-[11px] flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{hist.actor}: </span>
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
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs flex-1 flex flex-col items-center justify-center">
              <CheckSquare className="w-8 h-8 text-slate-300 mb-2" />
              <p>Select an intervention from the left to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
