import { archetypes } from '../data/archetypes.js';

/**
 * Calculate Euclidean distance between user scores and each archetype's ideal.
 * Returns primary and optional secondary archetype (within 15 points of primary similarity).
 */
export function matchArchetypes(normalizedScores) {
  const results = [];

  for (const [id, archetype] of Object.entries(archetypes)) {
    let sumSquares = 0;
    for (let i = 1; i <= 14; i++) {
      sumSquares += Math.pow(normalizedScores[i] - archetype.ideal[i], 2);
    }
    const distance = Math.sqrt(sumSquares);
    // Max theoretical distance for similarity calculation
    // Using 374.2 as specified in the spec
    const similarity = Math.max(0, ((374.2 - distance) / 374.2) * 100);
    results.push({ id, name: archetype.name, distance, similarity });
  }

  results.sort((a, b) => a.distance - b.distance);

  const primary = results[0];
  const secondaryCandidate = results[1];
  const hasSecondary = secondaryCandidate &&
    (primary.similarity - secondaryCandidate.similarity) <= 15;

  return {
    primary: primary.id,
    primaryName: primary.name,
    primarySimilarity: Math.round(primary.similarity * 10) / 10,
    primaryDistance: Math.round(primary.distance * 10) / 10,
    secondary: hasSecondary ? secondaryCandidate.id : null,
    secondaryName: hasSecondary ? secondaryCandidate.name : null,
    secondarySimilarity: hasSecondary ? Math.round(secondaryCandidate.similarity * 10) / 10 : null,
    allResults: results
  };
}
