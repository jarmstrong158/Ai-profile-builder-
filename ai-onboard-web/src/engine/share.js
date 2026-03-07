/**
 * Encode profile data into a compact URL-safe string.
 * Format: scores are rounded to integers (0-100), joined by commas,
 * then base64url encoded with archetype IDs prepended.
 *
 * Structure: "v1:<primary>:<secondary|->:<score1>,<score2>,...<score14>"
 * Then base64url encoded.
 */
export function encodeProfileToHash(scores, archetypeResult) {
  const scoreStr = Object.keys(scores)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => Math.round(scores[k]))
    .join(',');

  const payload = `v1:${archetypeResult.primary}:${archetypeResult.secondary || '-'}:${scoreStr}`;

  // Base64url encode
  const encoded = btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encoded;
}

/**
 * Decode a hash string back into scores and archetype info.
 * Returns null if invalid.
 */
export function decodeProfileFromHash(hash) {
  try {
    // Base64url decode
    let b64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = atob(b64);

    const parts = payload.split(':');
    if (parts[0] !== 'v1' || parts.length !== 4) return null;

    const primary = parts[1];
    const secondary = parts[2] === '-' ? null : parts[2];
    const scoreValues = parts[3].split(',').map(Number);

    if (scoreValues.length !== 14 || scoreValues.some(isNaN)) return null;

    const scores = {};
    for (let i = 0; i < 14; i++) {
      scores[i + 1] = scoreValues[i];
    }

    return { scores, primary, secondary };
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL from current location + hash.
 */
export function buildShareUrl(scores, archetypeResult) {
  const hash = encodeProfileToHash(scores, archetypeResult);
  const base = window.location.origin + window.location.pathname;
  return `${base}#/shared/${hash}`;
}
