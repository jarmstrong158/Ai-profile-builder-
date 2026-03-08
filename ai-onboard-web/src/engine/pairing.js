/**
 * Smart pairing engine.
 * Suggests optimal mentor/mentee pairings based on complementary spectrum scores,
 * health bands, and barrier relevance.
 */

import { SPECTRUM_NAMES } from './team-composition.js';
import { SPECTRUM_LABELS } from '../data/weights.js';
import { HEALTH_BAND } from './dashboard-health.js';

/**
 * Maps S4 barrier values to the most relevant spectrum IDs.
 * Used to prioritize pairings that directly address a member's reported barrier.
 */
const BARRIER_SPECTRUM_RELEVANCE = {
  1: [3, 7],    // "Not sure what to ask" → Autonomy, Initiative
  2: [1, 2],    // "Doesn't understand context" → Info Density, Explanation Depth
  3: [4, 13],   // "Output quality" → Analytical Rigor, Detail Orientation
  4: [9, 8],    // "No time" → Tech Comfort, Interaction Pacing
  5: [6, 11],   // "Don't trust" → Guardrails, Confidence
};

/**
 * Generate smart pairing suggestions for a team.
 * Identifies members who need support and finds the best mentor match
 * based on complementary spectrum scores.
 *
 * @param {Array<Object>} members - Enriched members from loadDashboardData()
 * @returns {Array<Object>} Pairing suggestions sorted by impact
 */
export function generatePairingSuggestions(members) {
  const completedMembers = members.filter(m => m.hasCompletedAssessment && m.normalizedScores);
  if (completedMembers.length < 2) return [];

  const suggestions = [];

  // Identify members who need support (at-risk or needs-attention)
  const needsSupport = completedMembers.filter(
    m => m.healthBand === HEALTH_BAND.AT_RISK || m.healthBand === HEALTH_BAND.NEEDS_ATTENTION
  );

  // Identify potential mentors (thriving or on-track)
  const potentialMentors = completedMembers.filter(
    m => m.healthBand === HEALTH_BAND.THRIVING || m.healthBand === HEALTH_BAND.ON_TRACK
  );

  if (potentialMentors.length === 0) return [];

  for (const target of needsSupport) {
    const targetScores = target.normalizedScores;
    const barrier = target.supplementaryAnswers?.['S4'];
    const barrierSpectrums = BARRIER_SPECTRUM_RELEVANCE[barrier] || [];

    // Find the best spectrum to focus on for this member
    const spectrumGaps = findSpectrumGaps(targetScores, barrierSpectrums);

    for (const gap of spectrumGaps.slice(0, 2)) { // Top 2 gaps per target
      // Find best mentor for this spectrum
      const bestMentor = findBestMentor(gap.spectrum, targetScores, potentialMentors);
      if (!bestMentor) continue;

      // Don't suggest duplicate pairings
      const isDuplicate = suggestions.some(
        s => s.targetMember.userId === target.userId &&
             s.partnerMember.userId === bestMentor.member.userId
      );
      if (isDuplicate) continue;

      const messages = generatePairingMessages(target, bestMentor.member, gap.spectrum);

      suggestions.push({
        targetMember: target,
        partnerMember: bestMentor.member,
        focusSpectrum: gap.spectrum,
        focusSpectrumName: SPECTRUM_NAMES[gap.spectrum],
        gapSize: bestMentor.gap,
        targetScore: targetScores[gap.spectrum],
        partnerScore: bestMentor.member.normalizedScores[gap.spectrum],
        isBarrierRelevant: gap.isBarrierRelevant,
        messageToTarget: messages.toTarget,
        messageToPartner: messages.toPartner,
        title: `${target.displayName} + ${bestMentor.member.displayName}: ${SPECTRUM_NAMES[gap.spectrum]}`
      });
    }
  }

  // Sort by impact: barrier-relevant first, then by gap size
  return suggestions.sort((a, b) => {
    if (a.isBarrierRelevant !== b.isBarrierRelevant) {
      return a.isBarrierRelevant ? -1 : 1;
    }
    return b.gapSize - a.gapSize;
  }).slice(0, 5); // Top 5 suggestions
}

/**
 * Find spectrum gaps for a member — areas where they score low.
 * Barrier-relevant spectrums are prioritized.
 */
function findSpectrumGaps(scores, barrierSpectrums) {
  const gaps = [];

  for (let s = 1; s <= 14; s++) {
    const score = scores[s];
    if (score == null) continue;

    // Consider a gap if score is below 40 (either direction from center matters less
    // for pairing — what matters is finding complementary scores)
    const distanceFromIdeal = Math.abs(score - 50);
    const isExtreme = score <= 30 || score >= 70;

    if (isExtreme) {
      gaps.push({
        spectrum: s,
        score,
        isBarrierRelevant: barrierSpectrums.includes(s),
        extremity: distanceFromIdeal
      });
    }
  }

  // Sort: barrier-relevant first, then by extremity
  return gaps.sort((a, b) => {
    if (a.isBarrierRelevant !== b.isBarrierRelevant) {
      return a.isBarrierRelevant ? -1 : 1;
    }
    return b.extremity - a.extremity;
  });
}

/**
 * Find the best mentor for a given spectrum.
 * Best mentor has the most complementary score (opposite side of spectrum).
 */
function findBestMentor(spectrum, targetScores, mentors) {
  const targetScore = targetScores[spectrum];
  if (targetScore == null) return null;

  let bestMentor = null;
  let bestGap = 0;

  for (const mentor of mentors) {
    const mentorScore = mentor.normalizedScores?.[spectrum];
    if (mentorScore == null) continue;

    // We want complementary scores — if target is low, mentor should be high
    const gap = Math.abs(mentorScore - targetScore);
    if (gap < 25) continue; // Minimum meaningful gap

    // Weight by mentor's health band (prefer healthier mentors)
    const healthWeight = mentor.healthBand === HEALTH_BAND.THRIVING ? 1.2 : 1.0;
    const weightedGap = gap * healthWeight;

    if (weightedGap > bestGap) {
      bestGap = weightedGap;
      bestMentor = { member: mentor, gap };
    }
  }

  return bestMentor;
}

/**
 * Generate personalized pairing messages for both sides.
 */
export function generatePairingMessages(target, partner, spectrum) {
  const spectrumName = SPECTRUM_NAMES[spectrum];
  const labels = SPECTRUM_LABELS[spectrum];
  const targetScore = target.normalizedScores?.[spectrum] ?? 50;
  const partnerScore = partner.normalizedScores?.[spectrum] ?? 50;

  // Determine which side each person leans toward
  const targetSide = targetScore <= 50 ? labels[0] : labels[1];
  const partnerSide = partnerScore <= 50 ? labels[0] : labels[1];

  const toTarget = `Work with ${partner.displayName} this week and learn from their approach to ${spectrumName.toLowerCase()}. They tend toward "${partnerSide}" while you lean "${targetSide}" — observe how they handle tasks differently and lean on them when you need guidance in this area.`;

  const toPartner = `Work with ${target.displayName} this week and share your ${spectrumName.toLowerCase()} skills. They lean "${targetSide}" while your strength is "${partnerSide}" — show them how you approach things and let them lean on you as much as needed. Your experience here can really help.`;

  return { toTarget, toPartner };
}
