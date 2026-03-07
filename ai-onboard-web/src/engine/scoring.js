import { weights, MULTI_SELECT_QUESTIONS } from '../data/weights.js';

/**
 * Calculate raw scores by summing weights from all answered questions.
 * Multi-select questions: apply weights for ALL selected options.
 */
export function calculateRawScores(answers) {
  const raw = {};
  for (let i = 1; i <= 14; i++) raw[i] = 0;

  for (const [qId, answer] of Object.entries(answers)) {
    if (!weights[qId]) continue;
    const opts = Array.isArray(answer) ? answer : [answer];
    for (const opt of opts) {
      const w = weights[qId][opt];
      if (!w) continue;
      for (const [spec, wt] of Object.entries(w)) {
        raw[Number(spec)] += wt;
      }
    }
  }
  return raw;
}

/**
 * Calculate theoretical min/max for each spectrum.
 * Single-select: min/max of all option weights (including 0 for non-contributing options).
 * Multi-select: sum of all negative weights for min, sum of all positive for max.
 */
export function calculateTheoreticalRange(section7Answered = true) {
  const mins = {};
  const maxs = {};
  for (let i = 1; i <= 14; i++) { mins[i] = 0; maxs[i] = 0; }

  for (const [qId, qWeights] of Object.entries(weights)) {
    // Skip section 7 questions if not answered
    if (!section7Answered && qId.startsWith('7.')) continue;

    const isMulti = MULTI_SELECT_QUESTIONS.has(qId);

    for (let spec = 1; spec <= 14; spec++) {
      if (isMulti) {
        // Multi-select: all negative-weight options can be selected simultaneously
        let neg = 0, pos = 0;
        for (const opts of Object.values(qWeights)) {
          const val = opts[spec] || 0;
          if (val < 0) neg += val;
          if (val > 0) pos += val;
        }
        mins[spec] += neg;
        maxs[spec] += pos;
      } else {
        // Single-select: collect weight from every option including 0 for missing
        const vals = Object.values(qWeights).map(opts => opts[spec] || 0);
        if (vals.length === 0) continue;
        mins[spec] += Math.min(...vals);
        maxs[spec] += Math.max(...vals);
      }
    }
  }
  return { mins, maxs };
}

// Pre-calculate ranges
const rangeWith7 = calculateTheoreticalRange(true);
const rangeWithout7 = calculateTheoreticalRange(false);

/**
 * Normalize raw scores to 0-100 scale.
 */
export function normalizeScores(rawScores, section7Answered = true) {
  const { mins, maxs } = section7Answered ? rangeWith7 : rangeWithout7;
  const normalized = {};

  for (let i = 1; i <= 14; i++) {
    if (maxs[i] === mins[i]) {
      normalized[i] = 50;
    } else {
      const val = ((rawScores[i] - mins[i]) / (maxs[i] - mins[i])) * 100;
      normalized[i] = Math.max(0, Math.min(100, Math.round(val * 10) / 10));
    }
  }
  return normalized;
}

/**
 * Assign zones based on normalized scores.
 */
export function assignZones(normalizedScores) {
  const zones = {};
  for (let i = 1; i <= 14; i++) {
    const score = normalizedScores[i];
    if (score <= 20) zones[i] = "strong-left";
    else if (score <= 40) zones[i] = "lean-left";
    else if (score <= 60) zones[i] = "neutral";
    else if (score <= 80) zones[i] = "lean-right";
    else zones[i] = "strong-right";
  }
  return zones;
}
