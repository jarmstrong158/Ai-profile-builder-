import { useState } from 'react';
import { SPECTRUM_NAMES } from '../../engine/team-composition.js';

const BAND_COLORS = {
  'thriving': '#22c55e',
  'on-track': '#3b82f6',
  'needs-attention': '#f59e0b',
  'at-risk': '#ef4444'
};

/**
 * Check if a suggestion is already covered by an active action.
 * Matches on same pair of people (either direction) + same spectrum.
 */
function isAlreadyAssigned(suggestion, actions) {
  if (!actions || actions.length === 0) return false;
  return actions.filter(a => a.status === 'active').some(a => {
    const sameSpectrum = a.spectrum_focus === suggestion.focusSpectrum;
    const samePair =
      (a.target_member_id === suggestion.targetMember.userId && a.partner_member_id === suggestion.partnerMember.userId) ||
      (a.target_member_id === suggestion.partnerMember.userId && a.partner_member_id === suggestion.targetMember.userId);
    return sameSpectrum && samePair;
  });
}

export default function PairingSuggestions({ suggestions, actions, onAssign, assigning }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!suggestions || suggestions.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Not enough data to suggest pairings yet. Pairings require at least one member who needs support and one who can mentor.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {suggestions.map((s, idx) => {
        const isExpanded = expandedIdx === idx;
        const alreadyAssigned = isAlreadyAssigned(s, actions);

        return (
          <div
            key={idx}
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              opacity: alreadyAssigned ? 0.5 : 1,
              border: `1px solid ${s.isBarrierRelevant ? '#8b5cf6' : 'var(--color-border)'}`
            }}
          >
            {/* Header — clickable to expand */}
            <button
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer bg-transparent border-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Pairing visual */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BAND_COLORS[s.targetMember.healthBand] || '#ef4444' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>+</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BAND_COLORS[s.partnerMember.healthBand] || '#3b82f6' }}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {s.targetMember.displayName} + {s.partnerMember.displayName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    Focus: {s.focusSpectrumName}
                    {s.isBarrierRelevant && (
                      <span style={{ color: '#8b5cf6' }}> — barrier relevant</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Gap indicator */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: s.gapSize >= 40 ? '#ef444420' : '#f59e0b20',
                    color: s.gapSize >= 40 ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {Math.round(s.gapSize)}pt gap
                </span>

                <span
                  className="text-xs transition-transform"
                  style={{
                    color: 'var(--color-text-secondary)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  ▼
                </span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                {/* Spectrum comparison */}
                <div className="mt-3 mb-4">
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {SPECTRUM_NAMES[s.focusSpectrum]} Comparison
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: BAND_COLORS[s.targetMember.healthBand] }}>
                          {s.targetMember.displayName}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {Math.round(s.targetScore)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(s.targetScore)}%`,
                            backgroundColor: BAND_COLORS[s.targetMember.healthBand]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: BAND_COLORS[s.partnerMember.healthBand] }}>
                          {s.partnerMember.displayName}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {Math.round(s.partnerScore)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(s.partnerScore)}%`,
                            backgroundColor: BAND_COLORS[s.partnerMember.healthBand]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages preview */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="px-3 py-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      To {s.targetMember.displayName}:
                    </span>{' '}
                    {s.messageToTarget}
                  </div>
                  <div className="px-3 py-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      To {s.partnerMember.displayName}:
                    </span>{' '}
                    {s.messageToPartner}
                  </div>
                </div>

                {/* Assign button */}
                {alreadyAssigned ? (
                  <div
                    className="w-full py-2 rounded text-sm font-medium text-center"
                    style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}
                  >
                    Already Assigned
                  </div>
                ) : (
                  <button
                    onClick={() => onAssign(s)}
                    disabled={assigning}
                    className="w-full py-2 rounded text-sm font-medium cursor-pointer transition-opacity"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'white',
                      opacity: assigning ? 0.6 : 1
                    }}
                  >
                    {assigning ? 'Assigning...' : 'Assign This Pairing'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
