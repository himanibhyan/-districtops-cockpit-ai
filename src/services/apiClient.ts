/**
 * Central API Client for DistrictOps Cockpit AI
 * Connects React frontend components to FastAPI backend.
 * Gracefully falls back to mock data if backend is offline.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BackendHealth {
  status: string;
  datasets: {
    sanitation: { loaded: boolean; rows: number };
    hmis: { loaded: boolean; rows: number };
    kml_wards: { loaded: boolean; features: number };
    water_coverage: { loaded: boolean; rows: number };
  };
}

export interface BackendDashboardSummary {
  sanitation: {
    available: boolean;
    total_records: number;
    national_avg_coverage_pct: number;
    haryana_avg_coverage_pct: number;
    districts_below_100_pct: number;
  };
  health: {
    available: boolean;
    total_records: number;
    records_with_values: number;
    district_count: number;
    fiscal_year_count: number;
  };
  water: {
    available: boolean;
    total_states_uts: number;
    haryana_coverage_pct: number;
    national_avg_coverage_pct: number;
  };
  geo: {
    available: boolean;
    total_ward_features: number;
    town: string;
    state: string;
  };
}

export interface BackendAlert {
  id: string;
  department: string;
  title: string;
  district_zone: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  created_at: string;
  evidence: {
    previous_complaints: number;
    current_complaints: number;
    complaint_delta_pct: number;
    previous_resolution_days: number;
    current_resolution_days: number;
    resolution_delta_pct: number;
    previous_maintenance_teams: number;
    current_maintenance_teams: number;
    capacity_pressure_pct: number;
  };
}

export interface BackendIntervention {
  is_synthetic: boolean;
  id: string;
  alert_id: string;
  title: string;
  action_type: string;
  priority: string;
  status: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export const apiClient = {
  /** Check backend health */
  async getHealth(): Promise<BackendHealth | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Get integrated datasets summary */
  async getDashboardSummary(): Promise<BackendDashboardSummary | null> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/dashboard/summary`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Get Contract alerts */
  async getAlerts(): Promise<BackendAlert[]> {
    try {
      const res = await fetch(`${API_BASE}/api/alerts`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return [];
      const data = await res.json();
      return data.alerts || [];
    } catch {
      return [];
    }
  },

  /** Get AI / Evidence explanation for an alert */
  async explainAlert(alertId: string, userNote?: string) {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${alertId}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus_area: 'RESOURCE_ALLOCATION', user_note: userNote }),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** List persistent interventions */
  async getInterventions(): Promise<BackendIntervention[]> {
    try {
      const res = await fetch(`${API_BASE}/api/interventions`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return [];
      const data = await res.json();
      return data.interventions || [];
    } catch {
      return [];
    }
  },

  /** Create new persistent intervention */
  async createIntervention(data: {
    alert_id: string;
    title: string;
    action_type: string;
    priority: string;
    assigned_to: string;
    notes?: string;
  }): Promise<BackendIntervention | null> {
    try {
      const res = await fetch(`${API_BASE}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Patch intervention status / notes */
  async updateIntervention(id: string, status?: string, notes?: string): Promise<BackendIntervention | null> {
    try {
      const res = await fetch(`${API_BASE}/api/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /** Fetch GeoJSON boundaries for Gurugram wards */
  async getWardGeoJSON(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/map/features?layer_id=gurugram-wards`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
