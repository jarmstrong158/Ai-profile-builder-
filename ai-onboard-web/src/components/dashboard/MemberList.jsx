const BAND_COLORS = {
  'thriving': '#22c55e',
  'on-track': '#3b82f6',
  'needs-attention': '#f59e0b',
  'at-risk': '#ef4444'
};

const SEVERITY_COLORS = {
  'high': '#ef4444',
  'medium': '#f59e0b',
  'low': '#3b82f6'
};

export default function MemberList({ members, memberFlags, onSelectMember }) {
  if (!members || members.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No team members yet. Share your invite link to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((member, idx) => {
        const flags = memberFlags[idx] || [];
        const highFlags = flags.filter(f => f.severity === 'high').length;

        return (
          <button
            key={member.userId}
            onClick={() => onSelectMember(member, flags)}
            className="flex items-center justify-between px-4 py-3 rounded text-left cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div className="flex items-center gap-3">
              {/* Health indicator dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: BAND_COLORS[member.healthBand] || BAND_COLORS['at-risk'] }}
              />
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {member.displayName}
                </span>
                {member.archetypeResult && (
                  <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {member.archetypeResult.primaryName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {highFlags > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: SEVERITY_COLORS.high + '20', color: SEVERITY_COLORS.high }}
                >
                  {highFlags} alert{highFlags > 1 ? 's' : ''}
                </span>
              )}
              {!member.hasCompletedAssessment && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Pending
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
