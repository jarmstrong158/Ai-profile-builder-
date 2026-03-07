import SpectrumChart from '../profile/SpectrumChart.jsx';

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

const SEVERITY_COLORS = {
  'high': '#ef4444',
  'medium': '#f59e0b',
  'low': '#3b82f6'
};

export default function MemberDetail({ member, flags, recommendations, onBack }) {
  if (!member) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm cursor-pointer mb-2"
            style={{ color: 'var(--color-accent)' }}
          >
            &larr; Back to team
          </button>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {member.displayName}
          </h3>
          {member.archetypeResult && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {member.archetypeResult.primaryName}
              {member.archetypeResult.secondaryName && ` + ${member.archetypeResult.secondaryName}`}
            </p>
          )}
        </div>

        {/* Health badge */}
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: BAND_COLORS[member.healthBand] }}>
            {member.healthScore}
          </div>
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: BAND_COLORS[member.healthBand] + '20', color: BAND_COLORS[member.healthBand] }}
          >
            {BAND_LABELS[member.healthBand]}
          </span>
        </div>
      </div>

      {/* Health Components */}
      {member.healthComponents && Object.keys(member.healthComponents).length > 0 && (
        <DashboardSection title="Health Components">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['adoption', 'Adoption'],
              ['success', 'Success Rate'],
              ['confidence', 'Confidence'],
              ['timeImpact', 'Time Impact']
            ].map(([key, label]) => (
              <div key={key} className="px-3 py-2 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {member.healthComponents[key] != null ? member.healthComponents[key] : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      {/* Spectrum Chart */}
      {member.normalizedScores && member.zones && (
        <DashboardSection title="Spectrum Profile">
          <SpectrumChart scores={member.normalizedScores} zones={member.zones} />
        </DashboardSection>
      )}

      {/* Flags */}
      {flags && flags.length > 0 && (
        <DashboardSection title="Attention Flags">
          <div className="flex flex-col gap-2">
            {flags.map((flag, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 px-3 py-2 rounded text-sm"
                style={{ backgroundColor: SEVERITY_COLORS[flag.severity] + '10' }}
              >
                <span
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: SEVERITY_COLORS[flag.severity] }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>{flag.message}</span>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <DashboardSection title="Recommendations">
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="px-4 py-3 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' + '20', color: 'var(--color-accent)' }}>
                    {rec.category}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {rec.title}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  );
}

function DashboardSection({ title, children }) {
  return (
    <div>
      <h4
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'var(--color-accent)' }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}
