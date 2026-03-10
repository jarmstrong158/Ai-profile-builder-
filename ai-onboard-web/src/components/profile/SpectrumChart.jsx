import { SPECTRUM_NAMES, SPECTRUM_LABELS } from '../../data/weights.js';

export default function SpectrumChart({ scores, zones, previousScores }) {
  if (!scores) return null;

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(SPECTRUM_NAMES).map(id => {
        const specId = Number(id);
        const score = scores[specId];
        const [leftLabel, rightLabel] = SPECTRUM_LABELS[specId];
        const zone = zones[specId];
        const shift = previousScores ? Math.round(score - (previousScores[specId] || 50)) : 0;
        const showShift = previousScores && Math.abs(shift) >= 3;

        return (
          <div key={specId} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: score <= 50 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {leftLabel}
              </span>
              <span
                className="text-[10px] uppercase tracking-wider hidden sm:block"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {SPECTRUM_NAMES[specId]}
              </span>
              <span className="flex items-center gap-1.5">
                {showShift && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: shift > 0 ? '#22c55e' : '#ef4444' }}
                  >
                    {shift > 0 ? `\u2191 +${shift}` : `\u2193 ${shift}`}
                  </span>
                )}
                <span
                  className="text-xs font-medium"
                  style={{ color: score > 50 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {rightLabel}
                </span>
              </span>
            </div>
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              {/* Center marker */}
              <div
                className="absolute top-0 bottom-0 w-px z-10"
                style={{ left: '50%', backgroundColor: 'var(--color-text-secondary)', opacity: 0.3 }}
              />
              {/* Score indicator */}
              <div
                className="absolute top-0 bottom-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  left: score <= 50 ? `${score}%` : '50%',
                  width: score <= 50 ? `${50 - score}%` : `${score - 50}%`,
                  backgroundColor: getZoneColor(zone)
                }}
              />
              {/* Dot marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500 ease-out z-20"
                style={{
                  left: `${score}%`,
                  transform: `translate(-50%, -50%)`,
                  backgroundColor: getZoneColor(zone),
                  borderColor: 'var(--color-bg)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getZoneColor(zone) {
  switch (zone) {
    case 'strong-left': return 'var(--color-accent)';
    case 'lean-left': return 'var(--color-accent)';
    case 'neutral': return 'var(--color-text-secondary)';
    case 'lean-right': return 'var(--color-accent-green)';
    case 'strong-right': return 'var(--color-accent-green)';
    default: return 'var(--color-text-secondary)';
  }
}
