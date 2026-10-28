import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { SummaryKPIs } from './components/CommandCenter/SummaryKPIs';
import { DistrictSituationBriefing } from './components/CommandCenter/DistrictSituationBriefing';
import { DistrictMap } from './components/CommandCenter/DistrictMap';
import { IncidentFeed } from './components/CommandCenter/IncidentFeed';
import { DepartmentPerformance } from './components/CommandCenter/DepartmentPerformance';
import { EarlyWarningView } from './components/EarlyWarning/EarlyWarningView';
import { AlertDetailModal } from './components/EarlyWarning/AlertDetailModal';
import { InterventionTrackerView } from './components/Interventions/InterventionTrackerView';
import { CreateInterventionModal } from './components/Interventions/CreateInterventionModal';
import { IncidentList } from './components/IncidentIntelligence/IncidentList';
import { IncidentDetailModal } from './components/IncidentIntelligence/IncidentDetailModal';
import { GrievanceTable } from './components/GrievanceManagement/GrievanceTable';
import { GrievanceDetailModal } from './components/GrievanceManagement/GrievanceDetailModal';
import { ResourcePlanningView } from './components/ResourcePlanning/ResourcePlanningView';
import { AIAssistantDrawer } from './components/AIAssistant/AIAssistantDrawer';
import { RiskAlert } from './types';

export const AppContent: React.FC = () => {
  const { 
    activeTab, 
    selectedAlert, 
    setSelectedAlert, 
    selectedIncident, 
    setSelectedIncident, 
    selectedGrievance, 
    setSelectedGrievance 
  } = useApp();

  const [isCreateInterventionOpen, setIsCreateInterventionOpen] = useState<boolean>(false);
  const [alertForIntervention, setAlertForIntervention] = useState<RiskAlert | null>(null);

  const handleCreateInterventionFromAlert = (alert: RiskAlert) => {
    setAlertForIntervention(alert);
    setIsCreateInterventionOpen(true);
  };

  const handleOpenBlankIntervention = () => {
    setAlertForIntervention(null);
    setIsCreateInterventionOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Persistent Global Header */}
      <Header />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <SummaryKPIs />
              <DistrictSituationBriefing />

              {/* Grid: Map on Left (7 cols), Feed on Right (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <DistrictMap />
                </div>
                <div className="lg:col-span-5">
                  <IncidentFeed />
                </div>
              </div>

              {/* Department Performance */}
              <DepartmentPerformance />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="animate-in fade-in duration-300">
              <EarlyWarningView onCreateInterventionClick={handleCreateInterventionFromAlert} />
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="animate-in fade-in duration-300">
              <InterventionTrackerView onOpenCreateModal={handleOpenBlankIntervention} />
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="animate-in fade-in duration-300">
              <IncidentList />
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="animate-in fade-in duration-300">
              <GrievanceTable />
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="animate-in fade-in duration-300">
              <ResourcePlanningView />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onCreateIntervention={handleCreateInterventionFromAlert}
      />

      <CreateInterventionModal
        isOpen={isCreateInterventionOpen}
        initialAlert={alertForIntervention}
        onClose={() => setIsCreateInterventionOpen(false)}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      <GrievanceDetailModal
        grievance={selectedGrievance}
        onClose={() => setSelectedGrievance(null)}
      />

      <AIAssistantDrawer onOpenCreateIntervention={handleCreateInterventionFromAlert} />

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
