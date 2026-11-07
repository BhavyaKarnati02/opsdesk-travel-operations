import { SupportAgent, UnifiedCase, SmartRoutingScore } from '../types';

/**
 * Transparent Rule-Based Smart Routing Engine for TBO OpsDesk
 * 
 * Scoring Weights (Total 100 points):
 * 1. Category / Expertise Match: 35 points
 *    - Direct match with agent's declared expertise: +35 pts
 *    - Otherwise 0 pts
 * 2. Region Match: 30 points
 *    - Agent covers the agency's region: +30 pts
 *    - Otherwise 0 pts
 * 3. Workload & Capacity: 25 points
 *    - (maxCapacity - activeCases) / maxCapacity * 25 pts
 *    - If agent is already at maxCapacity, capacity score is 0
 * 4. Real-time Availability: 10 points
 *    - 'Available': 10 pts
 *    - 'In Call': 5 pts
 *    - 'On Break': 2 pts
 *    - 'Offline': 0 pts
 * 
 * Urgency Multiplier / Tie-breaker:
 *    - If case is Critical or SLA is At Risk, priority boost is applied to agents with high SLA compliance (>95%)
 */
export function calculateSmartRoutingScores(
  caseItem: UnifiedCase,
  agents: SupportAgent[]
): SmartRoutingScore[] {
  const scoredAgents: SmartRoutingScore[] = agents.map((agent) => {
    const reasons: string[] = [];

    // 1. Expertise Match (35 pts)
    const hasExpertise = agent.expertise.includes(caseItem.category);
    let expertiseScore = 0;
    if (hasExpertise) {
      expertiseScore = 35;
      reasons.push(`Specializes in '${caseItem.category}' (+35 pts)`);
    } else {
      reasons.push(`Does not list '${caseItem.category}' in primary expertise (0 pts)`);
    }

    // 2. Region Match (30 pts)
    const coversRegion = agent.regions.includes(caseItem.agencyRegion);
    let regionScore = 0;
    if (coversRegion) {
      regionScore = 30;
      reasons.push(`Covers target territory '${caseItem.agencyRegion}' (+30 pts)`);
    } else {
      reasons.push(`Territory does not cover '${caseItem.agencyRegion}' (0 pts)`);
    }

    // 3. Capacity & Workload (25 pts)
    const availableSlots = Math.max(0, agent.maxCapacity - agent.activeCases);
    const capacityRatio = agent.maxCapacity > 0 ? availableSlots / agent.maxCapacity : 0;
    const capacityScore = Math.round(capacityRatio * 25);
    reasons.push(
      `Workload: ${agent.activeCases}/${agent.maxCapacity} active cases (${availableSlots} open slots, +${capacityScore} pts)`
    );

    // 4. Availability (10 pts)
    let availabilityScore = 0;
    if (agent.availability === 'Available') {
      availabilityScore = 10;
      reasons.push('Current shift status: Available (+10 pts)');
    } else if (agent.availability === 'In Call') {
      availabilityScore = 5;
      reasons.push('Current shift status: In Active Call (+5 pts)');
    } else if (agent.availability === 'On Break') {
      availabilityScore = 2;
      reasons.push('Current shift status: On Short Break (+2 pts)');
    } else {
      availabilityScore = 0;
      reasons.push('Current shift status: Offline (0 pts)');
    }

    let totalScore = expertiseScore + regionScore + capacityScore + availabilityScore;

    // Bonus for Critical / At Risk cases if agent has stellar SLA compliance
    if ((caseItem.priority === 'Critical' || caseItem.slaRiskLevel === 'At Risk') && agent.slaComplianceRate >= 95) {
      totalScore += 5;
      reasons.push(`High-stakes SLA bonus: ${agent.slaComplianceRate}% historical compliance (+5 pts)`);
    }

    return {
      agent,
      totalScore,
      breakdown: {
        regionMatch: regionScore,
        expertiseMatch: expertiseScore,
        capacityScore,
        availabilityScore,
      },
      reasons,
      isRecommended: false,
    };
  });

  // Sort descending by score
  scoredAgents.sort((a, b) => b.totalScore - a.totalScore);

  if (scoredAgents.length > 0) {
    scoredAgents[0].isRecommended = true;
  }

  return scoredAgents;
}

export function generateAssignmentExplanation(
  recommended: SmartRoutingScore,
  caseItem: UnifiedCase
): string {
  const agent = recommended.agent;
  const parts: string[] = [];

  if (recommended.breakdown.expertiseMatch > 0) {
    parts.push(`specializes in ${caseItem.category}`);
  }
  if (recommended.breakdown.regionMatch > 0) {
    parts.push(`supports the ${caseItem.agencyRegion} territory`);
  }
  const slots = agent.maxCapacity - agent.activeCases;
  parts.push(`currently has capacity (${slots} open slots) with status '${agent.availability}'`);

  return `Assigned to ${agent.name} because the agent ${parts.join(', ')} (Smart Score: ${recommended.totalScore}/100).`;
}
