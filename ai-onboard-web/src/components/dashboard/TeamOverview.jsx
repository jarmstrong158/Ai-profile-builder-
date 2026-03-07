const BAND_COLORS = {
  'thriving': '#22c55e',
  'on-track': '#3b82f6',
  'needs-attention': '#f59e0b',
  'at-risk': '#ef4444'
};

const BAND_LABELS = {
  'thriving': 'Thriving',
  'on-track': 'On Track',
  'needs-attention': 'Needs Attention',
  'at-risk': 'At Risk'
};

export default function TeamOverview({ teamHealth }) {
  if (!teamHealth) return null;

  const { avgScore, band, distribution, completionRate } = teamHealth;

  return (
    <div className="flex flex-col gap-6">
      {/* Score + Band */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div
            className="text-4xl font-bold"
            style={{ color: BAND_COLORS[band], fontFamily: 'var(--font-heading)' }}
          >
            {avgScore}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Team Health
          </div>
        </div>
        <div>
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: BAND_COLORS[band] + '20', color: BAND_COLORS[band] }}
          >
            {BAND_LABELS[band]}
          </span>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {completionRate}% completion rate
          </p>
        </div>
      </div>

      {/* Distribution */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Member Distribution
        </p>
        <div className="flex gap-4">
          {Object.entries(BAND_LABELS).map(([key, label]) => {
            const distKey = key === 'on-track' ? 'onTrack' : key === 'needs-attention' ? 'needsAttention' : key === 'at-risk' ? 'atRisk' : key;
            const count = distribution[distKey] || 0;
            return (
              <div key={key} className="text-center">
                <div className="text-lg font-semibold" style={{ color: BAND_COLORS[key] }}>
                  {count}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
