import { describe, it, expect } from 'vitest';
import {
  generateIndividualRecommendations,
  generateTeamRecommendations,
  RECOMMENDATION_CATEGORY
} from '../recommendations.js';
import { HEALTH_BAND } from '../dashboard-health.js';

describe('generateIndividualRecommendations', () => {
  it('recommends prompt training for barrier=1', () => {
    const recs = generateIndividualRecommendations({
      supplementaryAnswers: { S4: 1 }
    });
    expect(recs.some(r => r.category === RECOMMENDATION_CATEGORY.TRAINING)).toBe(true);
  });

  it('recommends check-in for at-risk health', () => {
    const recs = generateIndividualRecommendations({
      healthBand: HEALTH_BAND.AT_RISK,
      supplementaryAnswers: {}
    });
    expect(recs.some(r => r.title === 'Direct check-in needed')).toBe(true);
  });

  it('recommends peer connection for solo learners', () => {
    const recs = generateIndividualRecommendations({
      supplementaryAnswers: { S7: 4 }
    });
    expect(recs.some(r => r.category === RECOMMENDATION_CATEGORY.CULTURE)).toBe(true);
  });

  it('recommends confidence support for declining confidence', () => {
    const recs = generateIndividualRecommendations({
      supplementaryAnswers: { S5: 3 }
    });
    expect(recs.some(r => r.title === 'Confidence recovery support')).toBe(true);
  });

  it('sorts by priority descending (highest first)', () => {
    const recs = generateIndividualRecommendations({
      healthBand: HEALTH_BAND.AT_RISK,
      supplementaryAnswers: { S4: 1, S7: 4 }
    });
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].priority).toBeLessThanOrEqual(recs[i - 1].priority);
    }
  });
});

describe('generateTeamRecommendations', () => {
  it('recommends boosting adoption when rate is low', () => {
    const teamHealth = { completionRate: 100, distribution: { thriving: 2, onTrack: 2, needsAttention: 0, atRisk: 0 } };
    const adoption = { frequency: { adoptionRate: 30 }, barriers: { topBarrier: null }, knowledgeSharing: { sharingRate: 50 }, useCases: { avgBreadth: 3 } };
    const recs = generateTeamRecommendations(teamHealth, adoption, [], {});
    expect(recs.some(r => r.title === 'Boost team adoption')).toBe(true);
  });

  it('recommends addressing top barrier when widespread', () => {
    const teamHealth = { completionRate: 100, distribution: { thriving: 2, onTrack: 2, needsAttention: 0, atRisk: 0 } };
    const adoption = {
      frequency: { adoptionRate: 80 },
      barriers: { topBarrier: { text: 'Not sure what to ask', percentage: 40 } },
      knowledgeSharing: { sharingRate: 50 },
      useCases: { avgBreadth: 3 }
    };
    const recs = generateTeamRecommendations(teamHealth, adoption, [], {});
    expect(recs.some(r => r.title.includes('Not sure what to ask'))).toBe(true);
  });

  it('recommends peer learning when sharing is low', () => {
    const teamHealth = { completionRate: 100, distribution: { thriving: 4, onTrack: 0, needsAttention: 0, atRisk: 0 } };
    const adoption = {
      frequency: { adoptionRate: 80 },
      barriers: { topBarrier: null },
      knowledgeSharing: { sharingRate: 20 },
      useCases: { avgBreadth: 3 }
    };
    const recs = generateTeamRecommendations(teamHealth, adoption, [], {});
    expect(recs.some(r => r.title === 'Establish peer learning channels')).toBe(true);
  });

  it('recommends improving completion when low', () => {
    const teamHealth = { completionRate: 50, distribution: { thriving: 1, onTrack: 1, needsAttention: 0, atRisk: 0 } };
    const recs = generateTeamRecommendations(teamHealth, {}, [], {});
    expect(recs.some(r => r.title === 'Improve assessment completion')).toBe(true);
  });
});
