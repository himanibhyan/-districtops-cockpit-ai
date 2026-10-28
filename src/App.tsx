import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DemoNoticeBanner } from './components/common/DemoNoticeBanner';
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

const DistrictOpsCockpitInner: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    interventions,
    dashboardData,
    selectedAlert,
    setSelectedAlert,
    selectedGrievance,
    setSelectedGrievance,
    isInterventionModalOpen,
    setIsInterventionModalOpen,
    prefillInterventionAlert,
    setPrefillInterventionAlert,
    openCreateInterventionForAlert,
    filterDepartment,
    setFilterDepartment,
    updateInterventionStatus,
    createIntervention
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isDemoMode = apiService.isDemoMode();

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demo Environment Notice Banner */}
      <DemoNoticeBanner isDemo={isDemoMode} />

      <div className="flex flex-1 min-h-[calc(100vh-37px)]">
        {/* Navy/Charcoal Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Top Header */}
          <TopHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

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
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold font-mono tracking-wide text-slate-900 uppercase">
                      Gurugram GIS Operations & Telemetry Map
                    </h2>
                    <p className="text-xs text-slate-500">
                      Leaflet spatial radar displaying verified Gurugram boundary polygon (783 vertices) and incident coordinates.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto">
                    CANONICAL JURISDICTION: GURUGRAM, HARYANA
                  </span>
                </div>
                <DistrictIntelligenceMap
                  alerts={alerts}
                  interventions={interventions}
                  selectedAlertId={selectedAlert?.id || null}
                  onSelectAlert={(alert) => setSelectedAlert(alert)}
                  onNavigateToInterventions={handleNavigateToInterventions}
                  height="calc(100vh - 240px)"
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
                onOpenCreateModal={() => {
                  setPrefillInterventionAlert(null);
                  setIsInterventionModalOpen(true);
                }}
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
