import { archetypes } from '../data/archetypes.js';
import { deviationTemplates } from '../data/templates.js';
import { SPECTRUM_NAMES } from '../data/weights.js';

/**
 * Detect deviations between user scores and primary archetype ideal.
 * Default threshold: >25 points deviation.
 * Exception: Motivation (spectrum 10) uses >=17 threshold.
 * Suppressed: Spectrum 9 (energy) excluded — signal too weak to generate useful deviations.
 * Secondary coverage: top-2 spectrum differences between primary and secondary archetypes
 *   use a raised threshold (35) instead of being fully suppressed — ensures large
 *   contradictions between archetype summary and actual scores still get flagged.
 * Returns max 3 deviations, sorted by deviation size descending.
 */
export function detectDeviations(normalizedScores, primaryId, secondaryId = null) {
  const primaryIdeal = archetypes[primaryId].ideal;
  const DEFAULT_THRESHOLD = 25;
  const MOTIVATION_THRESHOLD = 17;
  const COVERED_THRESHOLD = 35;

  // Determine which spectrums are partially "covered" by the secondary archetype bridging sentence
  const coveredSpectrums = new Set();
  if (secondaryId) {
    const secondaryIdeal = archetypes[secondaryId].ideal;
    // Find the 2 spectrums with the largest difference between secondary and primary ideal
    const diffs = [];
    for (let i = 1; i <= 14; i++) {
      diffs.push({ spectrum: i, diff: Math.abs(secondaryIdeal[i] - primaryIdeal[i]) });
    }
    diffs.sort((a, b) => b.diff - a.diff);
    // Top 2 differences use a raised threshold (not fully suppressed)
    for (let j = 0; j < 2 && j < diffs.length; j++) {
      coveredSpectrums.add(diffs[j].spectrum);
    }
  }

  // Find deviations
  const SUPPRESSED_SPECTRUMS = new Set([9]); // Energy: signal too weak
  const deviations = [];
  for (let i = 1; i <= 14; i++) {
    if (SUPPRESSED_SPECTRUMS.has(i)) continue;

    const deviation = Math.abs(normalizedScores[i] - primaryIdeal[i]);

    // Select threshold: covered spectrums use raised threshold, motivation uses lower, rest use default
    let threshold;
    if (coveredSpectrums.has(i)) {
      threshold = COVERED_THRESHOLD;
    } else if (i === 10) {
      threshold = MOTIVATION_THRESHOLD;
    } else {
      threshold = DEFAULT_THRESHOLD;
    }

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

  // Sort by deviation size descending, cap at 3
  deviations.sort((a, b) => b.deviation - a.deviation);
  return deviations.slice(0, 3);
}
