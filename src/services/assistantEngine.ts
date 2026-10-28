import { Grievance, Incident, Intervention, RiskAlert } from '../types';
import { calculateDashboardKPIs, calculateDepartmentMetrics, generateRiskAlerts } from './riskEngine';
import { DEPARTMENTS } from '../data/mockData';

export interface AssistantAnswer {
  question: string;
  directAnswer: string;
  whyItMatters: string;
  keyInsights: string[];
  recommendedSteps: string[];
  responsibleDepartment: string;
  evidence: {
    source: string;
    computedMetrics: Record<string, string | number>;
    citedRecordIds: string[];
    limitations: string;
  };
  suggestedActionType?: 'CREATE_INTERVENTION' | 'VIEW_INCIDENT' | 'VIEW_ALERT';
  actionTargetId?: string;
}

export const SUGGESTED_QUESTIONS = [
  'Which issues require attention first?',
  'Why are water-supply complaints increasing?',
  'Which department has the largest unresolved backlog?',
  'Which wards have the most concerning service trends?',
  'What changed compared with the previous reporting period?',
  'What should the administration investigate first?',
  'What corrective action could address this problem?'
];

export function queryDistrictOpsAssistant(
  rawQuery: string,
  incidents: Incident[],
  grievances: Grievance[],
  alerts: RiskAlert[],
  interventions: Intervention[]
): AssistantAnswer {
  const query = rawQuery.toLowerCase().trim();
  const kpis = calculateDashboardKPIs(incidents, grievances, alerts, interventions);
  const deptMetrics = calculateDepartmentMetrics(incidents, grievances);

  // 1. "Which issues require attention first?"
  if (query.includes('attention first') || query.includes('priority') || query.includes('urgent')) {
    const topAlert = alerts.find(a => a.severity === 'CRITICAL') || alerts[0];
    return {
      question: rawQuery,
      directAnswer: `Top administrative priority is ${topAlert ? topAlert.title : 'Incident INC-2026-089'}. Risk Score is currently ${topAlert ? topAlert.riskScore : 92}/100 with severe public health hazard in Ward 4.`,
      whyItMatters: 'Contaminated water supply combined with 5 pediatric gastrointestinal clinic admissions presents an acute disease transmission risk if feeder isolation is delayed.',
      keyInsights: [
        'Ward 4 (Shastri Nagar) has 8 clustered complaints indicating foul odor, turbidity, and sewage mixing.',
        'Secondary urgent issue: Ward 7 (Kalyanpur Mandi) has 42 metric tons of accumulating solid waste threatening the wholesale food market.',
        `Across the district, there are ${kpis.criticalAlertsCount} critical/high alerts requiring immediate executive intervention.`
      ],
      recommendedSteps: [
        '1. Ensure Zonal Feeder Valve #14 in Shastri Nagar is immediately isolated to stop contaminant spread.',
        '2. Authorize 8 emergency potable water bowsers for Blocks C & D.',
        '3. Issue immediate Intervention Order assigning DJB Rapid Repair Squad and Joint Health Surveillance Team.'
      ],
      responsibleDepartment: 'District Water Supply & Sewerage Board (DWSSB) + Health Directorate',
      evidence: {
        source: 'DistrictOps Early Warning Engine & Citizen Grievance Registry (last 48 hrs)',
        computedMetrics: {
          'Risk Score': topAlert ? `${topAlert.riskScore}/100` : '92/100',
          'Ward 4 Water Complaints': grievances.filter(g => g.wardId === 'W-04' && g.department === 'WATER_SUPPLY').length,
          'Ward 4 Health Admissions': 5,
          'Active Interventions': kpis.activeInterventionsCount,
        },
        citedRecordIds: ['ALERT-W04-WATER-SURGE', 'INC-2026-089', 'GRV-2026-1042', 'GRV-2026-1038'],
        limitations: 'Calculations rely on reported cases in the citizen grievance portal and emergency clinic notifications. Mild or unreported household cases are not captured.',
      },
      suggestedActionType: 'CREATE_INTERVENTION',
      actionTargetId: 'ALERT-W04-WATER-SURGE',
    };
  }

  // 2. "Why are water-supply complaints increasing?"
  if (query.includes('water-supply') || query.includes('why are water') || query.includes('water complaints') || query.includes('contamination')) {
    const waterGrievances = grievances.filter(g => g.department === 'WATER_SUPPLY');
    const w4Count = waterGrievances.filter(g => g.wardId === 'W-04').length;

    return {
      question: rawQuery,
      directAnswer: `Water-supply complaints spiked by +367% due to an uncoordinated fiber optic excavation near the BSES Substation in Shastri Nagar (Ward 4) that ruptured a 150mm DI water main adjacent to an open drain.`,
      whyItMatters: 'During depressurized cycles, the vacuum in the punctured pipe drew raw sewage directly into the colony drinking water reservoir, causing immediate contamination and waterborne illness.',
      keyInsights: [
        `Ward 4 alone accounts for ${w4Count} out of ${waterGrievances.length} water complaints (${Math.round((w4Count / Math.max(1, waterGrievances.length)) * 100)}% of the district total).`,
        'Average resolution turnaround has deteriorated from the baseline 12.0 hours to 32.5 hours (+20.5h delay) due to difficulty locating the subterranean puncture.',
        'Complaints describe brown muddy water, petroleum/effluent odor, and loss of pressure.'
      ],
      recommendedSteps: [
        'Halt all private telecom trenching along DB Gupta Road and Shastri Nagar main road.',
        'Complete pressurized flushing and chlorination of the 150mm pipeline before recharging the network.',
        'Conduct 2-hourly coliform and residual chlorine testing at 6 community sampling points.'
      ],
      responsibleDepartment: 'District Water Supply & Sewerage Board (DWSSB)',
      evidence: {
        source: 'Subterranean Utility Incident Log & Geospatial Grievance Correlation',
        computedMetrics: {
          'Ward 4 Water Complaints': w4Count,
          'Baseline Comparison': '1.5 tickets / 48 hrs normal baseline',
          'Resolution Deterioration': '+20.5 hours above standard',
          'SLA Adherence': '22% (Severe breach)',
        },
        citedRecordIds: ['ALERT-W04-WATER-SURGE', 'INC-2026-089', 'GRV-2026-1041', 'GRV-2026-1034'],
        limitations: 'Physical rupture confirmed by test pit excavation; full pipeline integrity scan will take 24 hours post-weld repair.',
      },
      suggestedActionType: 'VIEW_INCIDENT',
      actionTargetId: 'INC-2026-089',
    };
  }

  // 3. "Which department has the largest unresolved backlog?"
  if (query.includes('backlog') || query.includes('largest') || query.includes('unresolved')) {
    const sortedDepts = [...deptMetrics].sort((a, b) => b.unresolvedCount - a.unresolvedCount);
    const worst = sortedDepts[0];

    return {
      question: rawQuery,
      directAnswer: `${worst.name} (${worst.code}) currently holds the largest unresolved backlog with ${worst.unresolvedCount} open complaints and ${worst.slaBreachCount} SLA breaches.`,
      whyItMatters: 'Backlog stagnation in sanitation and water boards directly compromises environmental hygiene and citizen trust, with multiple tickets now exceeding 72 hours without assignment.',
      keyInsights: [
        `${worst.name} has a resolution rate of only ${worst.resolutionRatePercent}% against a district target SLA of ${worst.slaTargetHours} hours.`,
        `The second highest backlog belongs to ${sortedDepts[1]?.name || 'N/A'} with ${sortedDepts[1]?.unresolvedCount || 0} pending tickets.`,
        `Total district-wide unresolved grievances currently stand at ${kpis.unresolvedGrievances}.`
      ],
      recommendedSteps: [
        `Direct ${DEPARTMENTS[worst.departmentId]?.headOfficer || worst.name} to convene a workload re-allocation meeting.`,
        'Divert standby mobile units from North Zone to clear eastern and central bottlenecks.',
        'Track daily backlog burndown in the Resource Planning module.'
      ],
      responsibleDepartment: worst.name,
      evidence: {
        source: 'Department SLA Compliance & Workload Register',
        computedMetrics: {
          'Unresolved Backlog': worst.unresolvedCount,
          'SLA Target': `${worst.slaTargetHours} hours`,
          'SLA Breaches': worst.slaBreachCount,
          'Resolution Rate': `${worst.resolutionRatePercent}%`,
        },
        citedRecordIds: grievances.filter(g => g.department === worst.departmentId && g.status !== 'RESOLVED').map(g => g.id).slice(0, 5),
        limitations: 'Backlog figures include citizen complaints logged in PENDING, ACKNOWLEDGED, or IN_PROGRESS statuses.',
      },
    };
  }

  // 4. "Which wards have the most concerning service trends?"
  if (query.includes('wards') || query.includes('concerning service trends') || query.includes('worst ward')) {
    return {
      question: rawQuery,
      directAnswer: `Ward 4 (Shastri Nagar) and Ward 7 (Kalyanpur Mandi) exhibit the most critical service degradation in the district.`,
      whyItMatters: 'Ward 4 faces a simultaneous drinking water and public health crisis, while Ward 7 faces an accumulating commercial refuse biohazard.',
      keyInsights: [
        'Ward 4 (Shastri Nagar - Severe Risk): 8 water complaints + 1 health alert; Risk Score 92/100.',
        'Ward 7 (Kalyanpur Mandi - Elevated Risk): 5 solid waste complaints; 96-hour refuse backlog; Risk Score 74/100.',
        'Ward 11 (Vasant Vihar Sec-4 - Moderate Risk): 2 chronic medicine shortage complaints; Risk Score 56/100.',
        'Remaining 9 wards (e.g. Civil Lines, Connaught Place) are operating within normal baseline limits.'
      ],
      recommendedSteps: [
        'Focus administrative review meetings specifically on Wards 4 and 7.',
        'Establish a Temporary Emergency Ops Desk at Shastri Nagar Community Hall.',
        'Schedule rapid mobile tipper runs to Kalyanpur Wholesale Mandi.'
      ],
      responsibleDepartment: 'District Magistrate Office / Zonal Commissioners',
      evidence: {
        source: 'Geographic Risk Scoring & Ward Polygon Analysis',
        computedMetrics: {
          'Ward 4 Risk Score': '92 / 100 (Severe)',
          'Ward 7 Risk Score': '74 / 100 (Elevated)',
          'Affected Population': '259,500 residents across both wards',
        },
        citedRecordIds: ['ALERT-W04-WATER-SURGE', 'ALERT-W07-SAN-BACKLOG'],
        limitations: 'Scores normalized by ward population and severity weights.',
      },
    };
  }

  // 5. "What changed compared with the previous reporting period?"
  if (query.includes('changed') || query.includes('previous') || query.includes('trend')) {
    return {
      question: rawQuery,
      directAnswer: `Grievance volume surged by +${kpis.comparison.grievancesSurgePercent}% over the preceding 7-day baseline, and average resolution turnaround deteriorated by +${kpis.comparison.resolutionTimeDeteriorationHours} hours.`,
      whyItMatters: 'The district moved from a steady-state routine maintenance posture into an acute crisis posture due to infrastructure damage in Ward 4 and fleet failure in Ward 7.',
      keyInsights: [
        `Active critical/high alerts rose to ${kpis.criticalAlertsCount}.`,
        'Sanitation SLA compliance declined from 82% to 58% due to grounded compactor vehicles.',
        'Water Supply resolution turnaround jumped from 12 hours baseline to 32.5 hours.'
      ],
      recommendedSteps: [
        'Shift departmental resources from scheduled preventative maintenance to active incident resolution.',
        'Activate emergency contingency funds for outsourced tippers and water bowsers.',
        'Maintain daily briefing cadence with the District Magistrate.'
      ],
      responsibleDepartment: 'Inter-Departmental Steering Committee',
      evidence: {
        source: 'Historical 7-Day Moving Baseline vs Current Active Operations',
        computedMetrics: {
          'Complaint Volume Delta': `+${kpis.comparison.grievancesSurgePercent}%`,
          'Resolution Time Delta': `+${kpis.comparison.resolutionTimeDeteriorationHours} hrs`,
          'Active Interventions': kpis.activeInterventionsCount,
        },
        citedRecordIds: ['ALERT-W04-WATER-SURGE', 'ALERT-W07-SAN-BACKLOG', 'INC-2026-089'],
        limitations: 'Baseline derived from validated records in the demonstration database.',
      },
    };
  }

  // 6. "What should the administration investigate first?"
  if (query.includes('investigate first') || query.includes('investigate')) {
    return {
      question: rawQuery,
      directAnswer: `The administration must immediately investigate the unauthorized utility excavation at Shastri Nagar Substation (Ward 4) and verify the physical condition of the 150mm DI water main.`,
      whyItMatters: 'Identifying the exact penetration point and shutting the cross-connection stops further sewage influx into the domestic water supply and arrests new hospital admissions.',
      keyInsights: [
        'Excavation auger by a private fiber contractor is suspected to have bored into the water line at 28.6695° N, 77.1725° E.',
        'Second investigation: Inspect Zonal Sanitation Depot 4 in Kalyanpur to determine why compactor truck repairs were stalled for 4 days.',
        'Third investigation: Audit pharmacy inventory logs at Vasant Vihar UPHC to locate delayed insulin shipments.'
      ],
      recommendedSteps: [
        'Issue a stop-work notice and summon the telecom trenching contractor to the DM Office by 12:00 PM.',
        'Order laboratory water quality testing (E. coli, turbidity, residual chlorine) at 10 Shastri Nagar tap points.',
        'Dispatch an executive magistrate to inspect the Kalyanpur Mandi transit depot.'
      ],
      responsibleDepartment: 'Public Works Department + Water Supply & Sewerage Board',
      evidence: {
        source: 'Incident Investigation Log INC-2026-089 & Field Inspection Notes',
        computedMetrics: {
          'Incident ID': 'INC-2026-089',
          'GPS Coordinates': '28.6695° N, 77.1725° E',
          'Suspected Rupture Diameter': '150mm DI Main',
        },
        citedRecordIds: ['INC-2026-089', 'GRV-2026-1034', 'GRV-2026-1039'],
        limitations: 'Physical contractor culpability requires formal verification by PWD Executive Engineer.',
      },
      suggestedActionType: 'VIEW_INCIDENT',
      actionTargetId: 'INC-2026-089',
    };
  }

  // 7. "What corrective action could address this problem?"
  if (query.includes('corrective action') || query.includes('action') || query.includes('remedy') || query.includes('fix')) {
    return {
      question: rawQuery,
      directAnswer: `A three-tier corrective action plan is recommended: (1) Isolate Feeder Valve #14 and deploy 8 emergency water bowsers, (2) Create an official Intervention in the tracker, and (3) Divert 4 municipal tippers to clear Kalyanpur Mandi.`,
      whyItMatters: 'Separating immediate containment (potable water delivery) from systemic repair (pipeline sleeve welding) ensures citizen relief while permanent engineering fixes take place.',
      keyInsights: [
        'Containment: 8 water bowsers can supply 96,000 liters/day to Shastri Nagar Blocks C & D within 2 hours.',
        'Medical: Oral rehydration salts (ORS) and mobile health camps prevent dehydration in affected children.',
        'Intervention Tracking: Assigning the action to DWSSB with a target completion date of 2026-10-29 creates accountability.'
      ],
      recommendedSteps: [
        'Click "Create Intervention" on Alert ALERT-W04-WATER-SURGE to log the official action.',
        'Assign the intervention to DJB Rapid Emergency Squad with Critical priority.',
        'Add a progress note with the bowser dispatch schedule.'
      ],
      responsibleDepartment: 'DWSSB + District Health Directorate + Municipal Sanitation',
      evidence: {
        source: 'DistrictOps Standard Operating Procedures & Intervention Tracker',
        computedMetrics: {
          'Required Water Bowsers': 8,
          'Estimated Repair Time': '14 hours',
          'Target Resolution Date': '2026-10-29',
        },
        citedRecordIds: ['ALERT-W04-WATER-SURGE', 'INT-2026-001'],
        limitations: 'Tanker turnaround times depend on traffic conditions between Haiderpur WTP and Shastri Nagar.',
      },
      suggestedActionType: 'CREATE_INTERVENTION',
      actionTargetId: 'ALERT-W04-WATER-SURGE',
    };
  }

  // Fallback for free-form queries
  const matchingGrievances = grievances.filter(g => 
    g.title.toLowerCase().includes(query) ||
    g.description.toLowerCase().includes(query) ||
    g.wardName.toLowerCase().includes(query)
  );
  const matchingIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(query) ||
    i.description.toLowerCase().includes(query)
  );

  return {
    question: rawQuery,
    directAnswer: `Found ${matchingIncidents.length} incident(s) and ${matchingGrievances.length} grievance(s) matching "${rawQuery}". Currently tracking ${kpis.activeIncidents} active incidents and ${kpis.unresolvedGrievances} open grievances across the district.`,
    whyItMatters: 'Maintaining visibility over specific wards and complaint categories helps administrators identify emerging hotspots before they escalate.',
    keyInsights: [
      `Matching records span ${new Set(matchingGrievances.map(g => g.wardName)).size} ward(s).`,
      `Status: ${matchingGrievances.filter(g => g.status !== 'RESOLVED').length} unresolved, ${matchingGrievances.filter(g => g.status === 'RESOLVED').length} resolved.`,
      `Top suggested queries: "Why are water-supply complaints increasing?" or "Which issues require attention first?"`
    ],
    recommendedSteps: [
      'Click any of the 7 pre-configured strategic questions above for detailed evidence analysis.',
      'Check the Early Warning Engine tab to review calculated risk scores.',
      'Open the Intervention Tracker to inspect active administrative tasks.'
    ],
    responsibleDepartment: 'District Operations Cockpit',
    evidence: {
      source: 'DistrictOps In-Memory Knowledge Store',
      computedMetrics: {
        'Matching Records': matchingGrievances.length + matchingIncidents.length,
        'Active Incidents': kpis.activeIncidents,
        'Critical Alerts': kpis.criticalAlertsCount,
      },
      citedRecordIds: [...matchingIncidents.map(i => i.id), ...matchingGrievances.slice(0, 3).map(g => g.id)],
      limitations: 'Analysis reflects current state in the active synthetic database.',
    },
  };
}
