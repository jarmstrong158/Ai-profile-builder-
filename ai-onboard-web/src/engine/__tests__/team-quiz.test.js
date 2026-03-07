import { describe, it, expect } from 'vitest';
import { validateTeamAnswers, getRetakeConfirmations, STATIC_QUESTIONS } from '../team-quiz.js';
import { supplementaryQuestions } from '../../data/supplementary-questions.js';

describe('validateTeamAnswers', () => {
  const validCore = {
    '7.1': 1, '7.2': 2, '7.3': 3,
    '3.3': [1, 2], '3.4': [1], '6.1': [1]
  };

  const validSupp = {};
  for (const sq of supplementaryQuestions) {
    validSupp[sq.id] = sq.type === 'multi' ? [1, 2] : 1;
  }

  it('passes with all required answers', () => {
    const result = validateTeamAnswers(validCore, validSupp);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when section 7 questions missing', () => {
    const core = { ...validCore };
    delete core['7.1'];
    const result = validateTeamAnswers(core, validSupp);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Q7.1 is required in team mode');
  });

  it('fails when Q3.3 is empty array', () => {
    const core = { ...validCore, '3.3': [] };
    const result = validateTeamAnswers(core, validSupp);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Q3.3'))).toBe(true);
  });

  it('fails when Q6.1 is missing', () => {
    const core = { ...validCore };
    delete core['6.1'];
    const result = validateTeamAnswers(core, validSupp);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Q6.1'))).toBe(true);
  });

  it('fails when supplementary questions are missing', () => {
    const result = validateTeamAnswers(validCore, {});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(supplementaryQuestions.length);
  });

  it('fails when multi-select supplementary has empty array', () => {
    const supp = { ...validSupp, S2: [] };
    const result = validateTeamAnswers(validCore, supp);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('S2'))).toBe(true);
  });
});

describe('getRetakeConfirmations', () => {
  it('returns confirmations for previously answered static questions', () => {
    const prev = { '3.3': [1, 2], '4.1': 3, '1.1': 1 };
    const confirmations = getRetakeConfirmations(prev);
    expect(confirmations['3.3']).toEqual([1, 2]);
    expect(confirmations['4.1']).toBe(3);
    expect(confirmations['1.1']).toBeUndefined(); // Not a static question
  });

  it('returns empty for no previous answers', () => {
    expect(getRetakeConfirmations({})).toEqual({});
  });

  it('includes all 5 static questions when present', () => {
    const prev = {};
    for (const q of STATIC_QUESTIONS) prev[q] = 1;
    const confirmations = getRetakeConfirmations(prev);
    expect(Object.keys(confirmations)).toHaveLength(5);
  });
});
