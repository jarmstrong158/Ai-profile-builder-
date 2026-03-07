/**
 * Validation script: verifies scoring engine produces correct results.
 * Cross-checked against the Python validation script from the spec.
 */

import { calculateRawScores, normalizeScores, assignZones, calculateTheoreticalRange } from '../scoring.js';
import { matchArchetypes } from '../archetype-matching.js';
import { detectDeviations } from '../deviation-detector.js';
import { assembleWorkContext } from '../work-context.js';
import { generateProfile } from '../profile-generator.js';
import { SPECTRUM_NAMES } from '../../data/weights.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

function assertClose(actual, expected, tolerance, msg) {
  assert(Math.abs(actual - expected) <= tolerance, `${msg}: expected ~${expected}, got ${actual}`);
}

// ── Verify theoretical ranges match Python script exactly ──
console.log("=== THEORETICAL RANGE VERIFICATION ===");
const { mins, maxs } = calculateTheoreticalRange(true);

// Expected ranges from Python validation script
const expectedMins = { 1: -28, 2: -14, 3: -12, 4: -8, 5: -11, 6: -25, 7: -13, 8: -25, 9: -4, 10: -19, 11: -12, 12: -10, 13: -11, 14: -10 };
const expectedMaxs = { 1: 19, 2: 11, 3: 11, 4: 3, 5: 9, 6: 4, 7: 12, 8: 17, 9: 2, 10: 25, 11: 20, 12: 10, 13: 9, 14: 20 };

for (let i = 1; i <= 14; i++) {
  assert(mins[i] === expectedMins[i], `Min for ${SPECTRUM_NAMES[i]}: expected ${expectedMins[i]}, got ${mins[i]}`);
  assert(maxs[i] === expectedMaxs[i], `Max for ${SPECTRUM_NAMES[i]}: expected ${expectedMaxs[i]}, got ${maxs[i]}`);
}

// ── Test Case 1: The Direct Builder ──
console.log("\n=== TEST CASE 1: The Direct Builder ===");
const tc1 = {
  "1.1": 1, "1.2": 1, "1.3": 1, "1.4": 1, "1.5": 1,
  "1.6": 1, "1.7": 1,
  "2.1": 1, "2.2": 3, "2.3": 1, "2.4": 1, "2.5": 1,
  "3.1": 4, "3.2": 1, "3.3": [1,3,7], "3.4": [1,2,6],
  "4.1": 1, "4.2": 1, "4.3": 1, "4.4": 2, "4.5": 1,
  "5.1": 1, "5.2": 1, "5.3": 2, "5.4": 1, "5.5": 2, "5.6": 1, "5.7": 1,
  "5.8": 1, "5.9": 1, "5.10": 3, "5.11": 1,
  "6.1": [1,2,4,6,7,10], "6.2": 1, "6.3": "If you're not sure, say so.",
  "7.1": 1, "7.2": 3, "7.3": 1,
  "8.1": 3
};

const raw1 = calculateRawScores(tc1);
const norm1 = normalizeScores(raw1, true);
const zones1 = assignZones(norm1);
const arch1 = matchArchetypes(norm1);
const devs1 = detectDeviations(norm1, arch1.primary, arch1.secondary);

// Verify exact normalized scores (cross-checked with Python)
const expected1 = { 1: 23.4, 2: 8, 3: 56.5, 4: 36.4, 5: 5, 6: 58.6, 7: 16, 8: 23.8, 9: 33.3, 10: 29.5, 11: 62.5, 12: 40, 13: 35, 14: 36.7 };
for (let i = 1; i <= 14; i++) {
  assertClose(norm1[i], expected1[i], 0.2, `TC1 ${SPECTRUM_NAMES[i]}`);
}
assert(arch1.primary === "operator", `TC1 Primary: expected operator, got ${arch1.primary}`);
console.log(`  Primary: ${arch1.primaryName}, Secondary: ${arch1.secondaryName}`);
console.log(`  Deviations: ${devs1.map(d => `${d.spectrumName}: ${d.direction} (${d.deviation.toFixed(1)})`).join(", ") || "none"}`);

// Verify profile output
const profile1 = generateProfile(tc1, zones1, arch1, devs1).markdown;
assert(profile1.includes("# My AI Profile"), "TC1 Profile has header");
assert(profile1.includes("## About Me"), "TC1 Profile has About Me");
assert(profile1.includes("## Work Context"), "TC1 Profile has Work Context");
assert(profile1.includes("## How to Work With Me"), "TC1 Profile has How to Work With Me");
assert(profile1.includes("## Getting Better Results"), "TC1 Profile has Getting Better Results");
assert(profile1.includes("## Custom Notes"), "TC1 Profile has Custom Notes");
assert(profile1.includes("If you're not sure, say so."), "TC1 Custom Notes content");

// Verify work context
const wc1 = assembleWorkContext(tc1);
assert(wc1.includes("wide range of tasks"), "TC1 WC: wide range");
assert(wc1.includes("daily"), "TC1 WC: daily");
assert(wc1.includes("management, operations"), "TC1 WC: management");
assert(wc1.includes("Microsoft Office"), "TC1 WC: MS Office");
assert(wc1.includes("programming and scripting"), "TC1 WC: programming");
assert(wc1.includes("accounting and business software"), "TC1 WC: accounting");

// ── Test Case 2: The Curious Learner ──
console.log("\n=== TEST CASE 2: The Curious Learner ===");
const tc2 = {
  "1.1": 3, "1.2": 3, "1.3": 2, "1.4": 2, "1.5": 4,
  "1.6": 2, "1.7": 3,
  "2.1": 3, "2.2": 2, "2.3": 3, "2.4": 3, "2.5": 3,
  "3.1": 2, "3.2": 4, "3.3": [1,2], "3.4": [2,4],
  "4.1": 9, "4.2": 4, "4.3": 2, "4.4": 4, "4.5": 3,
  "5.1": 3, "5.2": 2, "5.3": 3, "5.4": 2, "5.5": 3, "5.6": 3, "5.7": 3,
  "5.8": 1, "5.9": 3, "5.10": 1, "5.11": 2,
  "6.1": [7,8], "6.2": 2, "6.3": "I learn best when it feels like a two-way street.",
  "7.1": 3, "7.2": 2, "7.3": 2,
  "8.1": 2
};

const raw2 = calculateRawScores(tc2);
const norm2 = normalizeScores(raw2, true);
const zones2 = assignZones(norm2);
const arch2 = matchArchetypes(norm2);
const devs2 = detectDeviations(norm2, arch2.primary, arch2.secondary);

console.log(`  Primary: ${arch2.primaryName}, Secondary: ${arch2.secondaryName}`);
console.log(`  Deviations: ${devs2.map(d => `${d.spectrumName}: ${d.direction} (${d.deviation.toFixed(1)})`).join(", ") || "none"}`);

// Core directional checks (right half of spectrum)
assert(norm2[1] > 60, "TC2 Comm density is right-leaning (thorough)");
assert(norm2[2] > 60, "TC2 Comm tone is right-leaning (warm)");
assert(norm2[3] < 40, "TC2 Learning mode is left-leaning (structured)");
assert(norm2[10] > 60, "TC2 Motivation is right-leaning (mastery)");
assert(norm2[14] > 60, "TC2 Collaboration is right-leaning (partnered)");

const wc2 = assembleWorkContext(tc2);
assert(wc2.includes("learning and building new skills"), "TC2 WC: learning");
assert(wc2.includes("just getting started"), "TC2 WC: getting started");
assert(wc2.includes("student"), "TC2 WC: student");
assert(wc2.includes("Microsoft Office and Google Workspace"), "TC2 WC: tools");

// ── Test Case 3: The Fast Experimenter ──
console.log("\n=== TEST CASE 3: The Fast Experimenter ===");
const tc3 = {
  "1.1": 2, "1.2": 4, "1.3": 3, "1.4": 3, "1.5": 2,
  "1.6": 3, "1.7": 2,
  "2.1": 2, "2.2": 3, "2.3": 1, "2.4": 2, "2.5": 1,
  "3.1": 3, "3.2": 1, "3.3": [3], "3.4": [1,3],
  "4.1": 2, "4.2": 1, "4.3": 3, "4.4": 2, "4.5": 4,
  "5.1": 1, "5.2": 4, "5.3": 2, "5.4": 1, "5.5": 2, "5.6": 1, "5.7": 1,
  "5.8": 1, "5.9": 1, "5.10": 3, "5.11": 1,
  "6.1": [1,5,6], "6.2": 3,
  "7.1": 4, "7.2": 3, "7.3": 1,
  "8.1": 3
};

const raw3 = calculateRawScores(tc3);
const norm3 = normalizeScores(raw3, true);
const zones3 = assignZones(norm3);
const arch3 = matchArchetypes(norm3);
const devs3 = detectDeviations(norm3, arch3.primary, arch3.secondary);

console.log(`  Primary: ${arch3.primaryName}, Secondary: ${arch3.secondaryName}`);
assert(arch3.primary === "tinkerer", `TC3 Primary: expected tinkerer, got ${arch3.primary}`);
assert(norm3[3] > 80, "TC3 Learning mode is strongly exploratory");
assert(norm3[7] < 20, "TC3 Technical comfort is strongly builder");
assert(norm3[11] > 75, "TC3 AI autonomy is strongly AI-empowered");

const profile3 = generateProfile(tc3, zones3, arch3, devs3).markdown;
assert(!profile3.includes("## Custom Notes"), "TC3 No Custom Notes (skipped)");

// ── Test Case 4: The Thoughtful Partner ──
console.log("\n=== TEST CASE 4: The Thoughtful Partner ===");
const tc4 = {
  "1.1": 4, "1.2": 2, "1.3": 4, "1.4": 4, "1.5": 3,
  "1.6": 2, "1.7": 3,
  "2.1": 4, "2.2": 2, "2.3": 4, "2.4": 2, "2.5": 2,
  "3.1": 4, "3.2": 2, "3.3": [1,2,5], "3.4": [1,2,4],
  "4.1": 1, "4.2": 2, "4.3": 4, "4.4": 2, "4.5": 2,
  "5.1": 2, "5.2": 2, "5.3": 4, "5.4": 4, "5.5": 2, "5.6": 2, "5.7": 1,
  "5.8": 4, "5.9": 2, "5.10": 4, "5.11": 4,
  "6.1": [1,9], "6.2": 4, "6.3": "I value honesty and real engagement over performance.",
  "7.1": 3, "7.2": 3, "7.3": 3,
  "8.1": 4
};

const raw4 = calculateRawScores(tc4);
const norm4 = normalizeScores(raw4, true);
const zones4 = assignZones(norm4);
const arch4 = matchArchetypes(norm4);
const devs4 = detectDeviations(norm4, arch4.primary, arch4.secondary);

console.log(`  Primary: ${arch4.primaryName}, Secondary: ${arch4.secondaryName}`);
console.log(`  Deviations: ${devs4.map(d => `${d.spectrumName}: ${d.direction} (${d.deviation.toFixed(1)})`).join(", ") || "none"}`);

// Directional checks
assert(norm4[2] > 60, "TC4 Comm tone is warm-leaning");
assert(norm4[6] > 60, "TC4 Decision autonomy is group-leaning");
assert(norm4[14] > 60, "TC4 Collaboration is partnered");

const wc4 = assembleWorkContext(tc4);
assert(wc4.includes("wide range of tasks"), "TC4 WC: wide range");
assert(wc4.includes("management, operations"), "TC4 WC: management");
assert(wc4.includes("Microsoft Office, Google Workspace, and project management tools"), "TC4 WC: tools");

// ── Test Case 5: The Deviation Edge Case ──
console.log("\n=== TEST CASE 5: The Deviation Edge Case ===");
const tc5 = {
  "1.1": 2, "1.2": 4, "1.3": 1, "1.4": 3, "1.5": 2,
  "1.6": 3, "1.7": 4,
  "2.1": 1, "2.2": 1, "2.3": 1, "2.4": 1, "2.5": 1,
  "3.1": 3, "3.2": 1, "3.3": [3], "3.4": [1,6],
  "4.1": 2, "4.2": 1, "4.3": 3, "4.4": 1, "4.5": 1,
  "5.1": 1, "5.2": 1, "5.3": 2, "5.4": 1, "5.5": 1, "5.6": 1, "5.7": 1,
  "5.8": 3, "5.9": 1, "5.10": 3, "5.11": 1,
  "6.1": [1,2,4,6], "6.2": 1,
  "7.1": 1, "7.2": 3, "7.3": 1,
  "8.1": 1
};

const raw5 = calculateRawScores(tc5);
const norm5 = normalizeScores(raw5, true);
const zones5 = assignZones(norm5);
const arch5 = matchArchetypes(norm5);
const devs5 = detectDeviations(norm5, arch5.primary, arch5.secondary);

console.log(`  Primary: ${arch5.primaryName}, Secondary: ${arch5.secondaryName}`);
console.log(`  Deviations: ${devs5.map(d => `${d.spectrumName}: ${d.direction} (${d.deviation.toFixed(1)})`).join(", ") || "none"}`);

// Key directional checks
assert(norm5[2] < 20, "TC5 Comm tone strongly direct");
assert(norm5[3] > 80, "TC5 Learning mode strongly exploratory");
assert(norm5[7] < 20, "TC5 Technical comfort strongly builder");
assert(norm5[8] < 25, "TC5 Patience strongly low");

// Deviation detector should fire (multiple deviations from any archetype)
assert(devs5.length > 0, "TC5 has deviations");
assert(devs5.length <= 3, "TC5 deviations capped at 3");

// ── Scoring determinism ──
console.log("\n=== DETERMINISM TEST ===");
const raw1b = calculateRawScores(tc1);
const norm1b = normalizeScores(raw1b, true);
for (let i = 1; i <= 14; i++) {
  assert(norm1[i] === norm1b[i], `Determinism: spectrum ${i} same on re-run`);
}

// ── Zone boundary tests ──
console.log("\n=== ZONE BOUNDARY TESTS ===");
assert(assignZones({ 1: 0 })[1] === "strong-left", "Score 0 → strong-left");
assert(assignZones({ 1: 20 })[1] === "strong-left", "Score 20 → strong-left");
assert(assignZones({ 1: 21 })[1] === "lean-left", "Score 21 → lean-left");
assert(assignZones({ 1: 40 })[1] === "lean-left", "Score 40 → lean-left");
assert(assignZones({ 1: 41 })[1] === "neutral", "Score 41 → neutral");
assert(assignZones({ 1: 60 })[1] === "neutral", "Score 60 → neutral");
assert(assignZones({ 1: 61 })[1] === "lean-right", "Score 61 → lean-right");
assert(assignZones({ 1: 80 })[1] === "lean-right", "Score 80 → lean-right");
assert(assignZones({ 1: 81 })[1] === "strong-right", "Score 81 → strong-right");
assert(assignZones({ 1: 100 })[1] === "strong-right", "Score 100 → strong-right");

// ── Profile generation structure ──
console.log("\n=== PROFILE STRUCTURE TESTS ===");
const profile5 = generateProfile(tc5, zones5, arch5, devs5).markdown;
assert(profile5.includes("# My AI Profile"), "Profile has title");
assert(profile5.includes("*Generated by AI Onboard*"), "Profile has byline");
assert(profile5.includes("## About Me"), "Profile has About Me");
assert(profile5.includes("## Work Context"), "Profile has Work Context");
assert(profile5.includes("## How to Work With Me"), "Profile has instructions");
assert(profile5.includes("## Getting Better Results"), "Profile has tips");
assert(!profile5.includes("## Custom Notes"), "TC5 no custom notes (skipped)");

// Direct instructions should appear
const profile1text = generateProfile(tc1, zones1, arch1, devs1).markdown;
assert(profile1text.includes("switches topics without warning"), "TC1 has Q2.5 direct instruction");
assert(profile1text.includes("already worked on the problem"), "TC1 has Q4.5 direct instruction");
assert(profile1text.includes("full complexity"), "TC1 has Q5.7 direct instruction");
assert(profile1text.includes("plan or framework"), "TC1 has Q1.1 direct instruction");
assert(profile1text.includes("bullet points and lists"), "TC1 has Q1.4 direct instruction");
assert(profile1text.includes("say so directly"), "TC1 has Q1.7 direct instruction");
assert(profile1text.includes("give the solution directly"), "TC1 has Q4.3 direct instruction");
assert(profile1text.includes("fix it immediately without commentary"), "TC1 has Q5.6 direct instruction");
assert(profile1text.includes("high-level direction"), "TC1 has Q5.10 direct instruction");
assert(profile1text.includes("speed over perfection"), "TC1 has Q5.11 direct instruction");

// ── Summary ──
console.log(`\n${'='.repeat(60)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
if (failed === 0) {
  console.log("ALL CHECKS PASSED");
} else {
  console.log("SOME CHECKS FAILED");
  process.exit(1);
}
