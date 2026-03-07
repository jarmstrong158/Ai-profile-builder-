/**
 * Recommendations engine.
 * Generates actionable recommendations for managers based on team data.
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
        priority: 1,
        title: 'Prompt crafting workshop',
        description: 'This person struggles with knowing what to ask AI. Consider prompt engineering training or sharing example prompts for their role.'
      },
      2: { // Doesn't understand work context
        category: RECOMMENDATION_CATEGORY.TOOLS,
        priority: 1,
        title: 'Custom context setup',
        description: 'AI doesn\'t understand their work context. Help set up role-specific templates or pre-loaded context for their common tasks.'
      },
      3: { // Output quality not good enough
        category: RECOMMENDATION_CATEGORY.TRAINING,
        priority: 2,
        title: 'Output refinement techniques',
        description: 'They find AI output quality lacking. Train on iterative prompting, output formatting, and quality control workflows.'
      },
      4: { // No time to learn
        category: RECOMMENDATION_CATEGORY.PROCESS,
        priority: 1,
        title: 'Dedicated learning time',
        description: 'Time is the barrier. Consider allocating dedicated time for AI skill building — even 30 minutes per week can accelerate adoption.'
      },
      5: { // Don't trust output
        category: RECOMMENDATION_CATEGORY.TRAINING,
        priority: 2,
        title: 'Verification workflow training',
        description: 'Trust is the barrier. Help build verification habits — teach them to fact-check AI output and understand where AI is reliable vs. unreliable.'
      },
      7: { // Not using yet
        category: RECOMMENDATION_CATEGORY.SUPPORT,
        priority: 1,
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
      priority: 1,
      title: 'Direct check-in needed',
      description: 'This person\'s health indicators suggest they may be disengaged or struggling. A direct conversation about their AI experience could help.'
    });
  }

  // Based on knowledge sharing (S7)
  const sharing = member.supplementaryAnswers?.['S7'];
  if (sharing === 4) { // Learning solo
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: 3,
      title: 'Connect with peers',
      description: 'This person is learning AI tools alone. Connecting them with an active team member could accelerate their progress.'
    });
  }

  // Based on confidence trajectory (S5)
  if (member.supplementaryAnswers?.['S5'] === 3) { // Less confident
    recs.push({
      category: RECOMMENDATION_CATEGORY.SUPPORT,
      priority: 1,
      title: 'Confidence recovery support',
      description: 'Confidence is declining. Identify what\'s causing frustration and provide targeted help on those specific tasks.'
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate team-level recommendations from aggregated data.
 * @param {Object} teamHealth - From computeTeamHealth()
 * @param {Object} adoptionSummary - From computeAdoptionSummary()
 * @param {Array<Object>} teamFlags - From generateTeamFlags()
 * @param {Object} teamPatterns - From identifyTeamPatterns()
 * @returns {Array<Object>} Prioritized team recommendations
 */
export function generateTeamRecommendations(teamHealth, adoptionSummary, teamFlags, teamPatterns) {
  const recs = [];

  // Based on adoption rate
  if (adoptionSummary?.frequency?.adoptionRate < 50) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: 1,
      title: 'Boost team adoption',
      description: 'Less than half the team is regularly using AI. Consider team-wide use case workshops showing practical applications for your team\'s specific work.'
    });
  }

  // Based on top barrier
  const topBarrier = adoptionSummary?.barriers?.topBarrier;
  if (topBarrier && topBarrier.percentage >= 30) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: 1,
      title: `Address team barrier: ${topBarrier.text}`,
      description: `${topBarrier.percentage}% of your team identified this as their biggest obstacle. Addressing this systematically could unlock progress for multiple people.`
    });
  }

  // Based on knowledge sharing patterns
  if (adoptionSummary?.knowledgeSharing?.sharingRate < 30) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.CULTURE,
      priority: 2,
      title: 'Establish peer learning channels',
      description: 'Knowledge sharing is low. Consider AI tip-of-the-week channels, pair sessions, or short team demos of AI wins.'
    });
  }

  // Based on use case breadth
  if (adoptionSummary?.useCases?.avgBreadth < 2) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.TRAINING,
      priority: 2,
      title: 'Expand use case awareness',
      description: 'Team is using AI for very few task types. Cross-training on different use cases could increase value.'
    });
  }

  // Based on team health distribution
  if (teamHealth.distribution) {
    const needsAttentionPct = Math.round(
      ((teamHealth.distribution.needsAttention + teamHealth.distribution.atRisk) /
       Math.max(1, teamHealth.distribution.thriving + teamHealth.distribution.onTrack +
                    teamHealth.distribution.needsAttention + teamHealth.distribution.atRisk)) * 100
    );
    if (needsAttentionPct >= 40) {
      recs.push({
        category: RECOMMENDATION_CATEGORY.SUPPORT,
        priority: 1,
        title: 'Team-wide support needed',
        description: `${needsAttentionPct}% of your team needs attention. Consider a team reset — revisit goals, provide fresh training, and address systemic blockers.`
      });
    }
  }

  // Based on team spectrum patterns
  if (teamPatterns?.polarized?.length >= 3) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: 3,
      title: 'Address team AI style diversity',
      description: 'Your team has very different AI interaction styles across multiple dimensions. Consider establishing flexible team AI guidelines that accommodate different approaches.'
    });
  }

  // Based on completion rate
  if (teamHealth.completionRate < 70) {
    recs.push({
      category: RECOMMENDATION_CATEGORY.PROCESS,
      priority: 1,
      title: 'Improve assessment completion',
      description: `Only ${teamHealth.completionRate}% of your team has completed assessments. Consider setting aside team time or making it part of onboarding.`
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
