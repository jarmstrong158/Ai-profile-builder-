import { describe, it, expect } from 'vitest';
import {
  computeIndividualHealth,
  getHealthBand,
  computeTeamHealth,
  HEALTH_BAND
} from '../dashboard-health.js';

describe('getHealthBand', () => {
  it('returns thriving for >= 70', () => expect(getHealthBand(70)).toBe(HEALTH_BAND.THRIVING));
  it('returns on-track for >= 55', () => expect(getHealthBand(55)).toBe(HEALTH_BAND.ON_TRACK));
  it('returns needs-attention for >= 40', () => expect(getHealthBand(40)).toBe(HEALTH_BAND.NEEDS_ATTENTION));
  it('returns at-risk for < 40', () => expect(getHealthBand(10)).toBe(HEALTH_BAND.AT_RISK));
});

describe('computeIndividualHealth', () => {
  it('returns high health for strong answers', () => {
    const answers = {
      S1: 1, // daily usage
      S2: [1, 2, 3, 4], // broad use cases
      S3: 1, // always useful
      S5: 1, // more confident
      S6: 1  // saves time
    };
    const health = computeIndividualHealth(answers);
    expect(health.score).toBeGreaterThanOrEqual(75);
    expect(health.band).toBe(HEALTH_BAND.THRIVING);
  });

  it('returns low health for weak answers', () => {
    const answers = {
      S1: 4, // rarely
      S2: [9], // didn't use
      S3: 4, // rarely useful
      S5: 3, // less confident
      S6: 4  // cost time
    };
    const health = computeIndividualHealth(answers);
    expect(health.score).toBeLessThan(25);
    expect(health.band).toBe(HEALTH_BAND.AT_RISK);
  });

  it('handles empty answers', () => {
    const health = computeIndividualHealth({});
    expect(health.score).toBe(0);
    expect(health.band).toBe(HEALTH_BAND.AT_RISK);
  });

  it('skips S5=4 (first time) from confidence calculation', () => {
    const base = { S1: 2, S3: 2, S6: 2 };
    const withFirstTime = computeIndividualHealth({ ...base, S5: 4 });
    const withConfident = computeIndividualHealth({ ...base, S5: 1 });
    // First-time should not drag down the score
    expect(withFirstTime.score).toBeGreaterThan(0);
    // More confident should be higher
    expect(withConfident.score).toBeGreaterThanOrEqual(withFirstTime.score);
  });
});

describe('computeTeamHealth', () => {
  it('returns zero state for empty team', () => {
    const result = computeTeamHealth([]);
    expect(result.avgScore).toBe(0);
    expect(result.completionRate).toBe(0);
  });

  it('computes team averages correctly', () => {
    const members = [
      { supplementaryAnswers: { S1: 1, S3: 1, S6: 1 } },
      { supplementaryAnswers: { S1: 4, S3: 4, S6: 4 } }
    ];
    const result = computeTeamHealth(members);
    expect(result.avgScore).toBeGreaterThan(0);
    expect(result.completionRate).toBe(100);
    expect(result.memberHealths).toHaveLength(2);
  });

  it('counts members without answers as at-risk', () => {
    const members = [
      { supplementaryAnswers: { S1: 1 } },
      { supplementaryAnswers: null }
    ];
    const result = computeTeamHealth(members);
    expect(result.distribution.atRisk).toBeGreaterThanOrEqual(1);
    expect(result.completionRate).toBe(50);
  });
});
