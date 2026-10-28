export type DepartmentId = 
  | 'WATER_SUPPLY'
  | 'SANITATION'
  | 'HEALTHCARE'
  | 'PUBLIC_GRIEVANCES'
  | 'PUBLIC_WORKS'
  | 'EDUCATION';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  code: string;
  headOfficer: string;
  contactNumber: string;
  color: string;
  slaTargetHours: number;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

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

export type GrievancePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type InterventionStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  department: DepartmentId;
  wardId: string;
  wardName: string;
  severity: Severity;
  status: IncidentStatus;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  coordinates: [number, number];
  relatedGrievanceIds: string[];
  assignedTeam?: string;
  decisionNotes?: string;
  investigationNotes: string[];
  auditHistory: AuditEntry[];
  suggestedAction?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  department: DepartmentId;
  category: string;
  wardId: string;
  wardName: string;
  submittedAt: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  citizenName: string;
  citizenPhoneMasked: string;
  address: string;
  coordinates: [number, number];
  relatedIncidentId?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolutionTimeHours?: number;
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  zone: string;
  population: number;
  coordinates: [number, number];
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'SEVERE';
}

export interface RiskAlert {
  id: string;
  title: string;
  department: DepartmentId;
  wardId: string;
  wardName: string;
  severity: Severity;
  riskScore: number; // 0 - 100
  detectedAt: string;
  supportingMetrics: {
    complaintCount: number;
    baselineCount: number;
    surgePercentage: number;
    resolutionTimeAvgHours: number;
    baselineResolutionHours: number;
    resolutionDeteriorationHours: number;
    unresolvedBacklogCount: number;
  };
  comparisonBaseline: string;
  shortExplanation: string;
  suggestedInvestigation: string;
  relatedRecordIds: string[];
  associatedInterventionId?: string;
}

export interface Intervention {
  id: string;
  alertId?: string;
  incidentId?: string;
  title: string;
  department: DepartmentId;
  wardId: string;
  wardName: string;
  priority: Severity;
  status: InterventionStatus;
  assignedTo: string;
  proposedAction: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes: Array<{
    id: string;
    timestamp: string;
    author: string;
    text: string;
  }>;
  history: AuditEntry[];
}

export interface ScenarioAssumption {
  id: string;
  department: DepartmentId;
  title: string;
  totalBacklogCases: number;
  teamsDeployed: number;
  avgHoursPerCase: number;
  workHoursPerDay: number;
  estimatedResolutionDays: number;
}
