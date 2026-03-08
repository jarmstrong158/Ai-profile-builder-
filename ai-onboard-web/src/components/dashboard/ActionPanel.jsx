import { useState } from 'react';

const BAND_COLORS = {
  'thriving': '#22c55e',
  'on-track': '#3b82f6',
  'needs-attention': '#f59e0b',
  'at-risk': '#ef4444'
};

const STATUS_STYLES = {
  active: { bg: '#3b82f620', color: '#3b82f6', label: 'Active' },
  pending_review: { bg: '#f59e0b20', color: '#f59e0b', label: 'Ready for Review' },
  completed: { bg: '#22c55e20', color: '#22c55e', label: 'Completed' },
  dismissed: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)', label: 'Dismissed' }
};

export default function ActionPanel({ actions, members, onUpdateStatus, onScheduleTest, onDelete, updating }) {
  const [filter, setFilter] = useState('active'); // 'active', 'completed', 'all'

  if (!actions || actions.length === 0) {
    return null;
  }

  const filtered = filter === 'all'
    ? actions
    : filter === 'active'
      ? actions.filter(a => a.status === 'active' || a.status === 'pending_review')
      : actions.filter(a => a.status === filter);

  // Build member lookup
  const memberMap = {};
  for (const m of (members || [])) {
    memberMap[m.userId] = m;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {['active', 'completed', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--color-accent)' : 'var(--color-surface)',
              color: filter === f ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`
            }}
          >
            {f === 'active' ? `Active (${actions.filter(a => a.status === 'active' || a.status === 'pending_review').length})` :
             f === 'completed' ? `Done (${actions.filter(a => a.status === 'completed').length})` :
             `All (${actions.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          No {filter} actions.
        </p>
      ) : (
        filtered.map(action => {
          const target = memberMap[action.target_member_id];
          const partner = memberMap[action.partner_member_id];
          const status = STATUS_STYLES[action.status] || STATUS_STYLES.active;

          return (
            <div
              key={action.id}
              className="px-4 py-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                opacity: action.status === 'dismissed' ? 0.6 : 1
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* Type + Status badges */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: action.action_type === 'pairing' ? '#8b5cf620' : '#3b82f620',
                        color: action.action_type === 'pairing' ? '#8b5cf6' : '#3b82f6'
                      }}
                    >
                      {action.action_type === 'pairing' ? 'Pairing' :
                       action.action_type === 'task' ? 'Task' : 'Note'}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {action.title}
                  </p>

                  {/* Members involved */}
                  {action.action_type === 'pairing' && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {target && (
                        <span className="text-xs flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: BAND_COLORS[target.healthBand] || '#ef4444' }}
                          />
                          <span style={{ color: 'var(--color-text-secondary)' }}>{target.displayName}</span>
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>+</span>
                      {partner && (
                        <span className="text-xs flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: BAND_COLORS[partner.healthBand] || '#3b82f6' }}
                          />
                          <span style={{ color: 'var(--color-text-secondary)' }}>{partner.displayName}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Acknowledged badge */}
                  {action.acknowledged_at && action.status === 'active' && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#3b82f6' }}>
                      Acknowledged {new Date(action.acknowledged_at).toLocaleDateString()}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Created {new Date(action.created_at).toLocaleDateString()}
                    {action.completed_at && ` — Completed ${new Date(action.completed_at).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Action buttons */}
                {action.status === 'pending_review' && (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {onScheduleTest && target && (
                      <button
                        onClick={() => { onScheduleTest(target); onUpdateStatus(action.id, 'completed'); }}
                        disabled={updating}
                        className="px-2 py-1 rounded text-xs cursor-pointer"
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        Schedule Retake
                      </button>
                    )}
                    <button
                      onClick={() => onUpdateStatus(action.id, 'completed')}
                      disabled={updating}
                      className="px-2 py-1 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: '#22c55e20',
                        color: '#22c55e',
                        border: 'none'
                      }}
                    >
                      Complete
                    </button>
                  </div>
                )}
                {action.status === 'active' && (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => onUpdateStatus(action.id, 'completed')}
                      disabled={updating}
                      className="px-2 py-1 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: '#22c55e20',
                        color: '#22c55e',
                        border: 'none'
                      }}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => onUpdateStatus(action.id, 'dismissed')}
                      disabled={updating}
                      className="px-2 py-1 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text-secondary)',
                        border: 'none'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
