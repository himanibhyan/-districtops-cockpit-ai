import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DistrictOverview } from './components/dashboard/DistrictOverview';
import { DepartmentPerformanceView } from './components/departments/DepartmentPerformanceView';
import { AlertsView } from './components/alerts/AlertsView';
import { DistrictIntelligenceMap } from './components/map/DistrictIntelligenceMap';
import { GrievanceTable } from './components/grievances/GrievanceTable';
import { GrievanceDetailModal } from './components/grievances/GrievanceDetailModal';
import { InterventionCenterView } from './components/interventions/InterventionCenterView';
import { ResourcePlanningView } from './components/planning/ResourcePlanningView';
import { AlertDetailModal } from './components/alerts/AlertDetailModal';
import { InterventionModal } from './components/interventions/InterventionModal';
import { AIAssistantDrawer } from './components/assistant/AIAssistantDrawer';
import { InterventionStatus } from './types';
import { apiService } from './services/api';
import { Compass } from 'lucide-react';

const DistrictOpsCockpitInner: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    interventions,
    grievances,
    dashboardData,
    selectedAlert,
    setSelectedAlert,
    selectedGrievance,
    setSelectedGrievance,
    setIsAssistantOpen,
    isInterventionModalOpen,
    setIsInterventionModalOpen,
    prefillInterventionAlert,
    setPrefillInterventionAlert,
    openCreateInterventionForAlert,
    filterDepartment,
    setFilterDepartment,
    searchQuery,
    setSearchQuery,
    updateInterventionStatus,
    createIntervention
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const criticalAlertCount = alerts.filter((a) => a.severity === 'Critical').length;
  const activeInterventionCount = interventions.filter(
    (i) => i.status !== 'Completed' && i.status !== 'RESOLVED'
  ).length;
  const pendingGrievanceCount = grievances.filter((g) => g.status !== 'RESOLVED').length;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await apiService.getDashboard();
    } catch (e) {
      console.warn('[DistrictOps] Refresh completed in cached demo mode:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAlerts = (department?: string) => {
    if (department) {
      setFilterDepartment(department);
    }
    setActiveTab('alerts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDepartments = (department?: string) => {
    if (department) {
      setFilterDepartment(department);
    }
    setActiveTab('departments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToInterventions = () => {
    setActiveTab('interventions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOnMap = (alert: any) => {
    setSelectedAlert(alert);
    setActiveTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGeneralIntervention = () => {
    setPrefillInterventionAlert(null);
    setIsInterventionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex flex-1 min-h-screen">
        {/* Navy/Charcoal Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          criticalAlertCount={criticalAlertCount}
          activeInterventionCount={activeInterventionCount}
          pendingGrievanceCount={pendingGrievanceCount}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Top Header */}
          <TopHeader
            activeTab={activeTab}
            onOpenNewIntervention={handleOpenGeneralIntervention}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            lastUpdated={dashboardData.lastUpdated}
          />

          {/* View Container */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
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

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <h2 className="text-base font-bold text-slate-900">
                        Gurugram GIS Operations & Telemetry Map
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Interactive Leaflet GIS command map displaying verified Gurugram boundary polygon (783 vertices) and incident coordinates.
                    </p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    CANONICAL JURISDICTION: GURUGRAM, HARYANA
                  </span>
                </div>
                <DistrictIntelligenceMap
                  alerts={alerts}
                  interventions={interventions}
                  selectedAlertId={selectedAlert?.id || null}
                  onSelectAlert={(alert) => setSelectedAlert(alert)}
                  onNavigateToInterventions={handleNavigateToInterventions}
                  height="calc(100vh - 270px)"
                  isExpandedInitial={true}
                />
              </div>
            )}

            {activeTab === 'departments' && (
              <DepartmentPerformanceView
                departments={dashboardData.departmentSummaries}
                alerts={alerts}
                interventions={interventions}
                selectedDeptFilter={filterDepartment !== 'All' ? filterDepartment : undefined}
                onSelectAlert={(alert) => setSelectedAlert(alert)}
                onNavigateToInterventions={handleNavigateToInterventions}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                initialDepartmentFilter={filterDepartment}
                onSelectAlert={(alert) => setSelectedAlert(alert)}
                onCreateInterventionFromAlert={(alert) => openCreateInterventionForAlert(alert)}
                onViewOnMap={handleViewOnMap}
              />
            )}

            {activeTab === 'grievances' && <GrievanceTable />}

            {activeTab === 'interventions' && (
              <InterventionCenterView
                interventions={interventions}
                onOpenCreateModal={handleOpenGeneralIntervention}
                onUpdateStatus={async (id: string, newStatus: InterventionStatus) => {
                  updateInterventionStatus(id, newStatus);
                }}
              />
            )}

            {activeTab === 'planning' && <ResourcePlanningView />}
          </main>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onCreateInterventionFromAlert={(alert) => {
            openCreateInterventionForAlert(alert);
          }}
          onViewOnMap={handleViewOnMap}
        />
      )}

      {/* Citizen Grievance Detail Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
        />
      )}

      {/* Intervention Creation Dialog */}
      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => {
          setIsInterventionModalOpen(false);
          setPrefillInterventionAlert(null);
        }}
        onSubmit={async (payload) => {
          createIntervention(payload);
          setIsInterventionModalOpen(false);
        }}
        prefillAlert={prefillInterventionAlert}
      />

      {/* Grounded AI Decision Assistant Drawer */}
      <AIAssistantDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <DistrictOpsCockpitInner />
    </AppProvider>
  );
};

export default App;
