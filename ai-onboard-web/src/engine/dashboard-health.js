/**
 * Dashboard health score aggregation.
 * Computes team-level and individual health metrics from assessment data.
 *
 * Formula (from spec):
 * health_score = (adoption_score * 0.25) + (success_score * 0.30) + (confidence_score * 0.20) + (time_score * 0.25)
 *
 * Component mappings:
 * S1 (Adoption): 1=100, 2=70, 3=35, 4=0
 * S3 (Success):  1=100, 2=75, 3=50, 4=20, 5=excluded
 * S5 (Confidence): 1=positive, 2=positive, 3=negative, 4=excluded → (positive / total) * 100
 * S6 (Time):    1=100, 2=65, 3=30, 4=0, 5=excluded
 *
 * Bands: Green >= 70, Amber 40-69, Red < 40
 */

import { VOLATILITY_STATUS } from './retake.js';

/**
 * Health score bands for categorizing individuals and teams.
 */
export const HEALTH_BAND = {
  THRIVING: 'thriving',       // >= 70 (Green)
  ON_TRACK: 'on-track',       // >= 55
  NEEDS_ATTENTION: 'needs-attention', // >= 40 (Amber)
  AT_RISK: 'at-risk'          // < 40 (Red)
};

// Spec-defined value mappings
const ADOPTION_MAP = { 1: 100, 2: 70, 3: 35, 4: 0 };
const SUCCESS_MAP = { 1: 100, 2: 75, 3: 50, 4: 20, 5: null };
const CONFIDENCE_MAP = { 1: 1, 2: 1, 3: 0, 4: null }; // 1 = positive, 0 = negative, null = excluded
const TIME_MAP = { 1: 100, 2: 65, 3: 30, 4: 0, 5: null };

// Spec-defined component weights
const WEIGHTS = { adoption: 0.25, success: 0.30, confidence: 0.20, time: 0.25 };

/**
 * Compute an individual health score (0-100) from supplementary answers.
 * Uses the spec's value mappings and component weights.
 */
export function computeIndividualHealth(supplementaryAnswers) {
  const components = {};
  let weightedSum = 0;
  let totalWeight = 0;

  // S1: Adoption frequency
  const s1 = supplementaryAnswers['S1'];
  if (s1 != null && ADOPTION_MAP[s1] != null) {
    components.adoption = ADOPTION_MAP[s1];
    weightedSum += components.adoption * WEIGHTS.adoption;
    totalWeight += WEIGHTS.adoption;
  }

  // S3: Success rate
  const s3 = supplementaryAnswers['S3'];
  if (s3 != null && SUCCESS_MAP[s3] != null) {
    components.success = SUCCESS_MAP[s3];
    weightedSum += components.success * WEIGHTS.success;
    totalWeight += WEIGHTS.success;
  }

  // S5: Confidence trajectory — binary positive/negative
  const s5 = supplementaryAnswers['S5'];
  if (s5 != null && CONFIDENCE_MAP[s5] != null) {
    components.confidence = CONFIDENCE_MAP[s5] === 1 ? 100 : 0;
    weightedSum += components.confidence * WEIGHTS.confidence;
    totalWeight += WEIGHTS.confidence;
  }

  // S6: Time impact
  const s6 = supplementaryAnswers['S6'];
  if (s6 != null && TIME_MAP[s6] != null) {
    components.timeImpact = TIME_MAP[s6];
    weightedSum += components.timeImpact * WEIGHTS.time;
    totalWeight += WEIGHTS.time;
  }

  if (totalWeight === 0) return { score: 0, band: HEALTH_BAND.AT_RISK, components };

  // Redistribute weights proportionally when components are excluded
  const healthScore = Math.round(weightedSum / totalWeight);

  return {
    score: healthScore,
    band: getHealthBand(healthScore),
    components
  };
}

/**
 * Map a health score to a band.
 * Spec thresholds: Green >= 70, Amber 40-69, Red < 40
 * Extended to 4 bands for finer granularity.
 */
export function getHealthBand(score) {
  if (score >= 70) return HEALTH_BAND.THRIVING;
  if (score >= 55) return HEALTH_BAND.ON_TRACK;
  if (score >= 40) return HEALTH_BAND.NEEDS_ATTENTION;
  return HEALTH_BAND.AT_RISK;
}

/**
 * Compute team-level health using the spec formula.
 * Each component is averaged across team members, then combined with spec weights.
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

  // Collect per-component values across team
  const adoptionValues = [];
  const successValues = [];
  const confidenceCounts = { positive: 0, negative: 0 };
  const timeValues = [];

  const distribution = { thriving: 0, onTrack: 0, needsAttention: 0, atRisk: 0 };
  const memberHealths = [];
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

    const sa = member.supplementaryAnswers;

    // Collect component values for team-level formula
    if (sa['S1'] != null && ADOPTION_MAP[sa['S1']] != null) {
      adoptionValues.push(ADOPTION_MAP[sa['S1']]);
    }
    if (sa['S3'] != null && SUCCESS_MAP[sa['S3']] != null) {
      successValues.push(SUCCESS_MAP[sa['S3']]);
    }
    if (sa['S5'] != null && CONFIDENCE_MAP[sa['S5']] != null) {
      if (CONFIDENCE_MAP[sa['S5']] === 1) confidenceCounts.positive++;
      else confidenceCounts.negative++;
    }
    if (sa['S6'] != null && TIME_MAP[sa['S6']] != null) {
      timeValues.push(TIME_MAP[sa['S6']]);
    }

    switch (health.band) {
      case HEALTH_BAND.THRIVING: distribution.thriving++; break;
      case HEALTH_BAND.ON_TRACK: distribution.onTrack++; break;
      case HEALTH_BAND.NEEDS_ATTENTION: distribution.needsAttention++; break;
      case HEALTH_BAND.AT_RISK: distribution.atRisk++; break;
    }
  }

  // Compute team-level health using spec formula
  let teamWeightedSum = 0;
  let teamTotalWeight = 0;

  if (adoptionValues.length > 0) {
    const avg = adoptionValues.reduce((a, b) => a + b, 0) / adoptionValues.length;
    teamWeightedSum += avg * WEIGHTS.adoption;
    teamTotalWeight += WEIGHTS.adoption;
  }
  if (successValues.length > 0) {
    const avg = successValues.reduce((a, b) => a + b, 0) / successValues.length;
    teamWeightedSum += avg * WEIGHTS.success;
    teamTotalWeight += WEIGHTS.success;
  }
  const confTotal = confidenceCounts.positive + confidenceCounts.negative;
  if (confTotal > 0) {
    const confScore = (confidenceCounts.positive / confTotal) * 100;
    teamWeightedSum += confScore * WEIGHTS.confidence;
    teamTotalWeight += WEIGHTS.confidence;
  }
  if (timeValues.length > 0) {
    const avg = timeValues.reduce((a, b) => a + b, 0) / timeValues.length;
    teamWeightedSum += avg * WEIGHTS.time;
    teamTotalWeight += WEIGHTS.time;
  }

  const avgScore = teamTotalWeight > 0 ? Math.round(teamWeightedSum / teamTotalWeight) : 0;

  return {
    avgScore,
    band: getHealthBand(avgScore),
    distribution,
    completionRate: Math.round((assessed / members.length) * 100),
    memberHealths
  };
}
