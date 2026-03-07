const CATEGORY_COLORS = {
  training: '#8b5cf6',
  support: '#3b82f6',
  tools: '#06b6d4',
  culture: '#22c55e',
  process: '#f59e0b'
};

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No recommendations at this time. Keep monitoring as your team grows.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className="px-4 py-3 rounded"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderLeft: rec.highlighted ? '3px solid var(--color-accent)' : '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: (CATEGORY_COLORS[rec.category] || 'var(--color-accent)') + '20',
                color: CATEGORY_COLORS[rec.category] || 'var(--color-accent)'
              }}
            >
              {rec.category}
            </span>
            {rec.highlighted && (
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                Priority
              </span>
            )}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {rec.title}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {rec.description}
          </p>
        </div>
      ))}
    </div>
  );
}
