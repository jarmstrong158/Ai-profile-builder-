import { useState } from 'react';
import PairingSuggestions from './PairingSuggestions.jsx';
import ActionPanel from './ActionPanel.jsx';
import { createAction, updateActionStatus } from '../../lib/actions.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CATEGORY_COLORS = {
  training: '#8b5cf6',
  support: '#3b82f6',
  tools: '#06b6d4',
  culture: '#22c55e',
  process: '#f59e0b'
};

const CATEGORY_LABELS = {
  training: 'Training',
  support: 'Support',
  tools: 'Tools',
  culture: 'Culture',
  process: 'Process'
};

const CATEGORY_NEXT_STEPS = {
  training: {
    label: 'How to act on this',
    steps: [
      'Schedule a 30-minute team session focused on this skill',
      'Share 2-3 example prompts or workflows that demonstrate the technique',
      'Follow up in 2 weeks to see if it\'s being applied'
    ]
  },
  support: {
    label: 'How to act on this',
    steps: [
      'Have a 1:1 conversation with affected team members this week',
      'Ask what specific frustrations or blockers they\'re experiencing',
      'Co-create a small action plan — don\'t just prescribe solutions'
    ]
  },
  tools: {
    label: 'How to act on this',
    steps: [
      'Identify 1-2 specific tools or configurations that address the gap',
      'Set them up for the affected team members (don\'t just recommend — install)',
      'Check in after 1 week to see if they\'re using them'
    ]
  },
  culture: {
    label: 'How to act on this',
    steps: [
      'Start small — introduce one ritual (e.g., weekly AI tip share) rather than a culture overhaul',
      'Lead by example: share your own AI wins and failures first',
      'Make participation low-effort and optional to build momentum naturally'
    ]
  },
  process: {
    label: 'How to act on this',
    steps: [
      'Draft a lightweight guideline (not a policy) and share with the team for feedback',
      'Start with a 2-week trial period to test the approach',
      'Adjust based on what the team actually does, not what they say they\'ll do'
    ]
  }
};

export default function Recommendations({ recommendations, teamHealth, members, pairingSuggestions, actions, teamId, onActionsChange, onScheduleTest }) {
  const { user } = useAuth();
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleAssignPairing = async (suggestion) => {
    if (!user || !teamId) return;
    setAssigning(true);
    try {
      await createAction({
        teamId,
        createdBy: user.id,
        actionType: 'pairing',
        targetMemberId: suggestion.targetMember.userId,
        partnerMemberId: suggestion.partnerMember.userId,
        title: suggestion.title,
        messageToTarget: suggestion.messageToTarget,
        messageToPartner: suggestion.messageToPartner,
        spectrumFocus: suggestion.focusSpectrum
      });
      if (onActionsChange) onActionsChange();
    } catch (err) {
      console.error('Failed to assign pairing:', err);
    }
    setAssigning(false);
  };

  const handleUpdateStatus = async (actionId, status) => {
    setUpdating(true);
    try {
      await updateActionStatus(actionId, status);
      if (onActionsChange) onActionsChange();
    } catch (err) {
      console.error('Failed to update action:', err);
    }
    setUpdating(false);
  };

  const hasActions = actions && actions.length > 0;
  const hasSuggestions = pairingSuggestions && pairingSuggestions.length > 0;
  const priorityRecs = (recommendations || []).filter(r => r.highlighted);
  const otherRecs = (recommendations || []).filter(r => !r.highlighted);

  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Actions are generated from your team's assessment data — barriers, health scores, adoption patterns, and interaction styles.
          Assign pairings to help team members learn from each other's strengths.
        </p>
      </div>

      {/* Active Actions */}
      {hasActions && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#8b5cf6' }}>
            Assigned Actions
          </p>
          <ActionPanel
            actions={actions}
            members={members}
            onUpdateStatus={handleUpdateStatus}
            onScheduleTest={onScheduleTest}
            updating={updating}
          />
        </div>
      )}

      {/* Suggested Pairings */}
      {hasSuggestions && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
            Suggested Pairings
          </p>
          <PairingSuggestions
            suggestions={pairingSuggestions}
            actions={actions}
            onAssign={handleAssignPairing}
            assigning={assigning}
          />
        </div>
      )}

      {/* Priority Actions */}
      {priorityRecs.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
            Priority Actions — start here
          </p>
          <div className="flex flex-col gap-3">
            {priorityRecs.map((rec, idx) => {
              const nextSteps = CATEGORY_NEXT_STEPS[rec.category];
              return (
                <div
                  key={idx}
                  className="px-4 py-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderLeft: '3px solid var(--color-accent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: (CATEGORY_COLORS[rec.category] || 'var(--color-accent)') + '20',
                        color: CATEGORY_COLORS[rec.category] || 'var(--color-accent)'
                      }}
                    >
                      {CATEGORY_LABELS[rec.category] || rec.category}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                      Priority
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {rec.title}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {rec.description}
                  </p>

                  {/* Next steps */}
                  {nextSteps && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                        {nextSteps.label}
                      </p>
                      <ol className="flex flex-col gap-1">
                        {nextSteps.steps.map((step, i) => (
                          <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="flex-shrink-0 font-medium" style={{ color: 'var(--color-accent)' }}>
                              {i + 1}.
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      {otherRecs.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Additional Recommendations
          </p>
          <div className="flex flex-col gap-2">
            {otherRecs.map((rec, idx) => (
              <div
                key={idx}
                className="px-4 py-3 rounded"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderLeft: '1px solid var(--color-border)'
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
                    {CATEGORY_LABELS[rec.category] || rec.category}
                  </span>
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
        </div>
      )}

      {/* Empty state */}
      {!hasActions && !hasSuggestions && priorityRecs.length === 0 && otherRecs.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No recommendations at this time. Keep monitoring as your team grows.
        </p>
      )}
    </div>
  );
}
