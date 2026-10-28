import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  DepartmentType,
  OperationalAlert,
  Grievance,
  Intervention,
  ScenarioAssumption,
  DashboardSummary,
  GrievanceStatus,
  InterventionStatus,
  AuditEntry
} from '../types';
import {
  INITIAL_ALERTS,
  INITIAL_GRIEVANCES,
  INITIAL_INTERVENTIONS,
  INITIAL_SCENARIO_ASSUMPTIONS,
  INITIAL_DASHBOARD_DATA
} from '../data/canonicalData';
import { recomputeAlertsFromData } from '../services/riskEngine';

export type NavTab =
  | 'overview'
  | 'departments'
  | 'alerts'
  | 'map'
  | 'grievances'
  | 'interventions'
  | 'planning';

interface AppContextValue {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Data Collections
  alerts: OperationalAlert[];
  grievances: Grievance[];
  interventions: Intervention[];
  scenarioAssumptions: ScenarioAssumption[];
  dashboardData: DashboardSummary;

  // Teammate Compatibility Aliases
  incidents: OperationalAlert[];
  setSelectedIncident: (alert: OperationalAlert | null) => void;

  // Selected Entities
  selectedAlert: OperationalAlert | null;
  setSelectedAlert: (alert: OperationalAlert | null) => void;
  selectedGrievance: Grievance | null;
  setSelectedGrievance: (grievance: Grievance | null) => void;

  // AI Assistant Drawer
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  assistantInitialQuery: string | undefined;
  openAssistantWithQuery: (query?: string) => void;

  // AI Explanation Dossier Drawer
  isAiExplainOpen: boolean;
  setIsAiExplainOpen: (open: boolean) => void;
  aiExplainAlert: OperationalAlert | null;
  setAiExplainAlert: (alert: OperationalAlert | null) => void;

  // Intervention Modal
  isInterventionModalOpen: boolean;
  setIsInterventionModalOpen: (open: boolean) => void;
  prefillInterventionAlert: OperationalAlert | null;
  setPrefillInterventionAlert: (alert: OperationalAlert | null) => void;
  openCreateInterventionForAlert: (alert: OperationalAlert) => void;

  // Global Filters
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
  filterWard: string;
  setFilterWard: (ward: string) => void;
  filterSeverity: string;
  setFilterSeverity: (sev: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  resetFilters: () => void;

  // Mutations
  updateGrievanceStatus: (id: string, status: GrievanceStatus, resolutionNotes?: string) => void;
  updateInterventionStatus: (id: string, status: InterventionStatus, notes?: string) => void;
  createIntervention: (data: Partial<Intervention> & { title: string; department: DepartmentType; priority: string; targetArea: string }) => Intervention;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  const [alerts, setAlerts] = useState<OperationalAlert[]>(() => [...INITIAL_ALERTS]);
  const [grievances, setGrievances] = useState<Grievance[]>(() => [...INITIAL_GRIEVANCES]);
  const [interventions, setInterventions] = useState<Intervention[]>(() => [...INITIAL_INTERVENTIONS]);
  const [scenarioAssumptions, setScenarioAssumptions] = useState<ScenarioAssumption[]>(() => [...INITIAL_SCENARIO_ASSUMPTIONS]);
  const [dashboardData, setDashboardData] = useState<DashboardSummary>(() => ({ ...INITIAL_DASHBOARD_DATA }));

  // Selection states
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // AI Assistant drawer
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | undefined>(undefined);

  // AI Explain dossier drawer
  const [isAiExplainOpen, setIsAiExplainOpen] = useState<boolean>(false);
  const [aiExplainAlert, setAiExplainAlert] = useState<OperationalAlert | null>(null);

  // Intervention modal
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);
  const [prefillInterventionAlert, setPrefillInterventionAlert] = useState<OperationalAlert | null>(null);

  // Filters
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [filterWard, setFilterWard] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const resetFilters = useCallback(() => {
    setFilterDepartment('All');
    setFilterWard('All');
    setFilterSeverity('All');
    setFilterStatus('All');
    setSearchQuery('');
  }, []);

  const openAssistantWithQuery = useCallback((query?: string) => {
    setAssistantInitialQuery(query);
    setIsAssistantOpen(true);
  }, []);

  const openCreateInterventionForAlert = useCallback((alert: OperationalAlert) => {
    setPrefillInterventionAlert(alert);
    setIsInterventionModalOpen(true);
  }, []);

  // Update grievance status and dynamically trigger risk score recalculations
  const updateGrievanceStatus = useCallback((id: string, status: GrievanceStatus, resolutionNotes?: string) => {
    setGrievances((prevGrievances) => {
      const now = new Date().toISOString();
      const updatedGrievances = prevGrievances.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            status,
            resolutionNotes: resolutionNotes || g.resolutionNotes,
            resolvedAt: status === 'RESOLVED' ? now : undefined
          };
        }
        return g;
      });

      // Recalculate alert risk scores dynamically based on the updated grievances
      setAlerts((prevAlerts) => {
        return recomputeAlertsFromData(prevAlerts, updatedGrievances, interventions);
      });

      // Update dashboard KPI summary
      setDashboardData((prevDash) => {
        const pendingCount = updatedGrievances.filter((g) => g.status !== 'RESOLVED').length;
        return {
          ...prevDash,
          kpis: {
            ...prevDash.kpis,
            openGrievances: {
              ...prevDash.kpis.openGrievances,
              value: 1420 + pendingCount
            }
          }
        };
      });

      return updatedGrievances;
    });
  }, [interventions]);

  // Update intervention status and recalculate risk score
  const updateInterventionStatus = useCallback((id: string, status: InterventionStatus, notes?: string) => {
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setInterventions((prevInterventions) => {
      const updated = prevInterventions.map((item) => {
        if (item.id === id) {
          const isResolved = status === 'Completed' || status === 'RESOLVED';
          const isInProg = status === 'In Progress' || status === 'IN_PROGRESS';
          const progress = isResolved ? 100 : isInProg ? Math.max(item.progressPercentage, 50) : item.progressPercentage;

          const auditHistory: AuditEntry[] = item.history ? [...item.history] : [];
          auditHistory.push({
            id: `aud-${Date.now()}`,
            timestamp: now,
            actor: 'District Operations Officer',
            action: `Status changed to ${status}`,
            details: notes || `Intervention marked as ${status}.`
          });

          return {
            ...item,
            status,
            progressPercentage: progress,
            updatedAt: now,
            resolvedAt: isResolved ? now : undefined,
            history: auditHistory
          };
        }
        return item;
      });

      // Recalculate alert risk scores
      setAlerts((prevAlerts) => recomputeAlertsFromData(prevAlerts, grievances, updated));

      // Update dashboard KPI summary
      const activeCount = updated.filter((i) => i.status !== 'Completed' && i.status !== 'RESOLVED').length;
      setDashboardData((prevDash) => ({
        ...prevDash,
        kpis: {
          ...prevDash.kpis,
          activeInterventions: {
            ...prevDash.kpis.activeInterventions,
            value: activeCount
          }
        }
      }));

      return updated;
    });
  }, [grievances]);

  // Create new intervention
  const createIntervention = useCallback((data: Partial<Intervention> & { title: string; department: DepartmentType; priority: string; targetArea: string }) => {
    const id = `INT-2026-${String(interventions.length + 1).padStart(3, '0')}`;
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newIntervention: Intervention = {
      id,
      title: data.title,
      description: data.description || '',
      department: data.department,
      departmentId: data.departmentId,
      priority: (data.priority as any) || 'High',
      status: 'Assigned',
      targetArea: data.targetArea,
      wardId: data.wardId,
      wardName: data.wardName,
      assignedOfficer: data.assignedOfficer || 'Shri Sandeep Gulia (Executive Engineer)',
      assignedTeam: data.assignedTeam || `${data.department} Response Wing`,
      proposedAction: data.proposedAction,
      createdAt: now,
      updatedAt: now,
      linkedAlertId: data.linkedAlertId,
      linkedAlertTitle: data.linkedAlertTitle,
      progressPercentage: 10,
      coordinates: data.coordinates || { lat: 28.4595, lng: 77.0266 },
      history: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          actor: 'District Operations Officer',
          action: 'Intervention Created',
          details: `Initiated intervention ${id} for ${data.targetArea}`
        }
      ]
    };

    setInterventions((prev) => {
      const nextInterventions = [newIntervention, ...prev];
      // Recalculate alert risk scores
      setAlerts((prevAlerts) => recomputeAlertsFromData(prevAlerts, grievances, nextInterventions));

      // Update dashboard active interventions count
      setDashboardData((prevDash) => ({
        ...prevDash,
        kpis: {
          ...prevDash.kpis,
          activeInterventions: {
            ...prevDash.kpis.activeInterventions,
            value: prevDash.kpis.activeInterventions.value + 1
          }
        }
      }));

      return nextInterventions;
    });

    return newIntervention;
  }, [interventions.length, grievances]);

  const resetAllData = useCallback(() => {
    setAlerts([...INITIAL_ALERTS]);
    setGrievances([...INITIAL_GRIEVANCES]);
    setInterventions([...INITIAL_INTERVENTIONS]);
    setScenarioAssumptions([...INITIAL_SCENARIO_ASSUMPTIONS]);
    setDashboardData({ ...INITIAL_DASHBOARD_DATA });
    setSelectedAlert(null);
    setSelectedGrievance(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      alerts,
      grievances,
      interventions,
      scenarioAssumptions,
      dashboardData,

      // Teammate compatibility
      incidents: alerts,
      setSelectedIncident: setSelectedAlert,

      selectedAlert,
      setSelectedAlert,
      selectedGrievance,
      setSelectedGrievance,

      isAssistantOpen,
      setIsAssistantOpen,
      assistantInitialQuery,
      openAssistantWithQuery,

      isAiExplainOpen,
      setIsAiExplainOpen,
      aiExplainAlert,
      setAiExplainAlert,

      isInterventionModalOpen,
      setIsInterventionModalOpen,
      prefillInterventionAlert,
      setPrefillInterventionAlert,
      openCreateInterventionForAlert,

      filterDepartment,
      setFilterDepartment,
      filterWard,
      setFilterWard,
      filterSeverity,
      setFilterSeverity,
      filterStatus,
      setFilterStatus,
      searchQuery,
      setSearchQuery,
      resetFilters,

      updateGrievanceStatus,
      updateInterventionStatus,
      createIntervention,
      resetAllData
    }),
    [
      activeTab,
      alerts,
      grievances,
      interventions,
      scenarioAssumptions,
      dashboardData,
      selectedAlert,
      selectedGrievance,
      isAssistantOpen,
      assistantInitialQuery,
      openAssistantWithQuery,
      isAiExplainOpen,
      aiExplainAlert,
      isInterventionModalOpen,
      prefillInterventionAlert,
      openCreateInterventionForAlert,
      filterDepartment,
      filterWard,
      filterSeverity,
      filterStatus,
      searchQuery,
      resetFilters,
      updateGrievanceStatus,
      updateInterventionStatus,
      createIntervention,
      resetAllData
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
