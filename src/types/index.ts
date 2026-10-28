export type DepartmentType = 'Water Supply' | 'Sanitation' | 'Healthcare' | 'Public Grievances' | 'Roads & Infrastructure' | 'Electricity';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertStatus = 'Investigating' | 'Action Required' | 'Escalated' | 'Monitoring' | 'Resolved';

export type InterventionStatus = 'Assigned' | 'In Progress' | 'Completed';

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface AlertMetricEvidence {
  label: string;
  previousValue: string | number;
  currentValue: string | number;
  unit?: string;
  delta?: string;
  isNegative?: boolean;
}

export interface OperationalAlert {
  id: string;
  title: string;
  department: DepartmentType;
  affectedArea: string;
  wardNumber?: number;
  severity: SeverityLevel;
  riskScore: number; // 0 - 100
  status: AlertStatus;
  evidenceSummary: string;
  timestamp: string;
  isSyntheticDemo: boolean;
  metrics: AlertMetricEvidence[];
  recommendedActions: string[];
  assignedTeam?: string;
  coordinates?: GeoCoordinate;
}

export interface AiExplainResponse {
  alertId: string;
  whatChanged: string[];
  metricsEvidence: {
    metric: string;
    finding: string;
    confidence: 'High' | 'Moderate' | 'Preliminary';
  }[];
  consideredActions: {
    action: string;
    expectedImpact: string;
    tradeoff?: string;
  }[];
  uncertainties: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  priority: PriorityLevel;
  status: InterventionStatus;
  targetArea: string;
  assignedOfficer: string;
  assignedTeam?: string;
  createdAt: string;
  updatedAt: string;
  linkedAlertId?: string;
  linkedAlertTitle?: string;
  progressPercentage: number;
  coordinates?: GeoCoordinate;
}

export interface DepartmentMetricSummary {
  name: DepartmentType;
  code: string;
  leadOfficer: string;
  openGrievances: number;
  resolvedToday: number;
  complianceRate: number; // e.g. 88.5%
  avgResolutionDays: number;
  activeTeams: number;
  trend: 'improving' | 'deteriorating' | 'stable';
  healthScore: number; // 0-100
}

export interface DashboardSummary {
  districtName: string;
  state: string;
  lastUpdated: string;
  kpis: {
    openGrievances: {
      value: number;
      changeVsLastWeek: number;
      unit: string;
    };
    highPriorityAlerts: {
      value: number;
      changeVsLastWeek: number;
      criticalCount: number;
    };
    averageResolutionTime: {
      value: number; // in days
      changeVsLastWeek: number;
      targetDays: number;
    };
    activeInterventions: {
      value: number;
      changeVsLastWeek: number;
      completedThisMonth: number;
    };
  };
  departmentSummaries: DepartmentMetricSummary[];
  resolutionTrendData: {
    date: string;
    received: number;
    resolved: number;
    backlog: number;
  }[];
  departmentComparisonData: {
    department: string;
    openTickets: number;
    resolutionCompliance: number;
    fieldTeams: number;
  }[];
}
