/**
 * Dashboard health score aggregation.
 * Computes team-level and individual health metrics from assessment data.
 */

import { supplementaryQuestions } from '../data/supplementary-questions.js';
import { VOLATILITY_STATUS } from './retake.js';

/**
 * Health score bands for categorizing individuals and teams.
 */
export const HEALTH_BAND = {
  THRIVING: 'thriving',
  ON_TRACK: 'on-track',
  NEEDS_ATTENTION: 'needs-attention',
  AT_RISK: 'at-risk'
};

/**
 * Compute an individual health score (0-100) from supplementary answers.
 * Factors: adoption frequency, success rate, time impact, confidence trajectory.
 * Questions without a numericalMap use value directly (lower value = better for S1, S5).
 */
export function computeIndividualHealth(supplementaryAnswers) {
  const components = {};
  let totalWeight = 0;
  let weightedSum = 0;

  // S1: Adoption frequency — value 1 (daily) = best, 4 = worst → invert to 0-100
  const s1 = supplementaryAnswers['S1'];
  if (s1 != null) {
    const score = Math.max(0, ((4 - s1) / 3) * 100);
    components.adoption = score;
    weightedSum += score * 2;
    totalWeight += 2;
  }

  // S3: Success rate — has numericalMap, value maps to 1-4 (4 = best)
  const s3 = supplementaryAnswers['S3'];
  if (s3 != null) {
    const s3q = supplementaryQuestions.find(q => q.id === 'S3');
    const mapped = s3q.numericalMap[s3];
    if (mapped != null) {
      const score = ((mapped - 1) / 3) * 100;
      components.success = score;
      weightedSum += score * 2;
      totalWeight += 2;
    }
  }

  // S5: Confidence trajectory — 1 = more confident (best), 3 = less (worst), 4 = first time (neutral)
  const s5 = supplementaryAnswers['S5'];
  if (s5 != null && s5 !== 4) {
    const score = Math.max(0, ((3 - s5) / 2) * 100);
    components.confidence = score;
    weightedSum += score * 1.5;
    totalWeight += 1.5;
  }

  // S6: Time impact — has numericalMap, value maps to 1-4 (4 = best)
  const s6 = supplementaryAnswers['S6'];
  if (s6 != null) {
    const s6q = supplementaryQuestions.find(q => q.id === 'S6');
    const mapped = s6q.numericalMap[s6];
    if (mapped != null) {
      const score = ((mapped - 1) / 3) * 100;
      components.timeImpact = score;
      weightedSum += score * 1.5;
      totalWeight += 1.5;
    }
  }

  // S2: Use case breadth — more selections = broader adoption (max 7 productive options, exclude 8 & 9)
  const s2 = supplementaryAnswers['S2'];
  if (s2 != null && Array.isArray(s2)) {
    const productive = s2.filter(v => v <= 7).length;
    const score = Math.min(100, (productive / 4) * 100); // 4+ use cases = 100
    components.breadth = score;
    weightedSum += score * 1;
    totalWeight += 1;
  }

  if (totalWeight === 0) return { score: 0, band: HEALTH_BAND.AT_RISK, components };

  const healthScore = Math.round(weightedSum / totalWeight);

  return {
    score: healthScore,
    band: getHealthBand(healthScore),
    components
  };
}

/**
 * Map a health score to a band.
 */
export function getHealthBand(score) {
  if (score >= 75) return HEALTH_BAND.THRIVING;
  if (score >= 50) return HEALTH_BAND.ON_TRACK;
  if (score >= 25) return HEALTH_BAND.NEEDS_ATTENTION;
  return HEALTH_BAND.AT_RISK;
}

/**
 * Compute team-level health summary from an array of team member data.
 * @param {Array<Object>} members - Each: { supplementaryAnswers, volatilityStatus, lastAssessmentDate }
 * @returns {Object} Team health summary
 */
export function computeTeamHealth(members) {
  if (members.length === 0) {
    return {
      avgScore: 0,
      band: HEALTH_BAND.AT_RISK,
      distribution: { thriving: 0, onTrack: 0, needsAttention: 0, atRisk: 0 },
      completionRate: 0,
      memberHealths: []
    };
  }

  const distribution = { thriving: 0, onTrack: 0, needsAttention: 0, atRisk: 0 };
  const memberHealths = [];
  let totalScore = 0;
  let assessed = 0;

  for (const member of members) {
    if (!member.supplementaryAnswers) {
      distribution.atRisk++;
      memberHealths.push({ score: 0, band: HEALTH_BAND.AT_RISK, components: {} });
      continue;
    }

    assessed++;
    const health = computeIndividualHealth(member.supplementaryAnswers);
    memberHealths.push(health);
    totalScore += health.score;

    switch (health.band) {
      case HEALTH_BAND.THRIVING: distribution.thriving++; break;
      case HEALTH_BAND.ON_TRACK: distribution.onTrack++; break;
      case HEALTH_BAND.NEEDS_ATTENTION: distribution.needsAttention++; break;
      case HEALTH_BAND.AT_RISK: distribution.atRisk++; break;
    }
  }

  const avgScore = assessed > 0 ? Math.round(totalScore / assessed) : 0;

  return {
    avgScore,
    band: getHealthBand(avgScore),
    distribution,
    completionRate: Math.round((assessed / members.length) * 100),
    memberHealths
  };
}
