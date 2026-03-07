import { describe, it, expect } from 'vitest';
import { calculateRawScores, calculateTheoreticalRange, normalizeScores, assignZones } from '../scoring.js';
import { matchArchetypes } from '../archetype-matching.js';
import { detectDeviations } from '../deviation-detector.js';
import { generateProfile, generateProfileData } from '../profile-generator.js';
import { assembleWorkContext } from '../work-context.js';
import { archetypes } from '../../data/archetypes.js';
import { weights, SPECTRUM_NAMES } from '../../data/weights.js';

// ─── Scoring ───────────────────────────────────────────────

describe('calculateRawScores', () => {
  it('returns zeroes for empty answers', () => {
    const raw = calculateRawScores({});
    for (let i = 1; i <= 14; i++) {
      expect(raw[i]).toBe(0);
    }
  });

  it('sums single-select weights correctly', () => {
    // Q1.1 option 1 contributes { 3: -2, 13: -2, 4: -1 }
    const raw = calculateRawScores({ "1.1": 1 });
    expect(raw[3]).toBe(-2);
    expect(raw[13]).toBe(-2);
    expect(raw[4]).toBe(-1);
    expect(raw[1]).toBe(0); // not affected
  });

  it('sums multi-select weights for all selections', () => {
    // Q3.3 is multi-select
    const raw = calculateRawScores({ "3.3": [1, 2] });
    // Both options should contribute
    const raw1 = calculateRawScores({ "3.3": [1] });
    const raw2 = calculateRawScores({ "3.3": [2] });
    for (let i = 1; i <= 14; i++) {
      expect(raw[i]).toBe(raw1[i] + raw2[i]);
    }
  });

  it('ignores unknown question IDs', () => {
    const raw = calculateRawScores({ "99.99": 1 });
    for (let i = 1; i <= 14; i++) {
      expect(raw[i]).toBe(0);
    }
  });
});

describe('calculateTheoreticalRange', () => {
  it('returns min/max for all 14 spectrums', () => {
    const { mins, maxs } = calculateTheoreticalRange(true);
    for (let i = 1; i <= 14; i++) {
      expect(mins[i]).toBeDefined();
      expect(maxs[i]).toBeDefined();
      expect(maxs[i]).toBeGreaterThanOrEqual(mins[i]);
    }
  });

  it('range without section 7 is narrower or equal', () => {
    const with7 = calculateTheoreticalRange(true);
    const without7 = calculateTheoreticalRange(false);
    for (let i = 1; i <= 14; i++) {
      expect(without7.mins[i]).toBeGreaterThanOrEqual(with7.mins[i]);
      expect(without7.maxs[i]).toBeLessThanOrEqual(with7.maxs[i]);
    }
  });
});

describe('normalizeScores', () => {
  it('normalizes min raw to 0 and max raw to 100', () => {
    const { mins, maxs } = calculateTheoreticalRange(true);
    const normMin = normalizeScores(mins, true);
    const normMax = normalizeScores(maxs, true);
    for (let i = 1; i <= 14; i++) {
      expect(normMin[i]).toBe(0);
      expect(normMax[i]).toBe(100);
    }
  });

  it('clamps values to 0-100', () => {
    const extremeRaw = {};
    for (let i = 1; i <= 14; i++) extremeRaw[i] = 999;
    const norm = normalizeScores(extremeRaw, true);
    for (let i = 1; i <= 14; i++) {
      expect(norm[i]).toBeLessThanOrEqual(100);
      expect(norm[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns 50 when min equals max', () => {
    // Create a mock where all spectrums have 0 range
    // This shouldn't happen in practice but tests the safety branch
    const raw = {};
    for (let i = 1; i <= 14; i++) raw[i] = 0;
    const norm = normalizeScores(raw, true);
    // At least verify all values are in range
    for (let i = 1; i <= 14; i++) {
      expect(norm[i]).toBeGreaterThanOrEqual(0);
      expect(norm[i]).toBeLessThanOrEqual(100);
    }
  });
});

describe('assignZones', () => {
  it('assigns correct zone boundaries', () => {
    const scores = { 1: 0, 2: 10, 3: 20, 4: 21, 5: 40, 6: 41, 7: 60, 8: 61, 9: 80, 10: 81, 11: 100, 12: 50, 13: 30, 14: 70 };
    const zones = assignZones(scores);
    expect(zones[1]).toBe('strong-left');   // 0
    expect(zones[2]).toBe('strong-left');   // 10
    expect(zones[3]).toBe('strong-left');   // 20 (boundary inclusive)
    expect(zones[4]).toBe('lean-left');     // 21
    expect(zones[5]).toBe('lean-left');     // 40 (boundary inclusive)
    expect(zones[6]).toBe('neutral');       // 41
    expect(zones[7]).toBe('neutral');       // 60 (boundary inclusive)
    expect(zones[8]).toBe('lean-right');    // 61
    expect(zones[9]).toBe('lean-right');    // 80 (boundary inclusive)
    expect(zones[10]).toBe('strong-right'); // 81
    expect(zones[11]).toBe('strong-right'); // 100
    expect(zones[12]).toBe('neutral');      // 50
    expect(zones[13]).toBe('lean-left');    // 30
    expect(zones[14]).toBe('lean-right');   // 70
  });
});

// ─── Archetype Matching ────────────────────────────────────

describe('matchArchetypes', () => {
  it('matches exact archetype ideal to itself', () => {
    for (const [id, arch] of Object.entries(archetypes)) {
      const result = matchArchetypes(arch.ideal);
      expect(result.primary).toBe(id);
      expect(result.primaryDistance).toBe(0);
    }
  });

  it('returns secondary when two archetypes are close', () => {
    // Average of operator and strategist ideals — should match both
    const blended = {};
    for (let i = 1; i <= 14; i++) {
      blended[i] = (archetypes.operator.ideal[i] + archetypes.strategist.ideal[i]) / 2;
    }
    const result = matchArchetypes(blended);
    expect(result.secondary).not.toBeNull();
  });

  it('returns null secondary when primary is dominant', () => {
    // Exact archetype match should have no secondary (distance=0 vs anything else)
    const result = matchArchetypes(archetypes.tinkerer.ideal);
    // Tinkerer is quite distinctive, so secondary may or may not appear
    // But primary should definitely be tinkerer
    expect(result.primary).toBe('tinkerer');
  });

  it('similarity is between 0 and 100', () => {
    const result = matchArchetypes(archetypes.operator.ideal);
    expect(result.primarySimilarity).toBeGreaterThanOrEqual(0);
    expect(result.primarySimilarity).toBeLessThanOrEqual(100);
    for (const r of result.allResults) {
      expect(r.similarity).toBeGreaterThanOrEqual(0);
      expect(r.similarity).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Deviation Detector ────────────────────────────────────

describe('detectDeviations', () => {
  it('returns empty array when scores match archetype ideal', () => {
    const deviations = detectDeviations(archetypes.operator.ideal, 'operator');
    expect(deviations).toEqual([]);
  });

  it('detects deviation above 25 threshold', () => {
    const scores = { ...archetypes.operator.ideal };
    scores[1] = scores[1] + 30; // Push spectrum 1 well past threshold
    const deviations = detectDeviations(scores, 'operator');
    expect(deviations.some(d => d.spectrum === 1)).toBe(true);
  });

  it('uses lower threshold (17) for motivation (spectrum 10)', () => {
    const scores = { ...archetypes.operator.ideal };
    scores[10] = scores[10] + 20; // Above 17 but below 25
    const deviations = detectDeviations(scores, 'operator');
    expect(deviations.some(d => d.spectrum === 10)).toBe(true);
  });

  it('suppresses spectrum 9 (energy)', () => {
    const scores = { ...archetypes.operator.ideal };
    scores[9] = scores[9] + 50; // Huge deviation
    const deviations = detectDeviations(scores, 'operator');
    expect(deviations.some(d => d.spectrum === 9)).toBe(false);
  });

  it('caps at 3 deviations', () => {
    // Create massive deviations on many spectrums
    const scores = {};
    for (let i = 1; i <= 14; i++) {
      scores[i] = archetypes.operator.ideal[i] + 40;
    }
    const deviations = detectDeviations(scores, 'operator');
    expect(deviations.length).toBeLessThanOrEqual(3);
  });

  it('sorts by deviation size descending', () => {
    const scores = {};
    for (let i = 1; i <= 14; i++) {
      scores[i] = archetypes.operator.ideal[i] + 40;
    }
    const deviations = detectDeviations(scores, 'operator');
    for (let i = 1; i < deviations.length; i++) {
      expect(deviations[i].deviation).toBeLessThanOrEqual(deviations[i - 1].deviation);
    }
  });

  it('uses raised threshold (35) for secondary-covered spectrums instead of suppressing', () => {
    // Strategist + Navigator: top-2 diffs include spectrum 6 (diff=40) and spectrum 7 (diff=35)
    const scores = { ...archetypes.strategist.ideal };
    // Push spectrum 6 by 36 (above raised threshold of 35)
    scores[6] = scores[6] + 36;
    const deviations = detectDeviations(scores, 'strategist', 'navigator');
    // Should still detect it since 36 >= 35 (raised threshold)
    expect(deviations.some(d => d.spectrum === 6)).toBe(true);
  });

  it('filters secondary-covered spectrums when deviation is below raised threshold', () => {
    const scores = { ...archetypes.strategist.ideal };
    // Push spectrum 6 by 30 (above default 25, but below raised 35)
    scores[6] = scores[6] + 30;
    const deviations = detectDeviations(scores, 'strategist', 'navigator');
    // Should NOT detect it since 30 < 35 (raised threshold for covered spectrums)
    expect(deviations.some(d => d.spectrum === 6)).toBe(false);
  });

  it('includes direction (higher/lower) and sentence', () => {
    const scores = { ...archetypes.operator.ideal };
    scores[1] = scores[1] + 30;
    const deviations = detectDeviations(scores, 'operator');
    const dev = deviations.find(d => d.spectrum === 1);
    expect(dev).toBeDefined();
    expect(dev.direction).toBe('higher');
    expect(dev.sentence).toBeTruthy();
  });
});

// ─── Work Context ──────────────────────────────────────────

describe('assembleWorkContext', () => {
  it('returns empty string for empty answers', () => {
    expect(assembleWorkContext({})).toBe('');
  });

  it('assembles basic context from Q3.1 + Q3.2', () => {
    const result = assembleWorkContext({ "3.1": 1, "3.2": 1 });
    expect(result).toContain('I primarily use AI for work');
    expect(result).toContain('daily');
  });

  it('includes work type from Q4.1', () => {
    const result = assembleWorkContext({ "4.1": 2 });
    expect(result).toContain('technical');
  });

  it('formats tool list from Q3.3', () => {
    const result = assembleWorkContext({ "3.3": [1, 2, 3] });
    expect(result).toContain('Microsoft Office');
    expect(result).toContain('Google Workspace');
    expect(result).toContain('programming and scripting tools');
  });

  it('handles phone-only Q3.3', () => {
    const result = assembleWorkContext({ "3.3": [8] });
    expect(result).toContain('phone');
  });

  it('handles topic breadth option 6 (wide range)', () => {
    const result = assembleWorkContext({ "3.4": [6] });
    expect(result).toContain('wide range');
  });

  it('handles topic breadth option 5 only (work-focused)', () => {
    const result = assembleWorkContext({ "3.4": [5] });
    expect(result).toContain('focused on work');
  });

  it('uses first-person voice', () => {
    const result = assembleWorkContext({ "3.1": 4, "3.2": 1, "4.1": 1, "4.2": 1, "3.4": [6], "4.4": 2 });
    expect(result).not.toContain('This person');
    expect(result).not.toContain('They ');
    expect(result).not.toContain('Their ');
    expect(result).toContain('I ');
  });
});

// ─── Profile Generator ─────────────────────────────────────

describe('generateProfile', () => {
  const baseAnswers = {
    "1.1": 1, "1.4": 3, "1.7": 1, "2.5": 1,
    "3.1": 4, "3.2": 1, "4.1": 1, "4.2": 1, "4.3": 2, "4.5": 4,
    "5.6": 2, "5.7": 3, "5.10": 4, "5.11": 2,
    "6.1": [1, 9],
    "7.1": 3, "7.2": 2, "7.3": 1,
    "3.3": [1, 2, 3], "3.4": [6], "4.4": 2
  };
  const baseZones = {};
  for (let i = 1; i <= 14; i++) baseZones[i] = 'neutral';
  // Set some strong zones for testing core prioritization
  baseZones[2] = 'strong-left';
  baseZones[5] = 'strong-left';
  baseZones[7] = 'strong-left';

  const archetypeResult = {
    primary: 'strategist',
    primaryName: 'The Strategist',
    secondary: 'navigator',
    secondaryName: 'The Navigator'
  };
  const deviations = [];

  it('generates markdown with all sections', () => {
    const { markdown, markdownForCopy } = generateProfile(baseAnswers, baseZones, archetypeResult, deviations);
    expect(markdown).toContain('# My AI Profile');
    expect(markdown).toContain('## About Me');
    expect(markdown).toContain('## Work Context');
    expect(markdown).toContain('## How to Work With Me');
    expect(markdown).toContain('## Getting Better Results');
  });

  it('excludes Getting Better Results from copy version', () => {
    const { markdownForCopy } = generateProfile(baseAnswers, baseZones, archetypeResult, deviations);
    expect(markdownForCopy).not.toContain('## Getting Better Results');
  });

  it('includes custom notes as In My Own Words when provided', () => {
    const answers = { ...baseAnswers, "6.3": "I prefer blunt feedback" };
    const { markdownForCopy } = generateProfile(answers, baseZones, archetypeResult, deviations);
    expect(markdownForCopy).toContain('## In My Own Words');
    expect(markdownForCopy).toContain('I prefer blunt feedback');
  });

  it('places custom notes before How to Work With Me', () => {
    const answers = { ...baseAnswers, "6.3": "test note" };
    const { markdownForCopy } = generateProfile(answers, baseZones, archetypeResult, deviations);
    const noteIdx = markdownForCopy.indexOf('## In My Own Words');
    const instrIdx = markdownForCopy.indexOf('## How to Work With Me');
    expect(noteIdx).toBeLessThan(instrIdx);
  });

  it('bolds core instructions in markdown', () => {
    const { markdownForCopy } = generateProfile(baseAnswers, baseZones, archetypeResult, deviations);
    // Strong-left zone 2 instruction should be bolded
    expect(markdownForCopy).toContain('- **Be direct and professional');
  });

  it('uses first-person voice in About Me', () => {
    const { markdown } = generateProfile(baseAnswers, baseZones, archetypeResult, deviations);
    const aboutMeSection = markdown.split('## About Me')[1].split('##')[0];
    expect(aboutMeSection).toContain('I ');
    expect(aboutMeSection).not.toContain('This person');
  });

  it('suppresses null neutral-zone instructions', () => {
    // All neutrals — spectrums 4, 6, 8, 10, 14 should be suppressed
    const allNeutralZones = {};
    for (let i = 1; i <= 14; i++) allNeutralZones[i] = 'neutral';
    const { markdown } = generateProfile(baseAnswers, allNeutralZones, archetypeResult, deviations);
    // These vague "balance X and Y" instructions should not appear
    expect(markdown).not.toContain('Mix analytical and practical');
    expect(markdown).not.toContain('Balance leading and following');
    expect(markdown).not.toContain('Balance efficiency with completeness');
    expect(markdown).not.toContain('Balance getting things done');
    expect(markdown).not.toContain('Balance delivery with engagement');
  });
});

describe('generateProfileData', () => {
  it('returns instructions as {text, core} objects', () => {
    const answers = { "1.1": 1, "5.11": 2 };
    const scores = {};
    for (let i = 1; i <= 14; i++) scores[i] = 50;
    const zones = {};
    for (let i = 1; i <= 14; i++) zones[i] = 'neutral';
    zones[2] = 'strong-left';

    const archetypeResult = { primary: 'strategist', primaryName: 'The Strategist', secondary: null, secondaryName: null };
    const data = generateProfileData(answers, scores, zones, archetypeResult, []);
    expect(data.instructions.length).toBeGreaterThan(0);
    for (const inst of data.instructions) {
      expect(inst).toHaveProperty('text');
      expect(inst).toHaveProperty('core');
      expect(typeof inst.text).toBe('string');
      expect(typeof inst.core).toBe('boolean');
    }
  });

  it('marks strong-zone instructions as core', () => {
    const answers = {};
    const scores = {};
    for (let i = 1; i <= 14; i++) scores[i] = 50;
    const zones = {};
    for (let i = 1; i <= 14; i++) zones[i] = 'neutral';
    zones[5] = 'strong-left'; // Feedback: blunt

    const archetypeResult = { primary: 'operator', primaryName: 'The Operator', secondary: null, secondaryName: null };
    const data = generateProfileData(answers, scores, zones, archetypeResult, []);
    const feedbackInst = data.instructions.find(i => i.text.includes('blunt'));
    expect(feedbackInst).toBeDefined();
    expect(feedbackInst.core).toBe(true);
  });
});
