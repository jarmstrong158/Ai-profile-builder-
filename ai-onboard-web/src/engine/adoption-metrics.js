/**
 * Adoption metrics aggregation.
 * Processes supplementary answers into team-level adoption insights.
 */

import { supplementaryQuestions } from '../data/supplementary-questions.js';

/**
 * Aggregate adoption frequency (S1) across team.
 * @param {Array<Object>} members - Each: { supplementaryAnswers }
 * @returns {Object} Frequency distribution and avg
 */
export function aggregateAdoptionFrequency(members) {
  const labels = { 1: 'daily', 2: 'several_weekly', 3: 'couple_times', 4: 'rarely' };
  const dist = { daily: 0, several_weekly: 0, couple_times: 0, rarely: 0 };
  let total = 0;
  let sum = 0;

  for (const m of members) {
    const val = m.supplementaryAnswers?.['S1'];
    if (val == null) continue;
    total++;
    sum += val;
    const key = labels[val];
    if (key) dist[key]++;
  }

  return {
    distribution: dist,
    avgFrequency: total > 0 ? Math.round((sum / total) * 10) / 10 : null,
    respondents: total,
    // Lower avg = more frequent usage
    adoptionRate: total > 0 ? Math.round(((4 - sum / total) / 3) * 100) : 0
  };
}

/**
 * Aggregate use case breadth (S2) across team.
 * @returns {Object} Per-use-case adoption counts and most/least common
 */
export function aggregateUseCaseBreadth(members) {
  const s2q = supplementaryQuestions.find(q => q.id === 'S2');
  const useCaseCounts = {};
  for (const opt of s2q.options) {
    useCaseCounts[opt.value] = { text: opt.text, count: 0 };
  }

  let total = 0;
  let avgBreadth = 0;

  for (const m of members) {
    const val = m.supplementaryAnswers?.['S2'];
    if (!val || !Array.isArray(val)) continue;
    total++;
    avgBreadth += val.filter(v => v <= 7).length;
    for (const v of val) {
      if (useCaseCounts[v]) useCaseCounts[v].count++;
    }
  }

  const sorted = Object.entries(useCaseCounts)
    .map(([value, data]) => ({
      value: Number(value),
      text: data.text,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  return {
    useCases: sorted,
    avgBreadth: total > 0 ? Math.round((avgBreadth / total) * 10) / 10 : 0,
    respondents: total
  };
}

/**
 * Aggregate barriers (S4) across team.
 * @returns {Object} Barrier distribution ranked by frequency
 */
export function aggregateBarriers(members) {
  const s4q = supplementaryQuestions.find(q => q.id === 'S4');
  const barrierCounts = {};
  for (const opt of s4q.options) {
    barrierCounts[opt.value] = { text: opt.text, count: 0 };
  }

  let total = 0;

  for (const m of members) {
    const val = m.supplementaryAnswers?.['S4'];
    if (val == null) continue;
    total++;
    if (barrierCounts[val]) barrierCounts[val].count++;
  }

  const sorted = Object.entries(barrierCounts)
    .map(([value, data]) => ({
      value: Number(value),
      text: data.text,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Separate "no barrier" (value 6) from real barriers
  const noBarrier = sorted.find(b => b.value === 6);
  const realBarriers = sorted.filter(b => b.value !== 6 && b.count > 0);
  const topRealBarrier = realBarriers.length > 0 ? realBarriers[0] : null;

  return {
    barriers: sorted,
    topBarrier: topRealBarrier,
    noBarrierCount: noBarrier?.count || 0,
    noBarrierPercentage: noBarrier?.percentage || 0,
    respondents: total
  };
}

/**
 * Aggregate knowledge sharing (S7) across team.
 * @returns {Object} Sharing pattern distribution
 */
export function aggregateKnowledgeSharing(members) {
  const labels = {
    1: 'learned_from_others',
    2: 'shared_with_others',
    3: 'both',
    4: 'solo',
    5: 'not_using'
  };
  const dist = {};
  for (const key of Object.values(labels)) dist[key] = 0;

  let total = 0;

  for (const m of members) {
    const val = m.supplementaryAnswers?.['S7'];
    if (val == null) continue;
    total++;
    const key = labels[val];
    if (key) dist[key]++;
  }

  const activeSharers = (dist.shared_with_others || 0) + (dist.both || 0);

  return {
    distribution: dist,
    respondents: total,
    sharingRate: total > 0 ? Math.round((activeSharers / total) * 100) : 0,
    isolatedLearners: dist.solo || 0
  };
}

/**
 * Compute comprehensive adoption summary for the team dashboard.
 */
export function computeAdoptionSummary(members) {
  return {
    frequency: aggregateAdoptionFrequency(members),
    useCases: aggregateUseCaseBreadth(members),
    barriers: aggregateBarriers(members),
    knowledgeSharing: aggregateKnowledgeSharing(members)
  };
}
