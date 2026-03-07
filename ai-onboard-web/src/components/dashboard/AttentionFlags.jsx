const SEVERITY_COLORS = {
  'high': '#ef4444',
  'medium': '#f59e0b',
  'low': '#3b82f6'
};

export default function AttentionFlags({ teamFlags, memberFlags, members }) {
  const allFlags = [];

  // Team-level flags first
  if (teamFlags) {
    for (const flag of teamFlags) {
      allFlags.push({ ...flag, scope: 'Team' });
    }
  }

  // Individual flags
  if (members && memberFlags) {
    for (let i = 0; i < members.length; i++) {
      const flags = memberFlags[i] || [];
      for (const flag of flags) {
        allFlags.push({ ...flag, scope: members[i].displayName });
      }
    }
  }

  if (allFlags.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No attention flags at this time.
      </p>
    );
  }

  // Sort: high severity first
  const sorted = allFlags.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((flag, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 px-4 py-3 rounded"
          style={{ backgroundColor: SEVERITY_COLORS[flag.severity] + '08' }}
        >
          <span
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: SEVERITY_COLORS[flag.severity] }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium" style={{ color: SEVERITY_COLORS[flag.severity] }}>
                {flag.severity.toUpperCase()}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {flag.scope}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {flag.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
