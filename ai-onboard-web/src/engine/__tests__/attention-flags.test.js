import { describe, it, expect } from 'vitest';
import { generateIndividualFlags, generateTeamFlags, FLAG_SEVERITY } from '../attention-flags.js';
import { HEALTH_BAND } from '../dashboard-health.js';

describe('generateIndividualFlags', () => {
  it('flags at-risk health', () => {
    const flags = generateIndividualFlags({ healthBand: HEALTH_BAND.AT_RISK });
    expect(flags.some(f => f.type === 'health_at_risk')).toBe(true);
  });

  it('flags volatile profile', () => {
    const flags = generateIndividualFlags({ volatilityStatus: 'volatile' });
    expect(flags.some(f => f.type === 'volatile_profile')).toBe(true);
  });

  it('flags spectrum spikes', () => {
    const flags = generateIndividualFlags({
      spectrumSpikes: [{ spectrumName: 'Autonomy', shift: 35, direction: 'increased', spectrum: 3 }]
    });
    expect(flags.some(f => f.type === 'spectrum_spike')).toBe(true);
  });

  it('flags overdue retake', () => {
    const flags = generateIndividualFlags({ daysSinceAssessment: 45 });
    expect(flags.some(f => f.type === 'overdue_retake')).toBe(true);
  });

  it('flags declining confidence (S5=3)', () => {
    const flags = generateIndividualFlags({ supplementaryAnswers: { S5: 3 } });
    expect(flags.some(f => f.type === 'confidence_declining')).toBe(true);
  });

  it('flags low adoption (S1=4)', () => {
    const flags = generateIndividualFlags({ supplementaryAnswers: { S1: 4 } });
    expect(flags.some(f => f.type === 'low_adoption')).toBe(true);
  });

  it('flags negative time impact (S6=4)', () => {
    const flags = generateIndividualFlags({ supplementaryAnswers: { S6: 4 } });
    expect(flags.some(f => f.type === 'negative_time_impact')).toBe(true);
  });

  it('sorts high severity first', () => {
    const flags = generateIndividualFlags({
      healthBand: HEALTH_BAND.AT_RISK,
      volatilityStatus: 'volatile'
    });
    expect(flags[0].severity).toBe(FLAG_SEVERITY.HIGH);
  });

  it('returns empty for healthy member', () => {
    const flags = generateIndividualFlags({
      healthBand: HEALTH_BAND.THRIVING,
      supplementaryAnswers: { S1: 1, S5: 1, S6: 1, S3: 1 }
    });
    expect(flags).toHaveLength(0);
  });
});

describe('generateTeamFlags', () => {
  it('flags low completion rate', () => {
    const teamHealth = {
      completionRate: 30,
      distribution: { thriving: 1, onTrack: 1, needsAttention: 0, atRisk: 0 }
    };
    const flags = generateTeamFlags(teamHealth, {}, []);
    expect(flags.some(f => f.type === 'low_completion')).toBe(true);
  });

  it('flags high at-risk percentage', () => {
    const teamHealth = {
      completionRate: 100,
      distribution: { thriving: 0, onTrack: 1, needsAttention: 0, atRisk: 3 }
    };
    const flags = generateTeamFlags(teamHealth, {}, []);
    expect(flags.some(f => f.type === 'high_at_risk')).toBe(true);
  });

  it('flags low team adoption', () => {
    const teamHealth = { completionRate: 100, distribution: { thriving: 1, onTrack: 1, needsAttention: 0, atRisk: 0 } };
    const adoption = { frequency: { adoptionRate: 20 } };
    const flags = generateTeamFlags(teamHealth, adoption, []);
    expect(flags.some(f => f.type === 'low_team_adoption')).toBe(true);
  });

  it('flags multiple declining confidence members', () => {
    const teamHealth = { completionRate: 100, distribution: { thriving: 2, onTrack: 0, needsAttention: 0, atRisk: 0 } };
    const memberFlags = [
      [{ type: 'confidence_declining' }],
      [{ type: 'confidence_declining' }],
      []
    ];
    const flags = generateTeamFlags(teamHealth, {}, memberFlags);
    expect(flags.some(f => f.type === 'team_confidence_drop')).toBe(true);
  });
});
