import {
  DashboardSummary,
  OperationalAlert,
  Intervention,
  AiExplainResponse,
  InterventionStatus
} from '../types';
import {
  INITIAL_DASHBOARD_DATA,
  INITIAL_ALERTS,
  INITIAL_INTERVENTIONS,
  MOCK_AI_EXPLANATIONS,
  getDefaultAiExplanation
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export interface ApiResponse<T> {
  data: T;
  isDemo: boolean;
  message?: string;
}

// In-memory persistent state for synthetic demo mode
let localAlerts: OperationalAlert[] = [...INITIAL_ALERTS];
let localInterventions: Intervention[] = [...INITIAL_INTERVENTIONS];
let localDashboard: DashboardSummary = { ...INITIAL_DASHBOARD_DATA };

// Helper to determine if we should attempt network calls
const canCallNetwork = (): boolean => {
  return typeof BASE_URL === 'string' && BASE_URL.trim().length > 0;
};

/**
 * Centralized API Service for DistrictOps Cockpit AI.
 * Communicates with backend endpoints when VITE_API_BASE_URL is set,
 * or gracefully returns synthetic demo data with zero crashes.
 */
export const apiService = {
  /**
   * Check if running in synthetic demo mode
   */
  isDemoMode(): boolean {
    return !canCallNetwork();
  },

  /**
   * GET /api/dashboard
   */
  async getDashboard(): Promise<ApiResponse<DashboardSummary>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/dashboard`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn('[DistrictOps API] Backend unreachable, falling back to synthetic demonstration data:', err);
      }
    }

    // Update dynamic KPI counts from local state
    const activeCount = localInterventions.filter(i => i.status !== 'Completed').length;
    const highAlertCount = localAlerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length;
    const criticalCount = localAlerts.filter(a => a.severity === 'Critical').length;

    const summary: DashboardSummary = {
      ...localDashboard,
      kpis: {
        ...localDashboard.kpis,
        highPriorityAlerts: {
          ...localDashboard.kpis.highPriorityAlerts,
          value: highAlertCount,
          criticalCount
        },
        activeInterventions: {
          ...localDashboard.kpis.activeInterventions,
          value: activeCount
        }
      }
    };

    return { data: summary, isDemo: true };
  },

  /**
   * GET /api/alerts
   */
  async getAlerts(filters?: { department?: string; severity?: string; query?: string }): Promise<ApiResponse<OperationalAlert[]>> {
    if (canCallNetwork()) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.department && filters.department !== 'All') queryParams.append('department', filters.department);
        if (filters?.severity && filters.severity !== 'All') queryParams.append('severity', filters.severity);
        if (filters?.query) queryParams.append('q', filters.query);

        const url = `${BASE_URL}/api/alerts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn('[DistrictOps API] Backend unreachable, falling back to synthetic alerts:', err);
      }
    }

    // Filter local alerts
    let results = [...localAlerts];
    if (filters?.department && filters.department !== 'All') {
      results = results.filter(a => a.department.toLowerCase() === filters.department?.toLowerCase());
    }
    if (filters?.severity && filters.severity !== 'All') {
      results = results.filter(a => a.severity.toLowerCase() === filters.severity?.toLowerCase());
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.affectedArea.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }

    // Sort by risk score descending
    results.sort((a, b) => b.riskScore - a.riskScore);

    return { data: results, isDemo: true };
  },

  /**
   * GET /api/alerts/{id}
   */
  async getAlertById(id: string): Promise<ApiResponse<OperationalAlert | null>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/alerts/${encodeURIComponent(id)}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn(`[DistrictOps API] Failed to fetch alert ${id}:`, err);
      }
    }

    const found = localAlerts.find(a => a.id === id) || null;
    return { data: found, isDemo: true };
  },

  /**
   * POST /api/alerts/{id}/explain
   * AI Decision Assistant endpoint
   */
  async explainAlert(id: string): Promise<ApiResponse<AiExplainResponse>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/alerts/${encodeURIComponent(id)}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn(`[DistrictOps API] AI explain endpoint unreachable for ${id}:`, err);
      }
    }

    // Simulated short AI processing latency for authentic feel
    await new Promise(resolve => setTimeout(resolve, 600));

    if (MOCK_AI_EXPLANATIONS[id]) {
      return { data: MOCK_AI_EXPLANATIONS[id], isDemo: true };
    }

    const alert = localAlerts.find(a => a.id === id);
    if (alert) {
      return { data: getDefaultAiExplanation(alert), isDemo: true };
    }

    return {
      data: {
        alertId: id,
        whatChanged: ['No historical change data recorded for this alert identifier.'],
        metricsEvidence: [],
        consideredActions: [],
        uncertainties: ['Alert record does not exist in local operational cache.'],
        disclaimer: 'Administrative demonstration record only.',
        generatedAt: new Date().toISOString()
      },
      isDemo: true
    };
  },

  /**
   * GET /api/interventions
   */
  async getInterventions(): Promise<ApiResponse<Intervention[]>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/interventions`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn('[DistrictOps API] Failed to fetch interventions:', err);
      }
    }

    return { data: [...localInterventions], isDemo: true };
  },

  /**
   * POST /api/interventions
   */
  async createIntervention(payload: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'>): Promise<ApiResponse<Intervention>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/interventions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn('[DistrictOps API] Failed to create intervention on server:', err);
      }
    }

    const newIntervention: Intervention = {
      ...payload,
      id: `INT-2026-${String(localInterventions.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      updatedAt: 'Just now',
      progressPercentage: payload.status === 'Completed' ? 100 : payload.status === 'In Progress' ? 50 : 15
    };

    localInterventions = [newIntervention, ...localInterventions];
    return { data: newIntervention, isDemo: true };
  },

  /**
   * PATCH /api/interventions/{id}
   */
  async updateInterventionStatus(id: string, status: InterventionStatus): Promise<ApiResponse<Intervention | null>> {
    if (canCallNetwork()) {
      try {
        const res = await fetch(`${BASE_URL}/api/interventions/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (err) {
        console.warn(`[DistrictOps API] Failed to update intervention ${id}:`, err);
      }
    }

    const index = localInterventions.findIndex(i => i.id === id);
    if (index !== -1) {
      const updated: Intervention = {
        ...localInterventions[index],
        status,
        progressPercentage: status === 'Completed' ? 100 : status === 'In Progress' ? 65 : 20,
        updatedAt: 'Just now'
      };
      localInterventions[index] = updated;
      return { data: updated, isDemo: true };
    }

    return { data: null, isDemo: true, message: 'Intervention not found' };
  }
};
