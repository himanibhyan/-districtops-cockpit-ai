// Canonical DistrictOps Cockpit AI Data Models
// Reconciles geospatial operational models and algorithmic risk governance models

export type DepartmentType =
  | 'Water Supply'
  | 'Sanitation'
  | 'Healthcare'
  | 'Public Grievances'
  | 'Roads & Infrastructure'
  | 'Electricity'
  | 'Public Works'
  | 'Education';

export type DepartmentId =
  | 'WATER_SUPPLY'
  | 'SANITATION'
  | 'HEALTHCARE'
  | 'PUBLIC_GRIEVANCES'
  | 'ROADS_INFRA'
  | 'ELECTRICITY'
  | 'PUBLIC_WORKS'
  | 'EDUCATION';

export interface DepartmentInfo {
  id: DepartmentId;
  name: DepartmentType;
  code: string;
  headOfficer: string;
  contactNumber: string;
  color: string;
  slaTargetHours: number;
}

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus =
  | 'Investigating'
  | 'Action Required'
  | 'Escalated'
  | 'Monitoring'
  | 'Resolved';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'ESCALATED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type GrievanceStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type GrievancePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'Urgent' | 'High' | 'Medium' | 'Low';

export type InterventionStatus = 'Assigned' | 'In Progress' | 'Completed' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface AlertMetricEvidence {
  label: string;
  previousValue: string | number;
  currentValue: string | number;
  unit?: string;
  delta?: string;
  isNegative?: boolean;
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  zone: string;
  population: number;
  coordinates: [number, number]; // [lat, lng]
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'SEVERE';
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  departmentId?: DepartmentId;
  category: string;
  wardId: string;
  wardName: string;
  submittedAt: string;
  priority: SeverityLevel;
  status: GrievanceStatus;
  citizenName: string;
  citizenPhoneMasked: string;
  address: string;
  coordinates: GeoCoordinate;
  relatedAlertId?: string;
  relatedIncidentId?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolutionTimeHours?: number;
}

export interface OperationalAlert {
  id: string;
  title: string;
  department: DepartmentType;
  departmentId?: DepartmentId;
  affectedArea: string;
  wardNumber?: number;
  wardId?: string;
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
  relatedGrievanceIds?: string[];
  associatedInterventionId?: string;
  comparisonBaseline?: string;
  suggestedInvestigation?: string;
}

// Alias for Teammate compatibility
export type RiskAlert = OperationalAlert;

export interface Incident {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  departmentId?: DepartmentId;
  wardId: string;
  wardName: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  coordinates: GeoCoordinate;
  relatedGrievanceIds: string[];
  assignedTeam?: string;
  decisionNotes?: string;
  investigationNotes: string[];
  auditHistory: AuditEntry[];
  suggestedAction?: string;
}

export interface InterventionNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  departmentId?: DepartmentId;
  priority: PriorityLevel;
  status: InterventionStatus;
  targetArea: string;
  wardId?: string;
  wardName?: string;
  assignedOfficer: string;
  assignedTeam?: string;
  assignedTo?: string; // teammate compat
  proposedAction?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  linkedAlertId?: string;
  linkedAlertTitle?: string;
  alertId?: string; // teammate compat
  incidentId?: string; // teammate compat
  progressPercentage: number;
  coordinates?: GeoCoordinate;
  notes?: InterventionNote[];
  history?: AuditEntry[];
}

export interface ScenarioAssumption {
  id: string;
  department: DepartmentType;
  departmentId?: DepartmentId;
  title: string;
  totalBacklogCases: number;
  teamsDeployed: number;
  avgHoursPerCase: number;
  workHoursPerDay: number;
  estimatedResolutionDays: number;
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

// Normalization Utilities at the Data Boundary
export function departmentIdToName(id: string): DepartmentType {
  switch (id.toUpperCase()) {
    case 'WATER_SUPPLY':
      return 'Water Supply';
    case 'SANITATION':
      return 'Sanitation';
    case 'HEALTHCARE':
      return 'Healthcare';
    case 'PUBLIC_GRIEVANCES':
      return 'Public Grievances';
    case 'ROADS_INFRA':
    case 'PUBLIC_WORKS':
      return 'Roads & Infrastructure';
    case 'ELECTRICITY':
      return 'Electricity';
    case 'EDUCATION':
      return 'Education';
    default:
      return 'Public Grievances';
  }
}

export function departmentNameToId(name: string): DepartmentId {
  switch (name) {
    case 'Water Supply':
      return 'WATER_SUPPLY';
    case 'Sanitation':
      return 'SANITATION';
    case 'Healthcare':
      return 'HEALTHCARE';
    case 'Public Grievances':
      return 'PUBLIC_GRIEVANCES';
    case 'Roads & Infrastructure':
    case 'Public Works':
      return 'ROADS_INFRA';
    case 'Electricity':
      return 'ELECTRICITY';
    case 'Education':
      return 'EDUCATION';
    default:
      return 'PUBLIC_GRIEVANCES';
  }
}

export function normalizeSeverity(sev: string): SeverityLevel {
  const s = sev.toUpperCase();
  if (s === 'CRITICAL') return 'Critical';
  if (s === 'HIGH') return 'High';
  if (s === 'MEDIUM') return 'Medium';
  return 'Low';
}

export function toSeverityCode(sev: string): Severity {
  const s = sev.toUpperCase();
  if (s === 'CRITICAL') return 'CRITICAL';
  if (s === 'HIGH') return 'HIGH';
  if (s === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

export function normalizeInterventionStatus(status: string): 'Assigned' | 'In Progress' | 'Completed' {
  const s = status.toUpperCase();
  if (s === 'RESOLVED' || s === 'COMPLETED') return 'Completed';
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'In Progress';
  return 'Assigned';
}
