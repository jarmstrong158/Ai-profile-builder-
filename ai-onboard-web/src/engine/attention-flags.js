/**
 * Attention flags system.
 * Identifies individuals and team-level patterns that need manager attention.
 *
 * Spec-defined individual flags:
 * - "Has not completed first assessment" (invited but no quiz taken — 7+ days)
 * - "Overdue for retake" (past recommended retake date by 7+ days)
 * - "Declining confidence" (S5 = "less confident" for 2+ consecutive retakes)
 * - "Low success rate" (S3 = "rarely" or "hit or miss" for 2+ consecutive retakes)
 * - "Negative time impact" (S6 = "cost me time" on most recent retake)
 * - "Not using AI" (S1 = "once or not at all" for 2+ consecutive retakes)
 */

import { VOLATILITY_STATUS } from './retake.js';
import { HEALTH_BAND } from './dashboard-health.js';

/**
 * Flag severity levels.
 */
export const FLAG_SEVERITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Generate attention flags for an individual team member.
 * @param {Object} member - { supplementaryAnswers, volatilityStatus, healthScore, healthBand,
 *   spectrumSpikes, daysSinceAssessment, daysSinceInvite, hasCompletedAssessment,
 *   previousSupplementaryAnswers, consecutiveRetakes }
 * @returns {Array<Object>} Flags sorted by severity
 */
export function generateIndividualFlags(member) {
  const flags = [];

  // Flag: Has not completed first assessment (invited 7+ days ago, no quiz taken)
  if (member.hasCompletedAssessment === false && member.daysSinceInvite != null && member.daysSinceInvite >= 7) {
    flags.push({
      type: 'not_completed',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Has not completed first assessment'
    });
  }

  // Flag: Health score at-risk — differentiate untapped potential from truly at-risk
  if (member.healthBand === HEALTH_BAND.AT_RISK) {
    const priorExp = member.supplementaryAnswers?.['S0'];
    if (priorExp === 1 || priorExp === 2) {
      // Has personal AI experience but low work adoption → untapped potential
      flags.push({
        type: 'untapped_potential',
        severity: FLAG_SEVERITY.MEDIUM,
        message: priorExp === 1
          ? 'Uses AI regularly outside work — untapped potential for work adoption'
          : 'Has some personal AI experience — could bridge to work use with support'
      });
    } else {
      flags.push({
        type: 'health_at_risk',
        severity: FLAG_SEVERITY.HIGH,
        message: 'Health score is at-risk — may need direct support or check-in'
      });
    }
  }

  // Flag: Needs-attention + regular personal AI user → also untapped potential
  if (member.healthBand === HEALTH_BAND.NEEDS_ATTENTION && member.supplementaryAnswers?.['S0'] === 1) {
    flags.push({
      type: 'untapped_potential',
      severity: FLAG_SEVERITY.LOW,
      message: 'Uses AI regularly outside work — could perform better with work-specific support'
    });
  }

  // Flag: Volatile profile
  if (member.volatilityStatus === VOLATILITY_STATUS.VOLATILE) {
    flags.push({
      type: 'volatile_profile',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Profile is volatile — attitudes or usage patterns are shifting significantly'
    });
  }

  // Flag: Spectrum spikes (>30pt shift on single spectrum)
  if (member.spectrumSpikes && member.spectrumSpikes.length > 0) {
    for (const spike of member.spectrumSpikes) {
      flags.push({
        type: 'spectrum_spike',
        severity: FLAG_SEVERITY.MEDIUM,
        message: `${spike.spectrumName} ${spike.direction} by ${spike.shift} points`,
        spectrum: spike.spectrum
      });
    }
  }

  // Flag: Overdue retake (past recommended retake date by 7+ days)
  if (member.daysSinceAssessment != null && member.daysSinceAssessment > 30) {
    flags.push({
      type: 'overdue_retake',
      severity: member.daysSinceAssessment > 60 ? FLAG_SEVERITY.HIGH : FLAG_SEVERITY.MEDIUM,
      message: `Assessment is ${member.daysSinceAssessment} days old — retake recommended`
    });
  }

  // Flag: Declining confidence (S5 = 3 "less confident" for 2+ consecutive retakes)
  if (member.consecutiveRetakes?.confidenceDeclines >= 2) {
    flags.push({
      type: 'confidence_declining',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Reports declining confidence with AI tools for 2+ consecutive assessments'
    });
  } else if (member.supplementaryAnswers?.['S5'] === 3) {
    // Single instance — still flag but lower severity
    flags.push({
      type: 'confidence_declining',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Reports declining confidence with AI tools'
    });
  }

  // Flag: Low success rate (S3 = 3 or 4 for 2+ consecutive retakes)
  if (member.consecutiveRetakes?.lowSuccess >= 2) {
    flags.push({
      type: 'low_success_rate',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Reports low success rate with AI for 2+ consecutive assessments'
    });
  } else if (member.supplementaryAnswers?.['S3'] === 4) {
    flags.push({
      type: 'low_success_rate',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Reports rarely getting usable results from AI'
    });
  }

  // Flag: Negative time impact (S6 = 4 "cost me time" on most recent retake)
  if (member.supplementaryAnswers?.['S6'] === 4) {
    flags.push({
      type: 'negative_time_impact',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Reports AI is costing time rather than saving it'
    });
  }

  // Flag: Not using AI (S1 = 4 "once or not at all" for 2+ consecutive retakes)
  if (member.consecutiveRetakes?.lowAdoption >= 2) {
    flags.push({
      type: 'low_adoption',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Rarely or never using AI tools for 2+ consecutive assessments'
    });
  } else if (member.supplementaryAnswers?.['S1'] === 4) {
    flags.push({
      type: 'low_adoption',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Rarely or never using AI tools'
    });
  }

  return flags.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

/**
 * Generate team-level attention flags from aggregated data.
 * @param {Object} teamHealth - From computeTeamHealth()
 * @param {Object} adoptionSummary - From computeAdoptionSummary()
 * @param {Array<Object>} memberFlags - Array of per-member flag arrays
 * @returns {Array<Object>} Team-level flags sorted by severity
 */
export function generateTeamFlags(teamHealth, adoptionSummary, memberFlags) {
  const flags = [];
  const total = teamHealth.distribution ?
    (teamHealth.distribution.thriving + teamHealth.distribution.onTrack +
     teamHealth.distribution.needsAttention + teamHealth.distribution.atRisk) : 0;

  // Flag: Low completion rate
  if (teamHealth.completionRate < 50) {
    flags.push({
      type: 'low_completion',
      severity: FLAG_SEVERITY.HIGH,
      message: `Only ${teamHealth.completionRate}% of team has completed assessments`
    });
  }

  // Flag: High at-risk percentage
  if (total > 0) {
    const atRiskPct = Math.round((teamHealth.distribution.atRisk / total) * 100);
    if (atRiskPct >= 30) {
      flags.push({
        type: 'high_at_risk',
        severity: FLAG_SEVERITY.HIGH,
        message: `${atRiskPct}% of team members are at-risk`
      });
    }
  }

  // Flag: Low adoption rate
  if (adoptionSummary?.frequency?.adoptionRate < 30) {
    flags.push({
      type: 'low_team_adoption',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Team adoption rate is below 30%'
    });
  }

  // Flag: High isolation (many learning solo)
  if (adoptionSummary?.knowledgeSharing?.respondents > 0) {
    const isolatedPct = Math.round(
      (adoptionSummary.knowledgeSharing.isolatedLearners / adoptionSummary.knowledgeSharing.respondents) * 100
    );
    if (isolatedPct >= 50) {
      flags.push({
        type: 'high_isolation',
        severity: FLAG_SEVERITY.MEDIUM,
        message: `${isolatedPct}% of team is learning AI tools in isolation — consider peer support programs`
      });
    }
  }

  // Flag: Multiple members with declining confidence
  const decliningCount = memberFlags.filter(
    mf => mf.some(f => f.type === 'confidence_declining')
  ).length;
  if (decliningCount >= 2) {
    flags.push({
      type: 'team_confidence_drop',
      severity: FLAG_SEVERITY.HIGH,
      message: `${decliningCount} team members report declining AI confidence`
    });
  }

  return flags.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}
