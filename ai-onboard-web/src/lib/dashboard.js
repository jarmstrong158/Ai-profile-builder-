/**
 * Dashboard orchestrator.
 * Fetches team data from Supabase, transforms it into the shapes
 * expected by engine functions, and runs all computations client-side.
 */

import { getTeamMembers } from './teams.js';
import { getTeamAssessments } from './assessments.js';
import { getTeamActions } from './actions.js';
import { computeTeamHealth, computeIndividualHealth } from '../engine/dashboard-health.js';
import { computeAdoptionSummary } from '../engine/adoption-metrics.js';
import { generateIndividualFlags, generateTeamFlags } from '../engine/attention-flags.js';
import { generateTeamRecommendations, generateIndividualRecommendations } from '../engine/recommendations.js';
import { analyzeArchetypeDistribution, analyzeSpectrumDiversity, identifyTeamPatterns } from '../engine/team-composition.js';
import { detectSpectrumSpikes, determineVolatilityStatus, getNextRetakeDate } from '../engine/retake.js';
import { generatePairingSuggestions } from '../engine/pairing.js';

/**
 * Load and compute all dashboard data for a team.
 * @param {string} teamId
 * @returns {Object} Full dashboard state
 */
export async function loadDashboardData(teamId) {
  // Fetch raw data from Supabase
  const [members, assessments, actions] = await Promise.all([
    getTeamMembers(teamId),
    getTeamAssessments(teamId),
    getTeamActions(teamId).catch(() => [])
  ]);

  // Group assessments by user (newest first — already sorted by getTeamAssessments)
  const assessmentsByUser = {};
  for (const a of assessments) {
    if (!assessmentsByUser[a.user_id]) {
      assessmentsByUser[a.user_id] = [];
    }
    assessmentsByUser[a.user_id].push(a);
  }

  // Build enriched member objects for engine functions
  const enrichedMembers = members.map(member => {
    const userAssessments = assessmentsByUser[member.userId] || [];
    const latest = userAssessments[0] || null;
    const previous = userAssessments[1] || null;

    const now = new Date();
    const daysSinceAssessment = latest
      ? Math.floor((now - new Date(latest.created_at)) / (1000 * 60 * 60 * 24))
      : null;
    const daysSinceInvite = Math.floor((now - new Date(member.invitedAt)) / (1000 * 60 * 60 * 24));

    // Compute spectrum spikes if there's a previous assessment
    let spectrumSpikes = [];
    if (latest && previous) {
      spectrumSpikes = detectSpectrumSpikes(
        previous.normalized_scores,
        latest.normalized_scores,
        // Use SPECTRUM_NAMES from team-composition but import is heavy, inline simple names
        Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, `Spectrum ${i + 1}`]))
      );
    }

    // Count consecutive retake patterns
    const consecutiveRetakes = computeConsecutivePatterns(userAssessments);

    // Compute health
    const health = latest?.supplementary_answers
      ? computeIndividualHealth(latest.supplementary_answers)
      : { score: 0, band: 'at-risk', components: {} };

    // Compute next retake date
    const volatilityStatus = latest?.volatility_status || 'new';
    const nextRetakeDate = latest
      ? getNextRetakeDate(volatilityStatus, new Date(latest.created_at))
      : null;

    return {
      // Identity
      userId: member.userId,
      displayName: member.displayName,
      role: member.role,

      // Assessment data
      hasCompletedAssessment: userAssessments.length > 0,
      assessmentCount: userAssessments.length,
      latestAssessment: latest,
      supplementaryAnswers: latest?.supplementary_answers || null,
      normalizedScores: latest?.normalized_scores || null,
      archetypeResult: latest?.archetype_result || null,
      zones: latest?.zones || null,

      // Health
      healthScore: health.score,
      healthBand: health.band,
      healthComponents: health.components,

      // Timing
      daysSinceAssessment,
      daysSinceInvite,
      lastAssessmentDate: latest ? new Date(latest.created_at) : null,
      nextRetakeDate,

      // Volatility
      volatilityStatus,
      spectrumSpikes,
      consecutiveRetakes,

      // For engine functions that expect previousSupplementaryAnswers
      previousSupplementaryAnswers: previous?.supplementary_answers || null
    };
  });

  // Run team-level computations
  const teamHealth = computeTeamHealth(enrichedMembers);
  const adoptionSummary = computeAdoptionSummary(enrichedMembers);

  // Generate flags
  const memberFlags = enrichedMembers.map(m => generateIndividualFlags(m));
  const teamFlags = generateTeamFlags(teamHealth, adoptionSummary, memberFlags);

  // Team composition
  const archetypeDistribution = analyzeArchetypeDistribution(enrichedMembers);
  const spectrumDiversity = analyzeSpectrumDiversity(enrichedMembers);
  const teamPatterns = identifyTeamPatterns(spectrumDiversity);

  // Recommendations
  const teamRecommendations = generateTeamRecommendations(teamHealth, adoptionSummary, teamFlags, teamPatterns);
  const individualRecommendations = {};
  for (const m of enrichedMembers) {
    if (m.hasCompletedAssessment) {
      individualRecommendations[m.userId] = generateIndividualRecommendations(m);
    }
  }

  // Pairing suggestions
  const pairingSuggestions = generatePairingSuggestions(enrichedMembers);

  return {
    members: enrichedMembers,
    memberFlags,
    teamHealth,
    adoptionSummary,
    teamFlags,
    archetypeDistribution,
    spectrumDiversity,
    teamPatterns,
    teamRecommendations,
    individualRecommendations,
    pairingSuggestions,
    actions
  };
}

/**
 * Count consecutive retake patterns for flag detection.
 */
function computeConsecutivePatterns(assessments) {
  if (assessments.length < 2) return {};

  let confidenceDeclines = 0;
  let lowSuccess = 0;
  let lowAdoption = 0;

  // Walk from newest to oldest, counting consecutive occurrences
  for (const a of assessments) {
    const sa = a.supplementary_answers;
    if (!sa) break;

    if (sa['S5'] === 3) confidenceDeclines++;
    else break;
  }

  // Reset and count low success
  for (const a of assessments) {
    const sa = a.supplementary_answers;
    if (!sa) break;

    if (sa['S3'] === 3 || sa['S3'] === 4) lowSuccess++;
    else break;
  }

  // Reset and count low adoption
  for (const a of assessments) {
    const sa = a.supplementary_answers;
    if (!sa) break;

    if (sa['S1'] === 4) lowAdoption++;
    else break;
  }

  return { confidenceDeclines, lowSuccess, lowAdoption };
}
