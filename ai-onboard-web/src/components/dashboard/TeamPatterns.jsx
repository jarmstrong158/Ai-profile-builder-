export default function TeamPatterns({ teamPatterns }) {
  if (!teamPatterns) return null;

  const { polarized, clustered } = teamPatterns;

  if (polarized.length === 0 && clustered.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No notable team patterns detected yet. Patterns emerge with more team members.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Polarized */}
      {polarized.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Polarized Spectrums (high team disagreement)
          </p>
          <div className="flex flex-col gap-2">
            {polarized.map(p => (
              <div
                key={p.spectrum}
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{ backgroundColor: '#ef444410' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {p.name}
                </span>
                <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
                  {p.spread}pt spread
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Team members have very different preferences here. Consider flexible guidelines.
          </p>
        </div>
      )}

      {/* Clustered */}
      {clustered.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Clustered Spectrums (strong team agreement)
          </p>
          <div className="flex flex-col gap-2">
            {clustered.map(c => (
              <div
                key={c.spectrum}
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{ backgroundColor: '#22c55e10' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {c.name}
                </span>
                <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                  avg {c.avg} ({c.spread}pt spread)
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Team is aligned here. These are strengths to leverage.
          </p>
        </div>
      )}
    </div>
  );
}
