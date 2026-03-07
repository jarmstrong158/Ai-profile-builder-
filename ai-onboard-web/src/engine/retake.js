/**
 * Retake system with volatility detection.
 * Tracks profile stability over time and recommends retake cadence.
 */

/**
 * Volatility statuses in order of progression.
 */
export const VOLATILITY_STATUS = {
  NEW: 'new',
  VOLATILE: 'volatile',
  STABILIZING: 'stabilizing',
  STABLE: 'stable'
};

/** Retake cadence in days */
const RETAKE_DAYS = {
  [VOLATILITY_STATUS.NEW]: 14,
  [VOLATILITY_STATUS.VOLATILE]: 14,
  [VOLATILITY_STATUS.STABILIZING]: 14,
  [VOLATILITY_STATUS.STABLE]: 90
};

/** Volatility threshold — average shift across 14 spectrums */
const VOLATILITY_THRESHOLD = 8;

/** Single-spectrum spike threshold for dashboard flagging */
const SPIKE_THRESHOLD = 30;

/**
 * Calculate average spectrum shift between two assessments.
 * @param {Object} prevScores - Previous normalized scores (1-14 keyed)
 * @param {Object} newScores - New normalized scores (1-14 keyed)
 * @returns {number} Average absolute shift across 14 spectrums
 */
export function calculateAverageShift(prevScores, newScores) {
  let totalShift = 0;
  for (let i = 1; i <= 14; i++) {
    totalShift += Math.abs((newScores[i] || 0) - (prevScores[i] || 0));
  }
  return totalShift / 14;
}

/**
 * Detect single-spectrum spikes (>30 point shifts).
 * These are flagged for the manager even if overall volatility is low.
 * @returns {Array<{spectrum: number, spectrumName: string, shift: number, direction: string}>}
 */
export function detectSpectrumSpikes(prevScores, newScores, spectrumNames) {
  const spikes = [];
  for (let i = 1; i <= 14; i++) {
    const shift = (newScores[i] || 0) - (prevScores[i] || 0);
    if (Math.abs(shift) > SPIKE_THRESHOLD) {
      spikes.push({
        spectrum: i,
        spectrumName: spectrumNames[i],
        shift: Math.abs(shift),
        direction: shift > 0 ? 'increased' : 'decreased'
      });
    }
  }
  return spikes.sort((a, b) => b.shift - a.shift);
}

/**
 * Determine new volatility status based on assessment history.
 * @param {Array<Object>} assessmentHistory - Array of past assessments, newest first.
 *   Each: { normalizedScores, volatilityStatus, date }
 * @param {Object} newScores - The new assessment's normalized scores
 * @returns {string} New volatility status
 */
export function determineVolatilityStatus(assessmentHistory, newScores) {
  // First assessment — always "new"
  if (assessmentHistory.length === 0) {
    return VOLATILITY_STATUS.NEW;
  }

  const prevScores = assessmentHistory[0].normalizedScores;
  const avgShift = calculateAverageShift(prevScores, newScores);
  const isStableShift = avgShift <= VOLATILITY_THRESHOLD;

  // If shift is volatile, mark as volatile
  if (!isStableShift) {
    return VOLATILITY_STATUS.VOLATILE;
  }

  // Shift is stable — check if we can progress
  const prevStatus = assessmentHistory[0].volatilityStatus;

  if (prevStatus === VOLATILITY_STATUS.NEW) {
    // First retake with stable shift → stabilizing
    return VOLATILITY_STATUS.STABILIZING;
  }

  if (prevStatus === VOLATILITY_STATUS.VOLATILE) {
    // Was volatile, now stable → stabilizing (need one more stable to confirm)
    return VOLATILITY_STATUS.STABILIZING;
  }

  if (prevStatus === VOLATILITY_STATUS.STABILIZING) {
    // Was stabilizing — check if previous shift was also stable
    // Need TWO consecutive stable retakes to reach "stable"
    if (assessmentHistory.length >= 2) {
      const prevPrevScores = assessmentHistory[1].normalizedScores;
      const prevShift = calculateAverageShift(prevPrevScores, prevScores);
      if (prevShift <= VOLATILITY_THRESHOLD) {
        return VOLATILITY_STATUS.STABLE;
      }
    }
    // Only one prior assessment or previous wasn't stable — stay stabilizing
    return VOLATILITY_STATUS.STABILIZING;
  }

  if (prevStatus === VOLATILITY_STATUS.STABLE) {
    // Already stable and this retake is stable too — stay stable
    return VOLATILITY_STATUS.STABLE;
  }

  return VOLATILITY_STATUS.VOLATILE;
}

/**
 * Calculate next recommended retake date.
 * @param {string} status - Current volatility status
 * @param {Date|string} lastAssessmentDate - Date of most recent assessment
 * @returns {Date} Recommended next retake date
 */
export function getNextRetakeDate(status, lastAssessmentDate) {
  const lastDate = new Date(lastAssessmentDate);
  const days = RETAKE_DAYS[status] || 14;
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

/**
 * Calculate per-spectrum shifts between two assessments.
 * Used for trajectory display.
 * @returns {Object} Keyed by spectrum number: { shift, direction, zone change }
 */
export function calculateSpectrumShifts(prevScores, newScores, assignZonesFn) {
  const prevZones = assignZonesFn(prevScores);
  const newZones = assignZonesFn(newScores);
  const shifts = {};

  for (let i = 1; i <= 14; i++) {
    const shift = (newScores[i] || 0) - (prevScores[i] || 0);
    shifts[i] = {
      shift: Math.round(shift * 10) / 10,
      direction: shift > 0 ? 'right' : shift < 0 ? 'left' : 'none',
      prevZone: prevZones[i],
      newZone: newZones[i],
      zoneChanged: prevZones[i] !== newZones[i]
    };
  }

  return shifts;
}
