export default function TeamComposition({ archetypeDistribution, spectrumDiversity }) {
  if (!archetypeDistribution) return null;

  const { distribution, dominant, missing } = archetypeDistribution;

  return (
    <div className="flex flex-col gap-6">
      {/* Archetype Distribution */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Archetype Distribution
        </p>
        <div className="flex flex-col gap-2">
          {distribution.filter(a => a.count > 0).map(arch => (
            <div key={arch.id} className="flex items-center gap-3">
              <div className="w-24 text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                {arch.name}
              </div>
              <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${arch.percentage}%`,
                    backgroundColor: 'var(--color-accent)',
                    minWidth: arch.count > 0 ? '8px' : '0'
                  }}
                />
              </div>
              <div className="w-12 text-right text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {arch.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {(dominant || missing.length > 0) && (
        <div className="flex flex-col gap-2">
          {dominant && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Dominant archetype:
              </span>{' '}
              {dominant.name} ({dominant.percentage}% of team)
            </p>
          )}
          {missing.length > 0 && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Missing perspectives:
              </span>{' '}
              {missing.length} archetype{missing.length > 1 ? 's' : ''} not represented
            </p>
          )}
        </div>
      )}
    </div>
  );
}
