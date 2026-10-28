import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DepartmentId, 
  Grievance, 
  GrievanceStatus, 
  Incident, 
  IncidentStatus, 
  Intervention, 
  InterventionStatus, 
  RiskAlert, 
  Ward 
} from '../types';
import { 
  INITIAL_GRIEVANCES, 
  INITIAL_INCIDENTS, 
  INITIAL_INTERVENTIONS, 
  WARDS 
} from '../data/mockData';
import { generateRiskAlerts } from '../services/riskEngine';

interface AppContextType {
  // Navigation & View
  activeTab: 'overview' | 'alerts' | 'incidents' | 'grievances' | 'interventions' | 'planning';
  setActiveTab: (tab: 'overview' | 'alerts' | 'incidents' | 'grievances' | 'interventions' | 'planning') => void;
  
  // District
  currentDistrict: string;
  setCurrentDistrict: (district: string) => void;

  // Selected Entities
  selectedAlert: RiskAlert | null;
  setSelectedAlert: (alert: RiskAlert | null) => void;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  selectedGrievance: Grievance | null;
  setSelectedGrievance: (grievance: Grievance | null) => void;
  selectedIntervention: Intervention | null;
  setSelectedIntervention: (intervention: Intervention | null) => void;

  // Filter states
  filterDepartment: DepartmentId | 'ALL';
  setFilterDepartment: (dept: DepartmentId | 'ALL') => void;
  filterWard: string | 'ALL';
  setFilterWard: (ward: string | 'ALL') => void;

  // Assistant
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;

  // Primary Data
  incidents: Incident[];
  grievances: Grievance[];
  alerts: RiskAlert[];
  interventions: Intervention[];
  wards: Ward[];

  // Mutations
  createIntervention: (data: {
    alertId?: string;
    incidentId?: string;
    title: string;
    department: DepartmentId;
    wardId: string;
    wardName: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    assignedTo: string;
    proposedAction: string;
    targetDate: string;
  }) => Intervention;
  updateInterventionStatus: (id: string, newStatus: InterventionStatus) => boolean;
  addInterventionNote: (id: string, text: string, author?: string) => boolean;

  updateIncidentStatus: (id: string, newStatus: IncidentStatus, notes?: string) => boolean;
  assignIncidentTeam: (id: string, team: string) => boolean;
  addIncidentNote: (id: string, note: string) => boolean;

  updateGrievanceStatus: (id: string, newStatus: GrievanceStatus, resolutionNotes?: string) => boolean;

  // Reset Demo
  resetDemoData: () => void;

  // Toast
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_INCIDENTS = 'districtops_incidents_v2';
const STORAGE_KEY_GRIEVANCES = 'districtops_grievances_v2';
const STORAGE_KEY_INTERVENTIONS = 'districtops_interventions_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'incidents' | 'grievances' | 'interventions' | 'planning'>('overview');
  const [currentDistrict, setCurrentDistrict] = useState<string>('Central District (HQ)');
  
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  const [filterDepartment, setFilterDepartment] = useState<DepartmentId | 'ALL'>('ALL');
  const [filterWard, setFilterWard] = useState<string | 'ALL'>('ALL');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize from LocalStorage
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GRIEVANCES);
      return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
    } catch {
      return INITIAL_GRIEVANCES;
    }
  });

  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
      return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
    } catch {
      return INITIAL_INTERVENTIONS;
    }
  });

  // Calculate alerts dynamically from current grievances, incidents, and interventions
  const alerts = generateRiskAlerts(grievances, incidents, interventions);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error('LocalStorage write error for incidents:', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GRIEVANCES, JSON.stringify(grievances));
    } catch (e) {
      console.error('LocalStorage write error for grievances:', e);
    }
  }, [grievances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(interventions));
    } catch (e) {
      console.error('LocalStorage write error for interventions:', e);
    }
  }, [interventions]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Intervention Actions
  const createIntervention = (data: {
    alertId?: string;
    incidentId?: string;
    title: string;
    department: DepartmentId;
    wardId: string;
    wardName: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    assignedTo: string;
    proposedAction: string;
    targetDate: string;
  }): Intervention => {
    const id = `INT-${new Date().getFullYear()}-${String(interventions.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIntervention: Intervention = {
      id,
      alertId: data.alertId,
      incidentId: data.incidentId,
      title: data.title,
      department: data.department,
      wardId: data.wardId,
      wardName: data.wardName,
      priority: data.priority,
      status: 'ASSIGNED',
      assignedTo: data.assignedTo,
      proposedAction: data.proposedAction,
      targetDate: data.targetDate,
      createdAt: now,
      updatedAt: now,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          timestamp: now,
          author: 'District Magistrate Office',
          text: `Intervention initiated. Action: ${data.proposedAction}`,
        }
      ],
      history: [
        {
          id: `AUD-INT-${Date.now()}`,
          timestamp: now,
          actor: 'District Magistrate Office',
          action: 'INTERVENTION_CREATED',
          details: `Created intervention ${id} assigned to ${data.assignedTo}`,
        }
      ]
    };

    setInterventions((prev) => [newIntervention, ...prev]);
    setSelectedIntervention(newIntervention);
    showToast(`Intervention ${id} created and assigned to ${data.assignedTo}`, 'success');
    return newIntervention;
  };

  const updateInterventionStatus = (id: string, newStatus: InterventionStatus): boolean => {
    let success = false;
    setInterventions((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      success = true;

      const updated = prev.map((item) => {
        if (item.id === id) {
          const now = new Date().toISOString();
          const newAudit = {
            id: `AUD-INT-${Date.now()}`,
            timestamp: now,
            actor: 'District Operations Desk',
            action: 'STATUS_UPDATED',
            details: `Status transitioned from ${item.status} to ${newStatus}`,
            previousValue: item.status,
            newValue: newStatus,
          };

          return {
            ...item,
            status: newStatus,
            updatedAt: now,
            resolvedAt: newStatus === 'RESOLVED' ? now : item.resolvedAt,
            history: [newAudit, ...item.history],
          };
        }
        return item;
      });

      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIntervention(curr);

      return updated;
    });

    if (success) {
      showToast(`Intervention ${id} status updated to ${newStatus}`, 'success');
    }
    return success;
  };

  const addInterventionNote = (id: string, text: string, author: string = 'District Magistrate'): boolean => {
    if (!text.trim()) return false;
    let success = false;
    setInterventions((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      success = true;

      const now = new Date().toISOString();
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newNote = {
            id: `NOTE-${Date.now()}`,
            timestamp: now,
            author,
            text: text.trim(),
          };
          const newAudit = {
            id: `AUD-INT-${Date.now()}`,
            timestamp: now,
            actor: author,
            action: 'NOTE_ADDED',
            details: text.trim(),
          };

          return {
            ...item,
            updatedAt: now,
            notes: [newNote, ...item.notes],
            history: [newAudit, ...item.history],
          };
        }
        return item;
      });

      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIntervention(curr);

      return updated;
    });

    if (success) {
      showToast(`Progress note recorded for ${id}`, 'success');
    }
    return success;
  };

  // Incident Actions
  const updateIncidentStatus = (id: string, newStatus: IncidentStatus, notes?: string): boolean => {
    let success = false;
    setIncidents((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      success = true;

      const now = new Date().toISOString();
      const updated = prev.map((inc) => {
        if (inc.id === id) {
          const newAudit = {
            id: `AUD-${Date.now()}`,
            timestamp: now,
            actor: 'DM Operations Cockpit',
            action: 'STATUS_UPDATED',
            details: notes ? `Status set to ${newStatus}. Note: ${notes}` : `Status transitioned to ${newStatus}`,
            previousValue: inc.status,
            newValue: newStatus,
          };
          return {
            ...inc,
            status: newStatus,
            updatedAt: now,
            resolvedAt: (newStatus === 'RESOLVED' || newStatus === 'CLOSED') ? now : inc.resolvedAt,
            auditHistory: [newAudit, ...inc.auditHistory],
          };
        }
        return inc;
      });

      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIncident(curr);

      return updated;
    });

    if (success) {
      showToast(`Incident ${id} updated to ${newStatus}`, 'success');
    }
    return success;
  };

  const assignIncidentTeam = (id: string, team: string): boolean => {
    if (!team.trim()) return false;
    let success = false;
    setIncidents((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      success = true;

      const now = new Date().toISOString();
      const updated = prev.map((inc) => {
        if (inc.id === id) {
          const newAudit = {
            id: `AUD-${Date.now()}`,
            timestamp: now,
            actor: 'DM Operations Cockpit',
            action: 'TEAM_ASSIGNED',
            details: `Assigned response team: ${team}`,
            previousValue: inc.assignedTeam || 'Unassigned',
            newValue: team,
          };

          return {
            ...inc,
            assignedTeam: team,
            status: inc.status === 'OPEN' ? 'IN_PROGRESS' : inc.status,
            updatedAt: now,
            auditHistory: [newAudit, ...inc.auditHistory],
          };
        }
        return inc;
      });

      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIncident(curr);

      return updated;
    });

    if (success) {
      showToast(`Assigned ${team} to ${id}`, 'success');
    }
    return success;
  };

  const addIncidentNote = (id: string, note: string): boolean => {
    if (!note.trim()) return false;
    let success = false;
    setIncidents((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      success = true;

      const now = new Date().toISOString();
      const timeStr = now.replace('T', ' ').slice(0, 16);
      const formattedNote = `[${timeStr}] (DM Office): ${note.trim()}`;

      const updated = prev.map((inc) => {
        if (inc.id === id) {
          const newAudit = {
            id: `AUD-${Date.now()}`,
            timestamp: now,
            actor: 'District Magistrate Office',
            action: 'NOTE_RECORDED',
            details: note.trim(),
          };

          return {
            ...inc,
            investigationNotes: [formattedNote, ...inc.investigationNotes],
            updatedAt: now,
            auditHistory: [newAudit, ...inc.auditHistory],
          };
        }
        return inc;
      });

      const curr = updated.find((i) => i.id === id);
      if (curr) setSelectedIncident(curr);

      return updated;
    });

    if (success) {
      showToast(`Investigation note saved for ${id}`, 'success');
    }
    return success;
  };

  const updateGrievanceStatus = (id: string, newStatus: GrievanceStatus, resolutionNotes?: string): boolean => {
    let success = false;
    setGrievances((prev) => {
      const target = prev.find((g) => g.id === id);
      if (!target) return prev;
      success = true;

      const updated = prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status: newStatus,
            resolutionNotes: resolutionNotes || g.resolutionNotes,
            resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : undefined,
          };
        }
        return g;
      });

      const curr = updated.find((g) => g.id === id);
      if (curr) setSelectedGrievance(curr);

      return updated;
    });

    if (success) {
      showToast(`Grievance ${id} status updated to ${newStatus}`, 'success');
    }
    return success;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.removeItem(STORAGE_KEY_GRIEVANCES);
    localStorage.removeItem(STORAGE_KEY_INTERVENTIONS);
    setIncidents(INITIAL_INCIDENTS);
    setGrievances(INITIAL_GRIEVANCES);
    setInterventions(INITIAL_INTERVENTIONS);
    setSelectedAlert(null);
    setSelectedIncident(null);
    setSelectedGrievance(null);
    setSelectedIntervention(null);
    setFilterDepartment('ALL');
    setFilterWard('ALL');
    showToast('Demonstration database reset to initial state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentDistrict,
        setCurrentDistrict,
        selectedAlert,
        setSelectedAlert,
        selectedIncident,
        setSelectedIncident,
        selectedGrievance,
        setSelectedGrievance,
        selectedIntervention,
        setSelectedIntervention,
        filterDepartment,
        setFilterDepartment,
        filterWard,
        setFilterWard,
        isAssistantOpen,
        setIsAssistantOpen,
        incidents,
        grievances,
        alerts,
        interventions,
        wards: WARDS,
        createIntervention,
        updateInterventionStatus,
        addInterventionNote,
        updateIncidentStatus,
        assignIncidentTeam,
        addIncidentNote,
        updateGrievanceStatus,
        resetDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
