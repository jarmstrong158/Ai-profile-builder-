/**
 * Recommendations engine.
 * Generates actionable recommendations for managers based on team data.
 *
 * Priority formula (from spec):
 * priority_score = (affected_percentage * 0.4) + (severity_weight * 0.35) + (actionability_weight * 0.25)
 *
 * Severity weights:
 * - Barrier-based interventions: 90
 * - Declining metrics: 80
 * - Friction point rules (>40%): 60
 * - Spectrum configuration: 50
 * - Knowledge sharing: 40
 * - Optimization (already functioning well): 20
 *
 * Actionability weights:
 * - Specific system prompt text provided: 100
 * - Specific action with clear steps: 75
 * - General guidance requiring interpretation: 40
 */

import { HEALTH_BAND } from './dashboard-health.js';
import { FLAG_SEVERITY } from './attention-flags.js';

/**
 * Recommendation categories.
 */
export const RECOMMENDATION_CATEGORY = {
  TRAINING: 'training',
  SUPPORT: 'support',
  TOOLS: 'tools',
  CULTURE: 'culture',
  PROCESS: 'process'
};

/**
 * Compute priority score per spec formula.
 * @param {number} affectedPercentage - 0-100
 * @param {number} severityWeight - see spec table
 * @param {number} actionabilityWeight - see spec table
 * @returns {number} 0-100
 */
function computePriority(affectedPercentage, severityWeight, actionabilityWeight) {
  return Math.round(
    (affectedPercentage * 0.4) + (severityWeight * 0.35) + (actionabilityWeight * 0.25)
  );
}

/**
 * Generate individual recommendations based on member data.
 * @param {Object} member - { supplementaryAnswers, healthBand, healthScore, archetypeResult }
 * @returns {Array<Object>} Recommendations sorted by priority
 */
export function generateIndividualRecommendations(member) {
  const recs = [];

  // Based on primary barrier (S4)
  const barrier = member.supplementaryAnswers?.['S4'];
  if (barrier != null) {
    const barrierRecs = {
      1: { // Not sure what to ask
        category: RECOMMENDATION_CATEGORY.TRAINING,
        priority: computePriority(100, 90, 75),
        title: 'Prompt crafting workshop',
        description: 'This person struggles with knowing what to ask AI. Consider prompt engineering training or sharing example prompts for their role.'
      },
      2: { // Doesn't understand work context
        category: RECOMMENDATION_CATEGORY.TOOLS,
        priority: computePriority(100, 90, 75),
        title: 'Custom context setup',
        description: 'AI doesn\'t understand their work context. Help set up role-specific templates or pre-loaded context for their common tasks.'
      },
      3: { // Output quality not good enough
        category: RECOMMENDATION_CATEGORY.TRAINING,
        priority: computePriority(100, 90, 75),
        title: 'Output refinement techniques',
        description: 'They find AI output quality lacking. Train on iterative prompting, output formatting, and quality control workflows.'
      },
      4: { // No time to learn
        category: RECOMMENDATION_CATEGORY.PROCESS,
        priority: computePriority(100, 90, 75),
        title: 'Dedicated learning time',
        description: 'Time is the barrier. Consider allocating dedicated time for AI skill building — even 30 minutes per week can accelerate adoption.'
      },
      5: { // Don't trust output
        category: RECOMMENDATION_CATEGORY.TRAINING,
        priority: computePriority(100, 90, 75),
        title: 'Verification workflow training',
        description: 'Trust is the barrier. Help build verification habits — teach them to fact-check AI output and understand where AI is reliable vs. unreliable.'
      },
      7: { // Not using yet
        category: RECOMMENDATION_CATEGORY.SUPPORT,
        priority: computePriority(100, 90, 75),
        title: 'Onboarding support',
        description: 'This person hasn\'t started using AI tools yet. Pair them with an active user or provide guided first-use support.'
      }
    };

    if (barrierRecs[barrier]) {
      recs.push(barrierRecs[barrier]);
    }
  }

  // Based on health band
  if (member.healthBand === HEALTH_BAND.AT_RISK) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.SUPPORT,
      priority: computePriority(100, 80, 40),
      title: 'Direct check-in needed',
      description: 'This person\'s health indicators suggest they may be disengaged or struggling. A direct conversation about their AI experience could help.'
    });
  }

  // Based on knowledge sharing (S7)
  const sharing = member.supplementaryAnswers?.['S7'];
  if (sharing === 4) { // Learning solo
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: computePriority(100, 40, 75),
      title: 'Connect with peers',
      description: 'This person is learning AI tools alone. Connecting them with an active team member could accelerate their progress.'
    });
  }

  // Based on confidence trajectory (S5)
  if (member.supplementaryAnswers?.['S5'] === 3) { // Less confident
    recs.push({
      category: RECOMMENDATION_CATEGORY.SUPPORT,
      priority: computePriority(100, 80, 75),
      title: 'Confidence recovery support',
      description: 'Confidence is declining. Identify what\'s causing frustration and provide targeted help on those specific tasks.'
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate team-level recommendations from aggregated data.
 * @param {Object} teamHealth - From computeTeamHealth()
 * @param {Object} adoptionSummary - From computeAdoptionSummary()
 * @param {Array<Object>} teamFlags - From generateTeamFlags()
 * @param {Object} teamPatterns - From identifyTeamPatterns()
 * @returns {Array<Object>} Prioritized team recommendations (top 3 highlighted)
 */
export function generateTeamRecommendations(teamHealth, adoptionSummary, teamFlags, teamPatterns) {
  const recs = [];

  // Based on adoption rate
  const adoptionRate = adoptionSummary?.frequency?.adoptionRate ?? 100;
  if (adoptionRate < 50) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: computePriority(100 - adoptionRate, 80, 75),
      title: 'Boost team adoption',
      description: 'Less than half the team is regularly using AI. Consider team-wide use case workshops showing practical applications for your team\'s specific work.'
    });
  }

  // Based on top barrier
  const topBarrier = adoptionSummary?.barriers?.topBarrier;
  if (topBarrier && topBarrier.percentage >= 20) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: computePriority(topBarrier.percentage, 90, 75),
      title: `Address team barrier: ${topBarrier.text}`,
      description: `${topBarrier.percentage}% of your team identified this as their biggest obstacle. Addressing this systematically could unlock progress for multiple people.`
    });
  }

  // Based on knowledge sharing patterns
  const sharingRate = adoptionSummary?.knowledgeSharing?.sharingRate ?? 100;
  if (sharingRate < 30) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: computePriority(100 - sharingRate, 40, 75),
      title: 'Establish peer learning channels',
      description: 'Knowledge sharing is low. Consider AI tip-of-the-week channels, pair sessions, or short team demos of AI wins.'
    });
  }

  // Based on use case breadth
  if (adoptionSummary?.useCases?.avgBreadth < 2) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.TRAINING,
      priority: computePriority(50, 50, 75),
      title: 'Expand use case awareness',
      description: 'Team is using AI for very few task types. Cross-training on different use cases could increase value.'
    });
  }

  // Based on team health distribution
  if (teamHealth.distribution) {
    const total = Math.max(1, teamHealth.distribution.thriving + teamHealth.distribution.onTrack +
                               teamHealth.distribution.needsAttention + teamHealth.distribution.atRisk);
    const needsAttentionPct = Math.round(
      ((teamHealth.distribution.needsAttention + teamHealth.distribution.atRisk) / total) * 100
    );
    if (needsAttentionPct >= 25) {
      recs.push({
        category: RECOMMENDATION_CATEGORY.SUPPORT,
        priority: computePriority(needsAttentionPct, 80, 40),
        title: 'Team-wide support needed',
        description: `${needsAttentionPct}% of your team needs attention. Consider a team reset — revisit goals, provide fresh training, and address systemic blockers.`
      });
    }

    // Individual at-risk members warrant attention even below team threshold
    const atRisk = teamHealth.distribution.atRisk;
    if (atRisk > 0 && needsAttentionPct < 25) {
      const atRiskPct = Math.round((atRisk / total) * 100);
      recs.push({
        category: RECOMMENDATION_CATEGORY.SUPPORT,
        priority: computePriority(atRiskPct, 80, 75),
        title: `Support ${atRisk} at-risk team member${atRisk > 1 ? 's' : ''}`,
        description: `${atRisk} team member${atRisk > 1 ? 's are' : ' is'} in the at-risk health band. Individual check-ins can prevent further disengagement.`
      });
    }
  }

  // Based on team spectrum patterns
  if (teamPatterns?.polarized?.length >= 3) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: computePriority(30, 50, 40),
      title: 'Address team AI style diversity',
      description: 'Your team has very different AI interaction styles across multiple dimensions. Consider establishing flexible team AI guidelines that accommodate different approaches.'
    });
  }

  // Based on completion rate
  if (teamHealth.completionRate < 70) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: computePriority(100 - teamHealth.completionRate, 80, 75),
      title: 'Improve assessment completion',
      description: `Only ${teamHealth.completionRate}% of your team has completed assessments. Consider setting aside team time or making it part of onboarding.`
    });
  }

  // Sort by priority descending, mark top 3 as highlighted
  const sorted = recs
    .filter(r => r.priority > 30) // Only show recommendations above minimum threshold
    .sort((a, b) => b.priority - a.priority);

  sorted.forEach((rec, idx) => {
    rec.highlighted = idx < 3;
  });

  return sorted;
}
