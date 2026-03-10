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

export default function MemberList({ members, memberFlags, onSelectMember, onScheduleTest, onScheduleAll, schedulingTest }) {
  if (!members || members.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No team members yet. Share your invite link to get started.
      </p>
    );
  }

  const eligibleCount = members.filter(m => m.hasCompletedAssessment).length;

  return (
    <div className="flex flex-col gap-2">
      {/* Bulk action bar */}
      {onScheduleAll && eligibleCount > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-lg mb-1"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {eligibleCount} member{eligibleCount !== 1 ? 's' : ''} eligible for retake
          </span>
          <button
            onClick={onScheduleAll}
            disabled={schedulingTest}
            className="text-xs px-3 py-1.5 rounded cursor-pointer font-medium"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              opacity: schedulingTest ? 0.5 : 1
            }}
          >
            {schedulingTest ? 'Scheduling...' : 'Schedule Test for All'}
          </button>
        </div>
      )}

      {members.map((member, idx) => {
        const flags = memberFlags[idx] || [];
        const highFlags = flags.filter(f => f.severity === 'high').length;

        return (
          <div
            key={member.userId}
            role="button"
            tabIndex={0}
            onClick={() => onSelectMember(member, flags)}
            onKeyDown={e => { if (e.key === 'Enter') onSelectMember(member, flags); }}
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
                style={{ backgroundColor: flags.some(f => f.type === 'untapped_potential') ? '#8b5cf6' : (BAND_COLORS[member.healthBand] || BAND_COLORS['at-risk']) }}
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
              {flags.some(f => f.type === 'untapped_potential') ? (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}
                >
                  Untapped
                </span>
              ) : highFlags > 0 ? (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: SEVERITY_COLORS.high + '20', color: SEVERITY_COLORS.high }}
                >
                  {highFlags} alert{highFlags > 1 ? 's' : ''}
                </span>
              ) : null}
              {!member.hasCompletedAssessment && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Pending
                </span>
              )}
              {member.hasCompletedAssessment && member.nextRetakeDate && new Date(member.nextRetakeDate) < new Date() && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: (new Date() - new Date(member.nextRetakeDate)) > 14 * 86400000 ? '#ef444420' : '#f59e0b20',
                    color: (new Date() - new Date(member.nextRetakeDate)) > 14 * 86400000 ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {(new Date() - new Date(member.nextRetakeDate)) > 14 * 86400000 ? 'Retake Overdue' : 'Retake Due'}
                </span>
              )}
              {member.volatilityStatus === 'stable' && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                >
                  Stabilized
                </span>
              )}
              {onScheduleTest && member.hasCompletedAssessment && (
                <button
                  onClick={(e) => { e.stopPropagation(); onScheduleTest(member); }}
                  disabled={schedulingTest}
                  className="text-xs px-2.5 py-1 rounded cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    opacity: schedulingTest ? 0.5 : 1
                  }}
                >
                  {schedulingTest ? '...' : 'Schedule Test'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
