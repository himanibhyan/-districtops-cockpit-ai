import {
  DashboardSummary,
  OperationalAlert,
  Intervention,
  AiExplainResponse
} from '../types';

export const INITIAL_DASHBOARD_DATA: DashboardSummary = {
  districtName: 'Dharani South Administrative District',
  state: 'State Operations HQ',
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  kpis: {
    openGrievances: {
      value: 1428,
      changeVsLastWeek: -4.8,
      unit: 'tickets'
    },
    highPriorityAlerts: {
      value: 6,
      changeVsLastWeek: +2,
      criticalCount: 2
    },
    averageResolutionTime: {
      value: 2.8,
      changeVsLastWeek: +0.4,
      targetDays: 2.0
    },
    activeInterventions: {
      value: 9,
      changeVsLastWeek: +3,
      completedThisMonth: 28
    }
  },
  departmentSummaries: [
    {
      name: 'Water Supply',
      code: 'WTR',
      leadOfficer: 'Dr. A. Ramanathan (Chief Engineer)',
      openGrievances: 312,
      resolvedToday: 48,
      complianceRate: 74.2,
      avgResolutionDays: 3.2,
      activeTeams: 5,
      trend: 'deteriorating',
      healthScore: 68
    },
    {
      name: 'Sanitation',
      code: 'SNT',
      leadOfficer: 'Smt. Kavitha Meena (Municipal Commissioner)',
      openGrievances: 445,
      resolvedToday: 112,
      complianceRate: 83.5,
      avgResolutionDays: 2.4,
      activeTeams: 14,
      trend: 'improving',
      healthScore: 81
    },
    {
      name: 'Healthcare',
      code: 'HLT',
      leadOfficer: 'Dr. Sanjay Deshmukh (Chief Medical Officer)',
      openGrievances: 189,
      resolvedToday: 35,
      complianceRate: 88.0,
      avgResolutionDays: 1.9,
      activeTeams: 9,
      trend: 'stable',
      healthScore: 89
    },
    {
      name: 'Public Grievances',
      code: 'PGR',
      leadOfficer: 'Shri R. K. Verma (District Magistrate Secretariat)',
      openGrievances: 482,
      resolvedToday: 120,
      complianceRate: 79.1,
      avgResolutionDays: 3.5,
      activeTeams: 11,
      trend: 'stable',
      healthScore: 76
    }
  ],
  resolutionTrendData: [
    { date: 'Oct 15', received: 142, resolved: 150, backlog: 1490 },
    { date: 'Oct 17', received: 165, resolved: 155, backlog: 1500 },
    { date: 'Oct 19', received: 180, resolved: 160, backlog: 1520 },
    { date: 'Oct 21', received: 195, resolved: 172, backlog: 1543 },
    { date: 'Oct 23', received: 210, resolved: 190, backlog: 1563 },
    { date: 'Oct 25', received: 178, resolved: 204, backlog: 1537 },
    { date: 'Oct 27', received: 152, resolved: 220, backlog: 1469 },
    { date: 'Today', received: 135, resolved: 176, backlog: 1428 }
  ],
  departmentComparisonData: [
    { department: 'Water Supply', openTickets: 312, resolutionCompliance: 74.2, fieldTeams: 5 },
    { department: 'Sanitation', openTickets: 445, resolutionCompliance: 83.5, fieldTeams: 14 },
    { department: 'Healthcare', openTickets: 189, resolutionCompliance: 88.0, fieldTeams: 9 },
    { department: 'Public Grievances', openTickets: 482, resolutionCompliance: 79.1, fieldTeams: 11 }
  ]
};

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'ALT-WTR-2026-089',
    title: 'Drinking Water Pipeline Contamination & Rapid Pressure Drop',
    department: 'Water Supply',
    affectedArea: 'Ward 7 — Subhash Nagar & Indirapuram Sector 4',
    wardNumber: 7,
    severity: 'Critical',
    riskScore: 94,
    status: 'Action Required',
    evidenceSummary: 'Anomalous surge in water discoloration complaints (+38%) coupled with sudden drop in line pressure and shortage of active field maintenance teams.',
    timestamp: '18 mins ago',
    isSyntheticDemo: true,
    metrics: [
      {
        label: 'Citizen Complaints',
        previousValue: 100,
        currentValue: 138,
        unit: 'registered cases',
        delta: '+38%',
        isNegative: true
      },
      {
        label: 'Avg Resolution Time',
        previousValue: '2.0',
        currentValue: '3.2',
        unit: 'days',
        delta: '+60% delay',
        isNegative: true
      },
      {
        label: 'Available Maintenance Teams',
        previousValue: 8,
        currentValue: 5,
        unit: 'field squads',
        delta: '-3 squads (-37.5%)',
        isNegative: true
      },
      {
        label: 'Pipeline Pressure Sensor (PS-07)',
        previousValue: '2.4 bar',
        currentValue: '0.9 bar',
        unit: 'bar',
        delta: '-62.5% below baseline',
        isNegative: true
      }
    ],
    recommendedActions: [
      'Dispatch mobile acoustic leak detection van to Indirapuram feeder line 3B.',
      'Deploy 4 emergency drinking water tanker convoys to Ward 7 high-density clusters.',
      'Recall 3 maintenance squads from non-critical preventive maintenance in Ward 14.',
      'Issue targeted boil-water precautionary advisory via SMS to 14,200 registered households.'
    ],
    assignedTeam: 'Rapid Response Hydraulic Squad 2'
  },
  {
    id: 'ALT-HLT-2026-042',
    title: 'Primary Health Centre Cold-Chain Vaccine Temperature Excursion',
    department: 'Healthcare',
    affectedArea: 'Ward 3 — Rural Dispensary Belt & Sector 9 Sub-Center',
    wardNumber: 3,
    severity: 'Critical',
    riskScore: 89,
    status: 'Escalated',
    evidenceSummary: 'Secondary refrigeration unit logged 11.4°C (permitted range 2°C–8°C) for over 135 minutes following local transformer failure.',
    timestamp: '42 mins ago',
    isSyntheticDemo: true,
    metrics: [
      {
        label: 'Cold Storage Ambient Temp',
        previousValue: '4.2°C',
        currentValue: '11.4°C',
        unit: 'Celsius',
        delta: '+7.2°C above upper threshold',
        isNegative: true
      },
      {
        label: 'Affected Vaccine Vials at Risk',
        previousValue: 0,
        currentValue: 460,
        unit: 'vials',
        delta: 'Critical thermal risk',
        isNegative: true
      },
      {
        label: 'Standby Generator Fuel Level',
        previousValue: '85%',
        currentValue: '12%',
        unit: 'capacity',
        delta: 'Exhaustion warning',
        isNegative: true
      }
    ],
    recommendedActions: [
      'Immediate courier transfer of cold boxes to District Base Hospital cold vault.',
      'Direct District Electricity Board to bypass transformer feed for Ward 3 PHC line.',
      'Quarantine exposed pentavalent and measles vials until quality assurance clearance.'
    ],
    assignedTeam: 'District Vaccine Logistics Cell'
  },
  {
    id: 'ALT-SNT-2026-114',
    title: 'Solid Waste Aggregation & Transfer Station Choke',
    department: 'Sanitation',
    affectedArea: 'Ward 12 — Central Wholesale Market & Transit Depot',
    wardNumber: 12,
    severity: 'High',
    riskScore: 78,
    status: 'Investigating',
    evidenceSummary: 'Compactor vehicle availability fell by 30% due to depot maintenance, resulting in 42 metric tons of unlifted biodegradable market refuse.',
    timestamp: '1 hour ago',
    isSyntheticDemo: true,
    metrics: [
      {
        label: 'Uncleared Solid Waste',
        previousValue: '12 MT',
        currentValue: '42 MT',
        unit: 'metric tons',
        delta: '+250% overflow',
        isNegative: true
      },
      {
        label: 'Operational Compactor Trucks',
        previousValue: 10,
        currentValue: 7,
        unit: 'vehicles',
        delta: '-3 vehicles out of service',
        isNegative: true
      },
      {
        label: 'Public Grievance Escalations',
        previousValue: 14,
        currentValue: 48,
        unit: 'merchant complaints',
        delta: '+242%',
        isNegative: true
      }
    ],
    recommendedActions: [
      'Re-route 4 spare hook-loader vehicles from Northern Municipal Zone.',
      'Authorize evening clearance shift with temporary driver allowance.',
      'Apply anti-larval disinfectant spray across market buffer zone.'
    ],
    assignedTeam: 'Zone 4 Waste Management Wing'
  },
  {
    id: 'ALT-PGR-2026-205',
    title: 'Street Lighting & Night Safety Citizen Grievance Cluster',
    department: 'Public Grievances',
    affectedArea: 'Ward 19 — Outer Ring Road Corridor & Transit Hub',
    wardNumber: 19,
    severity: 'Medium',
    riskScore: 65,
    status: 'Monitoring',
    evidenceSummary: 'Unresolved lighting tickets exceeded 72-hour statutory SLA across a 3.4 km stretch following monsoon storm circuit breaker tripping.',
    timestamp: '3 hours ago',
    isSyntheticDemo: true,
    metrics: [
      {
        label: 'Dark Corridor Dark Spots',
        previousValue: 12,
        currentValue: 64,
        unit: 'luminaire poles',
        delta: '+433%',
        isNegative: true
      },
      {
        label: 'Pending SLA Breaches',
        previousValue: 4,
        currentValue: 27,
        unit: 'tickets >72h',
        delta: '+23 overdue',
        isNegative: true
      }
    ],
    recommendedActions: [
      'Issue performance cure notice to third-party concessionaire (M/s Lumina Infra).',
      'Authorize mobile cherry-picker repair squad deployment for night overhaul.'
    ],
    assignedTeam: 'Electrical Engineering Wing'
  },
  {
    id: 'ALT-HLT-2026-078',
    title: 'Emergency Triage Congestion & Bed Occupancy Saturation',
    department: 'Healthcare',
    affectedArea: 'District Civil Hospital — Trauma & Emergency Block',
    wardNumber: 1,
    severity: 'High',
    riskScore: 82,
    status: 'Action Required',
    evidenceSummary: 'Emergency department bed occupancy hit 104% due to seasonal respiratory and viral admissions, extending average wait times to 110 minutes.',
    timestamp: '5 hours ago',
    isSyntheticDemo: true,
    metrics: [
      {
        label: 'Triage Bed Occupancy',
        previousValue: '78%',
        currentValue: '104%',
        unit: 'occupancy',
        delta: '+26% overload',
        isNegative: true
      },
      {
        label: 'Average Wait Time to Doctor',
        previousValue: '35 mins',
        currentValue: '110 mins',
        unit: 'minutes',
        delta: '+214%',
        isNegative: true
      }
    ],
    recommendedActions: [
      'Activate Level-2 Surge Protocol; convert Day Care Ward 4 to emergency step-down.',
      'Reassign 6 medical residents from elective surgery OPD to trauma triage.',
      'Coordinate patient diversion protocol with Sub-Divisional Hospital East.'
    ],
    assignedTeam: 'Hospital Emergency Incident Officer'
  }
];

export const INITIAL_INTERVENTIONS: Intervention[] = [
  {
    id: 'INT-2026-001',
    title: 'Deploy Emergency Water Tanker Fleet to Ward 7 High-Density Choke Points',
    description: 'Mobilize 6 GPS-tracked civic water tankers (10,000L capacity) to Indirapuram Sector 4 and Subhash Nagar community wells while main supply line undergoes acoustic pressure testing.',
    department: 'Water Supply',
    priority: 'Urgent',
    status: 'In Progress',
    targetArea: 'Ward 7 (Subhash Nagar)',
    assignedOfficer: 'Er. Rajesh Nair (Superintending Engineer)',
    assignedTeam: 'Civil Water Logistics Taskforce',
    createdAt: '2026-10-28 08:30 AM',
    updatedAt: '2026-10-28 09:45 AM',
    linkedAlertId: 'ALT-WTR-2026-089',
    linkedAlertTitle: 'Drinking Water Pipeline Contamination & Rapid Pressure Drop',
    progressPercentage: 65
  },
  {
    id: 'INT-2026-002',
    title: 'Relocate Ward 3 Vaccine Stock & Install Standby Diesel Generator',
    description: 'Relocate temperature-sensitive immunization batches under continuous cold-box monitoring to District Base Hospital cold vault; deploy 25kVA generator to PHC Ward 3.',
    department: 'Healthcare',
    priority: 'Urgent',
    status: 'Assigned',
    targetArea: 'Ward 3 (Rural PHC Sub-Center)',
    assignedOfficer: 'Dr. Suniti Rao (Cold Chain Officer)',
    assignedTeam: 'Rapid Cold Chain Emergency Unit',
    createdAt: '2026-10-28 09:15 AM',
    updatedAt: '2026-10-28 09:30 AM',
    linkedAlertId: 'ALT-HLT-2026-042',
    linkedAlertTitle: 'Primary Health Centre Cold-Chain Vaccine Temperature Excursion',
    progressPercentage: 25
  },
  {
    id: 'INT-2026-003',
    title: 'Night Clearance & Hook-Loader Mobilization at Wholesale Market Depot',
    description: 'Contract 4 secondary haulage hook-loaders to clear 42 metric tons of accumulation in Ward 12 wholesale market zone prior to morning trading hours.',
    department: 'Sanitation',
    priority: 'High',
    status: 'In Progress',
    targetArea: 'Ward 12 (Central Wholesale Market)',
    assignedOfficer: 'Shri Manoj Patil (Chief Sanitary Inspector)',
    assignedTeam: 'Depot Fleet Operations',
    createdAt: '2026-10-27 19:00 PM',
    updatedAt: '2026-10-28 07:15 AM',
    linkedAlertId: 'ALT-SNT-2026-114',
    linkedAlertTitle: 'Solid Waste Aggregation & Transfer Station Choke',
    progressPercentage: 80
  },
  {
    id: 'INT-2026-004',
    title: 'Outer Ring Road Streetlight Concessionaire SLA Enforcement & Audit',
    description: 'Issue formal 48-hour cure notice to concessionaire; conduct joint nodal inspection of 64 non-operational poles along the 3.4 km outer ring corridor.',
    department: 'Public Grievances',
    priority: 'Medium',
    status: 'Completed',
    targetArea: 'Ward 19 (Outer Ring Road Corridor)',
    assignedOfficer: 'Ms. Priyadarshini K. (Nodal Officer - Infrastructure)',
    assignedTeam: 'District SLA Compliance Cell',
    createdAt: '2026-10-26 11:00 AM',
    updatedAt: '2026-10-27 18:00 PM',
    linkedAlertId: 'ALT-PGR-2026-205',
    linkedAlertTitle: 'Street Lighting & Night Safety Citizen Grievance Cluster',
    progressPercentage: 100
  }
];

export const MOCK_AI_EXPLANATIONS: Record<string, AiExplainResponse> = {
  'ALT-WTR-2026-089': {
    alertId: 'ALT-WTR-2026-089',
    whatChanged: [
      'Citizen grievance volume in Ward 7 surged from a baseline of 100 to 138 reported cases within a 48-hour window (+38% increase).',
      'Average ticket turnaround time degraded from 2.0 days to 3.2 days (+60% deterioration in service level compliance).',
      'Available operational field maintenance teams dropped from 8 active squads to 5 squads due to unscheduled equipment servicing and concurrent deployments in Ward 14.',
      'Telemetry on Feeder Pressure Station PS-07 showed pressure collapse from 2.4 bar to 0.9 bar, indicating possible joint rupture or illegal siphon breaches.'
    ],
    metricsEvidence: [
      {
        metric: 'Grievance Clustering (Ward 7)',
        finding: '82% of newly submitted complaints explicitly report turbid/muddy water and sulfurous odor along Subhash Nagar Main Road.',
        confidence: 'High'
      },
      {
        metric: 'Pressure Differential (PS-07 to Indirapuram)',
        finding: 'A sudden -1.5 bar drop occurred simultaneously with complaint spikes, correlating with a physical structural pipe breach.',
        confidence: 'High'
      },
      {
        metric: 'Maintenance Capacity Deficit',
        finding: 'With only 5 squads available, average workload per crew increased from 12.5 cases/day to 27.6 cases/day, creating a compounding resolution backlog.',
        confidence: 'Moderate'
      }
    ],
    consideredActions: [
      {
        action: 'Deploy emergency drinking water tankers (4 units) to Indirapuram Sector 4 and Subhash Nagar community points.',
        expectedImpact: 'Mitigates immediate drinking water distress for ~14,000 residents while pipeline isolation proceeds.',
        tradeoff: 'High operating cost; temporary traffic slowdown along Subhash Nagar main road.'
      },
      {
        action: 'Recall 3 maintenance crews from scheduled routine preventive line descaling in Ward 14.',
        expectedImpact: 'Restores response squad availability to 8 squads, bringing backlog clearance timeline from 3.2 days back down to under 2.1 days.',
        tradeoff: 'Delays non-critical maintenance in Ward 14 by 72 hours.'
      },
      {
        action: 'Acoustic pipe correlator inspection of Feeder Line 3B junction.',
        expectedImpact: 'Pinpoints underground rupture location within 1.5 meters without destructive road trenching.',
        tradeoff: 'Requires 2-hour localized supply isolation during daytime testing.'
      }
    ],
    uncertainties: [
      'Telemetry does not provide real-time microbial or heavy metal lab assay results; biological safety status remains unconfirmed until lab grab samples return in 4 hours.',
      'Whether water discoloration is solely caused by pipeline depressurization backflow or secondary cross-contamination with a nearby stormwater culvert is unverified on-ground.',
      'Uncertain whether 5 squads are hindered by specialized excavation equipment shortages or staffing absenteeism.'
    ],
    disclaimer: 'AI Decision Assistant guidance is synthesized from live municipal sensor feeds and grievance log patterns. This is administrative decision-support only; it does not replace certified on-ground municipal engineer inspection.',
    generatedAt: new Date().toISOString()
  }
};

export const getDefaultAiExplanation = (alert: OperationalAlert): AiExplainResponse => {
  return {
    alertId: alert.id,
    whatChanged: [
      `Grievance and sensor indicators for ${alert.department} in ${alert.affectedArea} exhibited a sharp anomalous spike surpassing standard deviation thresholds.`,
      `Service resolution SLA experienced an observed delay, with operational risk evaluated at ${alert.riskScore}/100.`,
      `Departmental response resources currently face constrained availability or triage saturation.`
    ],
    metricsEvidence: alert.metrics.map(m => ({
      metric: m.label,
      finding: `Value shifted from ${m.previousValue} to ${m.currentValue} ${m.unit || ''} (${m.delta || 'unfavorable shift'}).`,
      confidence: 'High' as const
    })),
    consideredActions: alert.recommendedActions.map(action => ({
      action,
      expectedImpact: 'Accelerates triage containment and prevents cross-departmental administrative escalation.',
      tradeoff: 'May require temporary resource reprioritization from routine workflows.'
    })),
    uncertainties: [
      'Field ground-truth inspection is required to verify sensor accuracy and physical infrastructure integrity.',
      'Full secondary impact on neighboring wards cannot be determined from telemetry alone until ground teams complete physical verification.',
      'Citizen grievance logs may exhibit reporting lag or geographical clustering bias.'
    ],
    disclaimer: 'AI Decision Assistant output is algorithmic demonstration data synthesized from reported logs and telemetric indicators. Ground-truth field verification must precede binding executive or legal orders.',
    generatedAt: new Date().toISOString()
  };
};
