import { archetypes } from '../data/archetypes.js';
import { deviationTemplates } from '../data/templates.js';
import { SPECTRUM_NAMES } from '../data/weights.js';

/**
 * Detect deviations between user scores and primary archetype ideal.
 * Default threshold: >25 points deviation.
 * Exception: Motivation (spectrum 10) uses >=17 threshold.
 * Filters out spectrums covered by secondary archetype bridging.
 * Returns max 3 deviations, sorted by deviation size descending.
 */
export function detectDeviations(normalizedScores, primaryId, secondaryId = null) {
  const primaryIdeal = archetypes[primaryId].ideal;
  const DEFAULT_THRESHOLD = 25;
  const MOTIVATION_THRESHOLD = 17;

  // Determine which spectrums are "covered" by the secondary archetype bridging sentence
  const coveredSpectrums = new Set();
  if (secondaryId) {
    const secondaryIdeal = archetypes[secondaryId].ideal;
    // Find the 2-3 spectrums with the largest difference between secondary and primary ideal
    const diffs = [];
    for (let i = 1; i <= 14; i++) {
      diffs.push({ spectrum: i, diff: Math.abs(secondaryIdeal[i] - primaryIdeal[i]) });
    }
    diffs.sort((a, b) => b.diff - a.diff);
    // Top 3 differences are considered "covered" by the bridging sentence
    for (let j = 0; j < 3 && j < diffs.length; j++) {
      coveredSpectrums.add(diffs[j].spectrum);
    }
  }

  // Find deviations
  const deviations = [];
  for (let i = 1; i <= 14; i++) {
    if (coveredSpectrums.has(i)) continue;

    const deviation = Math.abs(normalizedScores[i] - primaryIdeal[i]);
    const threshold = i === 10 ? MOTIVATION_THRESHOLD : DEFAULT_THRESHOLD;

    if (deviation >= threshold) {
      const direction = normalizedScores[i] > primaryIdeal[i] ? "higher" : "lower";
      deviations.push({
        spectrum: i,
        spectrumName: SPECTRUM_NAMES[i],
        deviation,
        direction,
        sentence: deviationTemplates[i][direction]
      });
    }
  }

  // Sort by deviation size descending, cap at 2 (keep About Me tight)
  deviations.sort((a, b) => b.deviation - a.deviation);
  return deviations.slice(0, 2);
}
