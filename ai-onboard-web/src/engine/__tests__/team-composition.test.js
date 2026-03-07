import { describe, it, expect } from 'vitest';
import {
  analyzeArchetypeDistribution,
  analyzeSpectrumDiversity,
  identifyTeamPatterns,
  SPECTRUM_NAMES
} from '../team-composition.js';

describe('analyzeArchetypeDistribution', () => {
  it('counts primary archetypes correctly', () => {
    const members = [
      { archetypeResult: { primary: 'operator', secondary: null } },
      { archetypeResult: { primary: 'operator', secondary: 'student' } },
      { archetypeResult: { primary: 'student', secondary: null } }
    ];
    const result = analyzeArchetypeDistribution(members);
    const operator = result.distribution.find(d => d.id === 'operator');
    expect(operator.count).toBe(2);
    expect(operator.percentage).toBe(67);
  });

  it('identifies dominant archetype (>40%)', () => {
    const members = [
      { archetypeResult: { primary: 'tinkerer' } },
      { archetypeResult: { primary: 'tinkerer' } },
      { archetypeResult: { primary: 'student' } }
    ];
    const result = analyzeArchetypeDistribution(members);
    expect(result.dominant).not.toBeNull();
    expect(result.dominant.id).toBe('tinkerer');
  });

  it('lists missing archetypes', () => {
    const members = [
      { archetypeResult: { primary: 'operator' } }
    ];
    const result = analyzeArchetypeDistribution(members);
    expect(result.missing).toContain('student');
    expect(result.missing).not.toContain('operator');
  });

  it('handles members without archetypeResult', () => {
    const members = [{ archetypeResult: null }, { archetypeResult: { primary: 'operator' } }];
    const result = analyzeArchetypeDistribution(members);
    expect(result.total).toBe(1);
  });
});

describe('analyzeSpectrumDiversity', () => {
  it('computes averages, min, max, spread', () => {
    const makeScores = (val) => {
      const s = {};
      for (let i = 1; i <= 14; i++) s[i] = val;
      return s;
    };
    const members = [
      { normalizedScores: makeScores(30) },
      { normalizedScores: makeScores(70) }
    ];
    const result = analyzeSpectrumDiversity(members);
    expect(result[1].avg).toBe(50);
    expect(result[1].min).toBe(30);
    expect(result[1].max).toBe(70);
    expect(result[1].spread).toBe(40);
  });

  it('returns empty for no assessed members', () => {
    expect(analyzeSpectrumDiversity([{}])).toEqual({});
  });
});

describe('identifyTeamPatterns', () => {
  it('identifies polarized spectrums (spread >= 50)', () => {
    const analysis = {};
    for (let i = 1; i <= 14; i++) {
      analysis[i] = { name: SPECTRUM_NAMES[i], avg: 50, min: 10, max: 90, spread: 80, stdDev: 30 };
    }
    const { polarized } = identifyTeamPatterns(analysis);
    expect(polarized.length).toBe(14);
  });

  it('identifies clustered spectrums (spread <= 15, stdDev <= 8)', () => {
    const analysis = {};
    for (let i = 1; i <= 14; i++) {
      analysis[i] = { name: SPECTRUM_NAMES[i], avg: 50, min: 45, max: 55, spread: 10, stdDev: 5 };
    }
    const { clustered } = identifyTeamPatterns(analysis);
    expect(clustered.length).toBe(14);
  });
});
