import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DemoNoticeBanner } from './components/common/DemoNoticeBanner';
import { DistrictOverview } from './components/dashboard/DistrictOverview';
import { DepartmentPerformanceView } from './components/departments/DepartmentPerformanceView';
import { AlertsView } from './components/alerts/AlertsView';
import { InterventionCenterView } from './components/interventions/InterventionCenterView';
import { AlertDetailModal } from './components/alerts/AlertDetailModal';
import { InterventionModal } from './components/interventions/InterventionModal';

import {
  DashboardSummary,
  OperationalAlert,
  Intervention,
  InterventionStatus,
  DepartmentType,
  PriorityLevel
} from './types';
import { apiService } from './services/api';
import { INITIAL_DASHBOARD_DATA, INITIAL_ALERTS, INITIAL_INTERVENTIONS } from './services/mockData';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardSummary>(INITIAL_DASHBOARD_DATA);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);
  const [interventions, setInterventions] = useState<Intervention[]>(INITIAL_INTERVENTIONS);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string | undefined>(undefined);

  // Modals
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);
  const [interventionPrefillAlert, setInterventionPrefillAlert] = useState<OperationalAlert | null>(null);
  const [interventionPrefillAction, setInterventionPrefillAction] = useState<string | undefined>(undefined);

  // Fetch data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [dashRes, alertsRes, intvRes] = await Promise.all([
        apiService.getDashboard(),
        apiService.getAlerts(),
        apiService.getInterventions()
      ]);

      setDashboardData(dashRes.data);
      setAlerts(alertsRes.data);
      setInterventions(intvRes.data);
      setIsDemoMode(dashRes.isDemo || alertsRes.isDemo || intvRes.isDemo);
    } catch (err) {
      console.warn('[DistrictOps] Error loading operational data, relying on cached synthetic state:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Navigation
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAlerts = (department?: string) => {
    setActiveTab('alerts');
    if (department) {
      setSelectedDeptFilter(department);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDepartments = (department?: string) => {
    setActiveTab('departments');
    if (department) {
      setSelectedDeptFilter(department);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToInterventions = () => {
    setActiveTab('interventions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOnMap = (alert: OperationalAlert) => {
    setSelectedAlert(alert);
    setActiveTab('overview');
    setTimeout(() => {
      const mapEl = document.getElementById('district-intelligence-map');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Launch Intervention from Alert
  const handleCreateInterventionFromAlert = (alert: OperationalAlert, initialAction?: string) => {
    setInterventionPrefillAlert(alert);
    setInterventionPrefillAction(initialAction);
    setIsInterventionModalOpen(true);
  };

  const handleOpenGeneralIntervention = () => {
    setInterventionPrefillAlert(null);
    setInterventionPrefillAction(undefined);
    setIsInterventionModalOpen(true);
  };

  // Submit new Intervention
  const handleSubmitIntervention = async (payload: {
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
  }) => {
    await apiService.createIntervention(payload);
    // Refresh to get updated list and dashboard counts
    await loadData(true);
    // If we're on overview or alert detail, close alert modal and switch to interventions
    if (selectedAlert) {
      setSelectedAlert(null);
    }
    setActiveTab('interventions');
  };

  // Status Change for an Intervention
  const handleUpdateInterventionStatus = async (id: string, newStatus: InterventionStatus) => {
    await apiService.updateInterventionStatus(id, newStatus);
    await loadData(true);
  };

  // Counts for badges
  const criticalAlertCount = alerts.filter(a => a.severity === 'Critical').length;
  const activeInterventionCount = interventions.filter(i => i.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demo Environment Notice Banner */}
      <DemoNoticeBanner isDemo={isDemoMode} />

      <div className="flex flex-1 min-h-[calc(100vh-37px)]">
        {/* Navy/Charcoal Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          criticalAlertCount={criticalAlertCount}
          activeInterventionCount={activeInterventionCount}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Top Header */}
          <TopHeader
            activeTab={activeTab}
            onOpenNewIntervention={handleOpenGeneralIntervention}
            onRefresh={() => loadData(true)}
            isRefreshing={isRefreshing}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            lastUpdated={dashboardData.lastUpdated}
          />

          {/* View Container */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {isLoading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  Initializing District Telemetry Feeds...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Loading Gurugram municipal operational indices
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <DistrictOverview
                    data={dashboardData}
                    alerts={alerts}
                    interventions={interventions}
                    selectedAlertId={selectedAlert?.id || null}
                    onNavigateToAlerts={handleNavigateToAlerts}
                    onNavigateToInterventions={handleNavigateToInterventions}
                    onNavigateToDepartments={handleNavigateToDepartments}
                    onSelectAlert={(alert) => setSelectedAlert(alert)}
                  />
                )}

                {activeTab === 'departments' && (
                  <DepartmentPerformanceView
                    departments={dashboardData.departmentSummaries}
                    alerts={alerts}
                    interventions={interventions}
                    selectedDeptFilter={selectedDeptFilter}
                    onSelectAlert={(alert) => setSelectedAlert(alert)}
                    onNavigateToInterventions={handleNavigateToInterventions}
                  />
                )}

                {activeTab === 'alerts' && (
                  <AlertsView
                    alerts={alerts}
                    initialDepartmentFilter={selectedDeptFilter || 'All'}
                    onSelectAlert={(alert) => setSelectedAlert(alert)}
                    onCreateInterventionFromAlert={(alert) =>
                      handleCreateInterventionFromAlert(alert)
                    }
                    onViewOnMap={handleViewOnMap}
                  />
                )}

                {activeTab === 'interventions' && (
                  <InterventionCenterView
                    interventions={interventions}
                    onOpenCreateModal={handleOpenGeneralIntervention}
                    onUpdateStatus={handleUpdateInterventionStatus}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Alert Detail Inspection Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onCreateInterventionFromAlert={handleCreateInterventionFromAlert}
          onViewOnMap={handleViewOnMap}
        />
      )}

      {/* Intervention Creation Dialog */}
      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => {
          setIsInterventionModalOpen(false);
          setInterventionPrefillAlert(null);
          setInterventionPrefillAction(undefined);
        }}
        onSubmit={handleSubmitIntervention}
        prefillAlert={interventionPrefillAlert}
        prefillAction={interventionPrefillAction}
      />
    </div>
  );
};

export default App;
