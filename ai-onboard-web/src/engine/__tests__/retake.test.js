import { describe, it, expect } from 'vitest';
import {
  VOLATILITY_STATUS,
  calculateAverageShift,
  detectSpectrumSpikes,
  determineVolatilityStatus,
  getNextRetakeDate,
  calculateSpectrumShifts
} from '../retake.js';

describe('calculateAverageShift', () => {
  it('returns 0 for identical scores', () => {
    const scores = {};
    for (let i = 1; i <= 14; i++) scores[i] = 50;
    expect(calculateAverageShift(scores, scores)).toBe(0);
  });

  it('calculates correct average shift', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) {
      prev[i] = 50;
      next[i] = 60; // +10 on each
    }
    expect(calculateAverageShift(prev, next)).toBe(10);
  });

  it('handles missing keys as 0', () => {
    expect(calculateAverageShift({}, { 1: 50 })).toBeCloseTo(50 / 14);
  });
});

describe('detectSpectrumSpikes', () => {
  const spectrumNames = {};
  for (let i = 1; i <= 14; i++) spectrumNames[i] = `Spectrum ${i}`;

  it('returns empty array when no spikes', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) { prev[i] = 50; next[i] = 55; }
    expect(detectSpectrumSpikes(prev, next, spectrumNames)).toEqual([]);
  });

  it('detects spikes > 30 points', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) { prev[i] = 50; next[i] = 50; }
    next[3] = 85; // +35 spike
    const spikes = detectSpectrumSpikes(prev, next, spectrumNames);
    expect(spikes).toHaveLength(1);
    expect(spikes[0].spectrum).toBe(3);
    expect(spikes[0].shift).toBe(35);
    expect(spikes[0].direction).toBe('increased');
  });

  it('detects negative spikes', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) { prev[i] = 50; next[i] = 50; }
    next[7] = 10; // -40 spike
    const spikes = detectSpectrumSpikes(prev, next, spectrumNames);
    expect(spikes[0].direction).toBe('decreased');
    expect(spikes[0].shift).toBe(40);
  });

  it('sorts by shift descending', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) { prev[i] = 50; next[i] = 50; }
    next[1] = 85; // +35
    next[5] = 0;  // -50
    const spikes = detectSpectrumSpikes(prev, next, spectrumNames);
    expect(spikes[0].shift).toBe(50);
    expect(spikes[1].shift).toBe(35);
  });
});

describe('determineVolatilityStatus', () => {
  const makeScores = (val) => {
    const s = {};
    for (let i = 1; i <= 14; i++) s[i] = val;
    return s;
  };

  it('returns NEW for first assessment', () => {
    expect(determineVolatilityStatus([], makeScores(50))).toBe(VOLATILITY_STATUS.NEW);
  });

  it('returns VOLATILE when shift exceeds threshold', () => {
    const history = [{ normalizedScores: makeScores(50), volatilityStatus: 'new' }];
    expect(determineVolatilityStatus(history, makeScores(70))).toBe(VOLATILITY_STATUS.VOLATILE);
  });

  it('transitions NEW → STABILIZING on stable shift', () => {
    const history = [{ normalizedScores: makeScores(50), volatilityStatus: 'new' }];
    expect(determineVolatilityStatus(history, makeScores(53))).toBe(VOLATILITY_STATUS.STABILIZING);
  });

  it('transitions VOLATILE → STABILIZING on stable shift', () => {
    const history = [{ normalizedScores: makeScores(50), volatilityStatus: 'volatile' }];
    expect(determineVolatilityStatus(history, makeScores(53))).toBe(VOLATILITY_STATUS.STABILIZING);
  });

  it('transitions STABILIZING → STABLE after two consecutive stable shifts', () => {
    const history = [
      { normalizedScores: makeScores(53), volatilityStatus: 'stabilizing' },
      { normalizedScores: makeScores(50), volatilityStatus: 'new' }
    ];
    expect(determineVolatilityStatus(history, makeScores(55))).toBe(VOLATILITY_STATUS.STABLE);
  });

  it('stays STABILIZING with only one prior assessment', () => {
    const history = [{ normalizedScores: makeScores(53), volatilityStatus: 'stabilizing' }];
    expect(determineVolatilityStatus(history, makeScores(55))).toBe(VOLATILITY_STATUS.STABILIZING);
  });

  it('stays STABLE when already stable and shift is stable', () => {
    const history = [{ normalizedScores: makeScores(50), volatilityStatus: 'stable' }];
    expect(determineVolatilityStatus(history, makeScores(53))).toBe(VOLATILITY_STATUS.STABLE);
  });
});

describe('getNextRetakeDate', () => {
  it('returns 14 days for volatile', () => {
    const date = getNextRetakeDate('volatile', '2025-01-01');
    expect(date.toISOString().slice(0, 10)).toBe('2025-01-15');
  });

  it('returns 90 days for stable', () => {
    const date = getNextRetakeDate('stable', '2025-01-01');
    expect(date.toISOString().slice(0, 10)).toBe('2025-04-01');
  });

  it('defaults to 14 days for unknown status', () => {
    const date = getNextRetakeDate('unknown', '2025-01-01');
    expect(date.toISOString().slice(0, 10)).toBe('2025-01-15');
  });
});

describe('calculateSpectrumShifts', () => {
  it('computes shifts with zone changes', () => {
    const prev = {};
    const next = {};
    for (let i = 1; i <= 14; i++) { prev[i] = 30; next[i] = 70; }

    const mockAssignZones = (scores) => {
      const z = {};
      for (let i = 1; i <= 14; i++) z[i] = scores[i] <= 50 ? 'lean-left' : 'lean-right';
      return z;
    };

    const shifts = calculateSpectrumShifts(prev, next, mockAssignZones);
    expect(shifts[1].shift).toBe(40);
    expect(shifts[1].direction).toBe('right');
    expect(shifts[1].zoneChanged).toBe(true);
  });

  it('marks no change when scores are identical', () => {
    const scores = {};
    for (let i = 1; i <= 14; i++) scores[i] = 50;
    const mockZones = () => {
      const z = {};
      for (let i = 1; i <= 14; i++) z[i] = 'neutral';
      return z;
    };
    const shifts = calculateSpectrumShifts(scores, scores, mockZones);
    expect(shifts[1].direction).toBe('none');
    expect(shifts[1].zoneChanged).toBe(false);
  });
});
