const FREQ_LABELS = {
  daily: 'Daily',
  several_weekly: 'Several/week',
  couple_times: 'Couple times',
  rarely: 'Rarely'
};

export default function AdoptionMetrics({ adoptionSummary }) {
  if (!adoptionSummary) return null;

  const { frequency, useCases, barriers, knowledgeSharing } = adoptionSummary;

  return (
    <div className="flex flex-col gap-6">
      {/* Frequency Distribution */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Usage Frequency
          </p>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
            {frequency.adoptionRate}% adoption
          </span>
        </div>
        <div className="flex gap-3">
          {Object.entries(FREQ_LABELS).map(([key, label]) => (
            <div key={key} className="flex-1 text-center px-2 py-2 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {frequency.distribution[key] || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Use Cases */}
      {useCases.useCases.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Top Use Cases (avg {useCases.avgBreadth} per person)
          </p>
          <div className="flex flex-col gap-1">
            {useCases.useCases.filter(uc => uc.count > 0).slice(0, 5).map(uc => (
              <div key={uc.value} className="flex items-center justify-between text-sm py-1">
                <span className="truncate mr-2" style={{ color: 'var(--color-text-primary)' }}>
                  {uc.text}
                </span>
                <span className="flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                  {uc.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Barrier */}
      {barriers.topBarrier && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Top Barrier
          </p>
          <div
            className="px-4 py-3 rounded text-sm"
            style={{ backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)' }}
          >
            <p style={{ color: 'var(--color-text-primary)' }}>{barriers.topBarrier.text}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Reported by {barriers.topBarrier.percentage}% of team
            </p>
          </div>
        </div>
      )}

      {/* Knowledge Sharing */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Knowledge Sharing — {knowledgeSharing.sharingRate}% active sharers
        </p>
        {knowledgeSharing.isolatedLearners > 0 && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {knowledgeSharing.isolatedLearners} member{knowledgeSharing.isolatedLearners > 1 ? 's are' : ' is'} learning solo
          </p>
        )}
      </div>
    </div>
  );
}
