/**
 * Team quiz mode enforcement and validation.
 * In team mode, all sections are mandatory and supplementary questions are required.
 */

import { supplementaryQuestions } from '../data/supplementary-questions.js';

/** Questions that are confirmation-style on retakes (show previous answer, ask "still accurate?") */
export const STATIC_QUESTIONS = ['3.3', '3.4', '4.1', '4.2', '4.5'];

/**
 * Validate that team mode answers meet all requirements.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateTeamAnswers(coreAnswers, supplementaryAnswers) {
  const errors = [];

  // Section 7 is mandatory — check Q7.1, Q7.2, Q7.3
  for (const qId of ['7.1', '7.2', '7.3']) {
    if (coreAnswers[qId] == null) {
      errors.push(`Q${qId} is required in team mode`);
    }
  }

  // Q3.3 requires at least one selection
  const q33 = coreAnswers['3.3'];
  if (!q33 || !Array.isArray(q33) || q33.length === 0) {
    errors.push('Q3.3 (tools) requires at least one selection in team mode');
  }

  // Q3.4 requires at least one selection
  const q34 = coreAnswers['3.4'];
  if (!q34 || !Array.isArray(q34) || q34.length === 0) {
    errors.push('Q3.4 (topic breadth) requires at least one selection in team mode');
  }

  // Q6.1 requires at least one selection
  const q61 = coreAnswers['6.1'];
  if (!q61 || !Array.isArray(q61) || q61.length === 0) {
    errors.push('Q6.1 (friction points) requires at least one selection in team mode');
  }

  // All supplementary questions required
  for (const sq of supplementaryQuestions) {
    const answer = supplementaryAnswers[sq.id];
    if (answer == null) {
      errors.push(`${sq.id} is required in team mode`);
    } else if (sq.type === 'multi' && (!Array.isArray(answer) || answer.length === 0)) {
      errors.push(`${sq.id} requires at least one selection`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Determine which core questions should be presented as confirmations on retake.
 * Returns an object mapping question ID to the previous answer.
 */
export function getRetakeConfirmations(previousAnswers) {
  const confirmations = {};
  for (const qId of STATIC_QUESTIONS) {
    if (previousAnswers[qId] != null) {
      confirmations[qId] = previousAnswers[qId];
    }
  }
  return confirmations;
}
