/**
 * DistrictOps Early Warning Risk Engine
 * 
 * Heuristic administrative risk score formulation:
 * Risk Score = min(100, max(0, round(
 *   VolumeSurgeWeight * 0.35 +
 *   ResolutionDeteriorationWeight * 0.25 +
 *   BacklogConcentrationWeight * 0.25 +
 *   CrossSectorImpactWeight * 0.15
 * )))
 * 
 * NOTE: This is an administrative triage prioritization index (0-100),
 * NOT an empirical statistical probability of structural failure.
 */

import {
  OperationalAlert,
  Grievance,
  Intervention,
  SeverityLevel
} from '../types';

export interface DynamicRiskFactors {
  complaintCount: number;
  baselineCount: number;
  surgePercentage: number;
  resolutionTimeAvgDays: number;
  baselineResolutionDays: number;
  resolutionDeteriorationDays: number;
  unresolvedBacklogCount: number;
  activeSquads: number;
  baselineSquads: number;
}

export interface RiskCalculationBreakdown {
  volumeSurgeComponent: number;      // weight: 0.35
  resolutionDelayComponent: number;  // weight: 0.25
  backlogPressureComponent: number;  // weight: 0.25
  hazardImpactComponent: number;     // weight: 0.15
  computedRiskScore: number;         // 0 - 100
  riskCategory: SeverityLevel;
  formulaDescription: string;
}

/**
 * Computes deterministic heuristic risk score for a ward/department cluster.
 */
export function calculateRiskScore(factors: DynamicRiskFactors, baseHazardLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'High'): RiskCalculationBreakdown {
  const {
    complaintCount = 0,
    baselineCount = 1,
    resolutionTimeAvgDays = 2.0,
    baselineResolutionDays = 2.0,
    unresolvedBacklogCount = 0,
    activeSquads = 5,
    baselineSquads = 8
  } = factors;

  // 1. Volume Surge Factor (0 - 100)
  // Scaled: 0% surge = 20, 38% surge = 75, >=100% surge = 100
  const safeBaseline = Math.max(1, baselineCount);
  const rawSurgePct = ((complaintCount - safeBaseline) / safeBaseline) * 100;
  const surgeScore = Math.min(100, Math.max(0, Math.round(20 + Math.max(0, rawSurgePct) * 1.5)));

  // 2. Turnaround Deterioration Factor (0 - 100)
  // e.g. baseline 2.0d -> current 3.2d is +1.2d delay (+60% deterioration)
  const delayDays = Math.max(0, resolutionTimeAvgDays - baselineResolutionDays);
  const delayScore = Math.min(100, Math.max(0, Math.round(25 + delayDays * 45)));

  // 3. Backlog & Staffing Deficit Pressure (0 - 100)
  const squadDeficit = Math.max(0, baselineSquads - activeSquads);
  const backlogRatio = unresolvedBacklogCount / Math.max(1, activeSquads * 10);
  const backlogScore = Math.min(100, Math.max(0, Math.round(30 + squadDeficit * 15 + backlogRatio * 40)));

  // 4. Base Hazard Severity Factor (0 - 100)
  const hazardScores: Record<SeverityLevel, number> = {
    Critical: 95,
    High: 75,
    Medium: 55,
    Low: 30
  };
  const hazardScore = hazardScores[baseHazardLevel] || 60;

  // Weighted sum
  const weightedSum = (
    surgeScore * 0.35 +
    delayScore * 0.25 +
    backlogScore * 0.25 +
    hazardScore * 0.15
  );

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

  const riskCategory: SeverityLevel =
    finalScore >= 85 ? 'Critical' :
    finalScore >= 70 ? 'High' :
    finalScore >= 50 ? 'Medium' : 'Low';

  return {
    volumeSurgeComponent: Math.round(surgeScore * 0.35),
    resolutionDelayComponent: Math.round(delayScore * 0.25),
    backlogPressureComponent: Math.round(backlogScore * 0.25),
    hazardImpactComponent: Math.round(hazardScore * 0.15),
    computedRiskScore: finalScore,
    riskCategory,
    formulaDescription: `Volume Surge (${surgeScore} × 35%) + Turnaround Delay (${delayScore} × 25%) + Backlog/Staffing Pressure (${backlogScore} × 25%) + Public Hazard (${hazardScore} × 15%) = ${finalScore}/100`
  };
}

/**
 * Re-evaluates risk alerts dynamically based on live grievance backlogs and intervention deployments.
 */
export function recomputeAlertsFromData(
  alerts: OperationalAlert[],
  grievances: Grievance[],
  interventions: Intervention[]
): OperationalAlert[] {
  return alerts.map((alert) => {
    // Find matching grievances in this alert's ward and department
    const relatedGrievances = grievances.filter(g =>
      (g.relatedAlertId === alert.id) ||
      (alert.wardId && g.wardId === alert.wardId && g.department === alert.department)
    );

    const activeCount = relatedGrievances.filter(g => g.status !== 'RESOLVED').length;
    const resolvedCount = relatedGrievances.filter(g => g.status === 'RESOLVED').length;

    // Check if an active intervention covers this alert
    const coveringIntervention = interventions.find(i =>
      i.linkedAlertId === alert.id || (i.wardId === alert.wardId && i.department === alert.department)
    );

    const isInterventionCompleted = coveringIntervention?.status === 'Completed';
    const isInterventionInProgress = coveringIntervention?.status === 'In Progress';

    // Baseline inputs from alert metrics
    const complaintMetric = alert.metrics.find(m => m.label.toLowerCase().includes('complaint'));
    const resolutionMetric = alert.metrics.find(m => m.label.toLowerCase().includes('resolution'));
    const squadMetric = alert.metrics.find(m => m.label.toLowerCase().includes('team') || m.label.toLowerCase().includes('squad'));

    const baselineComplaints = Number(complaintMetric?.previousValue) || 100;
    const currentComplaints = Number(complaintMetric?.currentValue) || 138;
    const baselineResDays = Number(resolutionMetric?.previousValue) || 2.0;
    const currentResDays = Number(resolutionMetric?.currentValue) || 3.2;
    const activeSquads = Number(squadMetric?.currentValue) || 5;
    const baselineSquads = Number(squadMetric?.previousValue) || 8;

    // If grievances were resolved in session or intervention completed, dynamically reduce risk
    const dynamicComplaintCount = Math.max(baselineComplaints * 0.5, currentComplaints - resolvedCount * 5);
    const dynamicResDays = isInterventionCompleted
      ? baselineResDays
      : isInterventionInProgress
      ? (baselineResDays + currentResDays) / 2
      : currentResDays;

    const dynamicSquads = isInterventionInProgress || isInterventionCompleted
      ? baselineSquads
      : activeSquads;

    const breakdown = calculateRiskScore({
      complaintCount: dynamicComplaintCount,
      baselineCount: baselineComplaints,
      surgePercentage: Math.round(((dynamicComplaintCount - baselineComplaints) / baselineComplaints) * 100),
      resolutionTimeAvgDays: dynamicResDays,
      baselineResolutionDays: baselineResDays,
      resolutionDeteriorationDays: Math.max(0, dynamicResDays - baselineResDays),
      unresolvedBacklogCount: activeCount,
      activeSquads: dynamicSquads,
      baselineSquads: baselineSquads
    }, alert.severity);

    return {
      ...alert,
      riskScore: breakdown.computedRiskScore,
      status: isInterventionCompleted && activeCount === 0 ? 'Resolved' : alert.status,
      associatedInterventionId: coveringIntervention?.id || alert.associatedInterventionId
    };
  });
}
