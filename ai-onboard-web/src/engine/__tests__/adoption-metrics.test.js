import { describe, it, expect } from 'vitest';
import {
  aggregateAdoptionFrequency,
  aggregateUseCaseBreadth,
  aggregateBarriers,
  aggregateKnowledgeSharing,
  computeAdoptionSummary
} from '../adoption-metrics.js';

describe('aggregateAdoptionFrequency', () => {
  it('computes frequency distribution and adoption rate', () => {
    const members = [
      { supplementaryAnswers: { S1: 1 } }, // daily
      { supplementaryAnswers: { S1: 1 } }, // daily
      { supplementaryAnswers: { S1: 4 } }  // rarely
    ];
    const result = aggregateAdoptionFrequency(members);
    expect(result.distribution.daily).toBe(2);
    expect(result.distribution.rarely).toBe(1);
    expect(result.respondents).toBe(3);
    expect(result.adoptionRate).toBeGreaterThan(0);
  });

  it('handles empty members', () => {
    const result = aggregateAdoptionFrequency([]);
    expect(result.respondents).toBe(0);
    expect(result.adoptionRate).toBe(0);
  });

  it('skips members without S1', () => {
    const members = [{ supplementaryAnswers: { S2: [1] } }];
    const result = aggregateAdoptionFrequency(members);
    expect(result.respondents).toBe(0);
  });
});

describe('aggregateUseCaseBreadth', () => {
  it('counts use cases across team', () => {
    const members = [
      { supplementaryAnswers: { S2: [1, 2, 3] } },
      { supplementaryAnswers: { S2: [1, 5] } }
    ];
    const result = aggregateUseCaseBreadth(members);
    expect(result.respondents).toBe(2);
    expect(result.avgBreadth).toBeGreaterThan(0);
    const writing = result.useCases.find(u => u.value === 1);
    expect(writing.count).toBe(2); // Both selected option 1
  });
});

describe('aggregateBarriers', () => {
  it('identifies top barrier', () => {
    const members = [
      { supplementaryAnswers: { S4: 1 } },
      { supplementaryAnswers: { S4: 1 } },
      { supplementaryAnswers: { S4: 3 } }
    ];
    const result = aggregateBarriers(members);
    expect(result.topBarrier.value).toBe(1);
    expect(result.topBarrier.count).toBe(2);
  });

  it('returns null topBarrier when no responses', () => {
    const result = aggregateBarriers([]);
    expect(result.topBarrier).toBeNull();
  });
});

describe('aggregateKnowledgeSharing', () => {
  it('calculates sharing rate correctly', () => {
    const members = [
      { supplementaryAnswers: { S7: 2 } }, // shared
      { supplementaryAnswers: { S7: 3 } }, // both
      { supplementaryAnswers: { S7: 4 } }, // solo
      { supplementaryAnswers: { S7: 4 } }  // solo
    ];
    const result = aggregateKnowledgeSharing(members);
    expect(result.sharingRate).toBe(50); // 2 out of 4
    expect(result.isolatedLearners).toBe(2);
  });
});

describe('computeAdoptionSummary', () => {
  it('returns all four sections', () => {
    const members = [
      { supplementaryAnswers: { S1: 1, S2: [1, 2], S4: 1, S7: 2 } }
    ];
    const result = computeAdoptionSummary(members);
    expect(result).toHaveProperty('frequency');
    expect(result).toHaveProperty('useCases');
    expect(result).toHaveProperty('barriers');
    expect(result).toHaveProperty('knowledgeSharing');
  });
});
