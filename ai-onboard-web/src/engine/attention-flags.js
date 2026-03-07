/**
 * Attention flags system.
 * Identifies individuals and team-level patterns that need manager attention.
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
 *   spectrumSpikes, daysSinceAssessment, normalizedScores }
 * @returns {Array<Object>} Flags sorted by severity
 */
export function generateIndividualFlags(member) {
  const flags = [];

  // Flag: Health score at-risk
  if (member.healthBand === HEALTH_BAND.AT_RISK) {
    flags.push({
      type: 'health_at_risk',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Health score is at-risk — may need direct support or check-in'
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

  // Flag: Overdue retake
  if (member.daysSinceAssessment != null && member.daysSinceAssessment > 30) {
    flags.push({
      type: 'overdue_retake',
      severity: member.daysSinceAssessment > 60 ? FLAG_SEVERITY.HIGH : FLAG_SEVERITY.MEDIUM,
      message: `Assessment is ${member.daysSinceAssessment} days old — retake recommended`
    });
  }

  // Flag: Low confidence trajectory (S5 = 3, "less confident")
  if (member.supplementaryAnswers?.['S5'] === 3) {
    flags.push({
      type: 'confidence_declining',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Reports declining confidence with AI tools'
    });
  }

  // Flag: Not using AI (S1 = 4, "once or not at all")
  if (member.supplementaryAnswers?.['S1'] === 4) {
    flags.push({
      type: 'low_adoption',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Rarely or never using AI tools'
    });
  }

  // Flag: AI costing time (S6 = 4, "it actually cost me time")
  if (member.supplementaryAnswers?.['S6'] === 4) {
    flags.push({
      type: 'negative_time_impact',
      severity: FLAG_SEVERITY.HIGH,
      message: 'Reports AI is costing time rather than saving it'
    });
  }

  // Flag: Low success rate (S3 = 4, "rarely useful")
  if (member.supplementaryAnswers?.['S3'] === 4) {
    flags.push({
      type: 'low_success_rate',
      severity: FLAG_SEVERITY.MEDIUM,
      message: 'Reports rarely getting usable results from AI'
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
