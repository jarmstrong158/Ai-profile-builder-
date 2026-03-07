/**
 * Team composition analytics.
 * Analyzes archetype distribution, spectrum diversity, and team gaps.
 */

import { archetypes } from '../data/archetypes.js';

/**
 * Spectrum names for readable output.
 */
export const SPECTRUM_NAMES = {
  1: 'Information Density',
  2: 'Explanation Depth',
  3: 'Autonomy',
  4: 'Analytical Rigor',
  5: 'Emotional Tone',
  6: 'Guardrails',
  7: 'Initiative',
  8: 'Interaction Pacing',
  9: 'Tech Comfort',
  10: 'Motivation',
  11: 'Confidence',
  12: 'Structure',
  13: 'Detail Orientation',
  14: 'Engagement Style'
};

/**
 * Analyze archetype distribution across a team.
 * @param {Array<Object>} members - Each: { archetypeResult: { primary, secondary } }
 * @returns {Object} Distribution counts and percentages
 */
export function analyzeArchetypeDistribution(members) {
  const counts = {};
  const secondaryCounts = {};

  for (const id of Object.keys(archetypes)) {
    counts[id] = 0;
    secondaryCounts[id] = 0;
  }

  for (const member of members) {
    if (!member.archetypeResult) continue;
    const { primary, secondary } = member.archetypeResult;
    if (primary) counts[primary]++;
    if (secondary) secondaryCounts[secondary]++;
  }

  const total = members.filter(m => m.archetypeResult).length;
  const distribution = {};

  for (const [id, count] of Object.entries(counts)) {
    distribution[id] = {
      name: archetypes[id].name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      secondaryCount: secondaryCounts[id]
    };
  }

  // Sort by count descending
  const sorted = Object.entries(distribution)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([id, data]) => ({ id, ...data }));

  // Identify dominant archetype (>40% of team)
  const dominant = sorted[0] && sorted[0].percentage > 40 ? sorted[0] : null;

  // Missing archetypes (0 primary assignments)
  const missing = sorted.filter(a => a.count === 0).map(a => a.id);

  return { distribution: sorted, dominant, missing, total };
}

/**
 * Compute team spectrum averages and spread.
 * @param {Array<Object>} members - Each: { normalizedScores: {1-14 keyed} }
 * @returns {Object} Per-spectrum: { avg, min, max, spread, stdDev }
 */
export function analyzeSpectrumDiversity(members) {
  const assessed = members.filter(m => m.normalizedScores);
  if (assessed.length === 0) return {};

  const analysis = {};

  for (let i = 1; i <= 14; i++) {
    const values = assessed.map(m => m.normalizedScores[i] || 50);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

    analysis[i] = {
      name: SPECTRUM_NAMES[i],
      avg: Math.round(avg * 10) / 10,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      spread: Math.round((max - min) * 10) / 10,
      stdDev: Math.round(Math.sqrt(variance) * 10) / 10
    };
  }

  return analysis;
}

/**
 * Identify spectrums where the team is highly polarized (large spread)
 * or highly clustered (small spread). Useful for manager insights.
 * @returns {{ polarized: Array, clustered: Array }}
 */
export function identifyTeamPatterns(spectrumAnalysis) {
  const polarized = [];
  const clustered = [];

  for (let i = 1; i <= 14; i++) {
    const spec = spectrumAnalysis[i];
    if (!spec) continue;

    if (spec.spread >= 50) {
      polarized.push({ spectrum: i, name: spec.name, spread: spec.spread });
    } else if (spec.spread <= 15 && spec.stdDev <= 8) {
      clustered.push({ spectrum: i, name: spec.name, avg: spec.avg, spread: spec.spread });
    }
  }

  return {
    polarized: polarized.sort((a, b) => b.spread - a.spread),
    clustered: clustered.sort((a, b) => a.spread - b.spread)
  };
}
