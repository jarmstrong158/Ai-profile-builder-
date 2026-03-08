import { useState } from 'react';
import SpectrumChart from '../profile/SpectrumChart.jsx';
import { calculateSpectrumShifts } from '../../engine/retake.js';
import { SPECTRUM_NAMES } from '../../engine/team-composition.js';
import { generateAIContext } from '../../engine/ai-context.js';

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

/**
 * Human-readable explanations for each health component score.
 * Maps the supplementary answer values to what they actually mean.
 */
const COMPONENT_CONTEXT = {
  adoption: {
    label: 'Adoption',
    question: 'How often they use AI',
    weight: '25%',
    levels: {
      100: { text: 'Every day or almost every day', sentiment: 'strong' },
      70: { text: 'Several times a week', sentiment: 'good' },
      35: { text: 'A couple of times in two weeks', sentiment: 'low' },
      0: { text: 'Once or not at all', sentiment: 'critical' }
    }
  },
  success: {
    label: 'Success Rate',
    question: 'How often AI gives usable results',
    weight: '30%',
    levels: {
      100: { text: 'Almost always gets usable results', sentiment: 'strong' },
      75: { text: 'Usually useful with some tweaking', sentiment: 'good' },
      50: { text: 'Hit or miss — about half the time', sentiment: 'low' },
      20: { text: 'Rarely useful — usually does it themselves', sentiment: 'critical' }
    }
  },
  confidence: {
    label: 'Confidence',
    question: 'How they feel about using AI vs. 2 weeks ago',
    weight: '20%',
    levels: {
      100: { text: 'More confident — getting better at it', sentiment: 'strong' },
      0: { text: 'Less confident — hit some walls', sentiment: 'critical' }
    }
  },
  timeImpact: {
    label: 'Time Impact',
    question: 'Whether AI saves them time',
    weight: '25%',
    levels: {
      100: { text: 'Yes — noticeably sped things up', sentiment: 'strong' },
      65: { text: 'Somewhat — still a lot of time adjusting output', sentiment: 'good' },
      30: { text: 'Not really — about as long as doing it themselves', sentiment: 'low' },
      0: { text: 'Actually cost them time', sentiment: 'critical' }
    }
  }
};

/**
 * Maps S4 barrier values to human-readable descriptions.
 */
const BARRIER_TEXT = {
  1: { text: 'Not sure what to ask or how to phrase things', type: 'Skill gap' },
  2: { text: 'AI doesn\'t understand their specific work context', type: 'Context gap' },
  3: { text: 'Output quality isn\'t good enough for their standards', type: 'Quality gap' },
  4: { text: 'No time to learn how to use it properly', type: 'Time constraint' },
  5: { text: 'Doesn\'t trust the output enough to rely on it', type: 'Trust gap' },
  6: { text: 'Nothing major — working well for them', type: 'No barrier' },
  7: { text: 'Not really using AI yet', type: 'Not started' }
};

/**
 * Find the closest matching level for a component score.
 */
function getComponentLevel(component, score) {
  if (score == null) return null;
  const levels = COMPONENT_CONTEXT[component]?.levels;
  if (!levels) return null;

  const thresholds = Object.keys(levels).map(Number).sort((a, b) => b - a);
  for (const threshold of thresholds) {
    if (score >= threshold) return levels[threshold];
  }
  return levels[thresholds[thresholds.length - 1]];
}

/**
 * Generate a plain-English summary of why the health score is what it is.
 */
function buildHealthNarrative(member) {
  if (!member.healthComponents) return null;

  const { adoption, success, confidence, timeImpact } = member.healthComponents;
  const problems = [];
  const strengths = [];

  // Adoption
  if (adoption != null) {
    if (adoption <= 35) problems.push('rarely uses AI tools');
    else if (adoption >= 70) strengths.push('uses AI regularly');
  }

  // Success
  if (success != null) {
    if (success <= 50) problems.push('gets inconsistent or poor results');
    else if (success >= 75) strengths.push('gets reliably good results');
  }

  // Confidence
  if (confidence != null) {
    if (confidence === 0) problems.push('is losing confidence with AI');
    else if (confidence >= 100) strengths.push('is growing more confident');
  }

  // Time Impact
  if (timeImpact != null) {
    if (timeImpact <= 30) problems.push('isn\'t seeing time savings from AI');
    else if (timeImpact >= 65) strengths.push('is saving time with AI');
  }

  if (problems.length === 0 && strengths.length === 0) return null;

  const parts = [];
  if (problems.length > 0) {
    parts.push(`${member.displayName} ${problems.join(', ')}.`);
  }
  if (strengths.length > 0) {
    const connector = problems.length > 0 ? 'On the positive side, they ' : `${member.displayName} `;
    parts.push(`${connector}${strengths.join(' and ')}.`);
  }

  return parts.join(' ');
}

const SENTIMENT_COLORS = {
  strong: '#22c55e',
  good: '#3b82f6',
  low: '#f59e0b',
  critical: '#ef4444'
};

const PRIOR_EXP_TEXT = {
  1: 'Uses AI regularly outside work',
  2: 'Has some personal AI experience',
  3: 'New to AI'
};

export default function MemberDetail({ member, flags, recommendations, onBack, onScheduleTest, schedulingTest }) {
  if (!member) return null;

  const [aiContextCopied, setAiContextCopied] = useState(false);
  const narrative = buildHealthNarrative(member);
  const barrier = member.supplementaryAnswers?.S4;
  const barrierInfo = barrier != null ? BARRIER_TEXT[barrier] : null;
  const isUntappedPotential = flags?.some(f => f.type === 'untapped_potential');
  const priorExp = member.supplementaryAnswers?.S0;

  // Compute spectrum shifts if retake data exists
  const prevScores = member.latestAssessment && member.previousSupplementaryAnswers
    ? null // We need the previous normalized_scores, not supplementary
    : null;

  // Use spectrumSpikes from the enriched member for shift visualization
  const hasShifts = member.spectrumSpikes && member.spectrumSpikes.length > 0;
  const volatility = member.volatilityStatus;

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
          <div className="text-2xl font-bold" style={{ color: isUntappedPotential ? '#8b5cf6' : BAND_COLORS[member.healthBand] }}>
            {member.healthScore}
          </div>
          {isUntappedPotential ? (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}
            >
              Untapped Potential
            </span>
          ) : (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: BAND_COLORS[member.healthBand] + '20', color: BAND_COLORS[member.healthBand] }}
            >
              {BAND_LABELS[member.healthBand]}
            </span>
          )}
          {volatility && volatility !== 'new' && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: volatility === 'volatile' ? '#ef444420' : volatility === 'stabilizing' ? '#f59e0b20' : '#22c55e20',
                color: volatility === 'volatile' ? '#ef4444' : volatility === 'stabilizing' ? '#f59e0b' : '#22c55e'
              }}
            >
              {volatility === 'volatile' ? 'Volatile' : volatility === 'stabilizing' ? 'Stabilizing' : 'Stable'}
            </span>
          )}
        </div>
      </div>

      {/* Schedule Test button */}
      {onScheduleTest && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Schedule Retake
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Request {member.displayName} to retake the assessment. They'll be notified on their dashboard.
            </p>
          </div>
          <button
            onClick={() => onScheduleTest(member)}
            disabled={schedulingTest}
            className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer flex-shrink-0 ml-4"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              opacity: schedulingTest ? 0.6 : 1
            }}
          >
            {schedulingTest ? 'Scheduling...' : 'Schedule Test'}
          </button>
        </div>
      )}

      {/* Untapped Potential callout — shown instead of standard narrative when applicable */}
      {isUntappedPotential ? (
        <div
          className="px-4 py-3 rounded-lg text-sm leading-relaxed"
          style={{
            backgroundColor: '#8b5cf610',
            borderLeft: '3px solid #8b5cf6',
            color: 'var(--color-text-primary)'
          }}
        >
          <span className="font-medium" style={{ color: '#8b5cf6' }}>
            {PRIOR_EXP_TEXT[priorExp] || 'Has personal AI experience'}
          </span>
          {' — '}
          {priorExp === 1
            ? `${member.displayName} already knows how to use AI but hasn't fully applied it at work yet. They don't need basic training — they need help bridging personal skills to work tasks.`
            : `${member.displayName} has some personal AI experience that isn't showing up in their work usage yet. With the right support, they could ramp up quickly.`
          }
        </div>
      ) : narrative ? (
        <div
          className="px-4 py-3 rounded-lg text-sm leading-relaxed"
          style={{
            backgroundColor: BAND_COLORS[member.healthBand] + '10',
            borderLeft: `3px solid ${BAND_COLORS[member.healthBand]}`,
            color: 'var(--color-text-primary)'
          }}
        >
          {narrative}
        </div>
      ) : null}

      {/* Reported Barrier */}
      {barrierInfo && barrierInfo.type !== 'No barrier' && (
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
            Their Biggest Barrier
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {barrierInfo.text}
          </p>
          <span
            className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--color-accent)' + '15', color: 'var(--color-accent)' }}
          >
            {barrierInfo.type}
          </span>
        </div>
      )}

      {/* Health Components — with context */}
      {member.healthComponents && Object.keys(member.healthComponents).length > 0 && (
        <DashboardSection title="Health Components">
          <div className="flex flex-col gap-2">
            {['adoption', 'success', 'confidence', 'timeImpact'].map(key => {
              const score = member.healthComponents[key];
              const ctx = COMPONENT_CONTEXT[key];
              const level = getComponentLevel(key, score);

              return (
                <div key={key} className="px-4 py-3 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {ctx.label}
                      </span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {ctx.weight} of score
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: level ? SENTIMENT_COLORS[level.sentiment] : 'var(--color-text-secondary)' }}
                    >
                      {score != null ? score : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {ctx.question}
                  </p>
                  {level ? (
                    <p
                      className="text-xs mt-1 font-medium"
                      style={{ color: SENTIMENT_COLORS[level.sentiment] }}
                    >
                      {level.text}
                    </p>
                  ) : score == null ? (
                    <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-secondary)' }}>
                      Not enough data — excluded from score calculation
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </DashboardSection>
      )}

      {/* Spectrum Chart */}
      {member.normalizedScores && member.zones && (
        <DashboardSection title="Spectrum Profile">
          <SpectrumChart scores={member.normalizedScores} zones={member.zones} />

          {/* Spectrum Spikes (shift indicators from retake) */}
          {hasShifts && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Recent Shifts (since last assessment)
              </p>
              <div className="flex flex-wrap gap-2">
                {member.spectrumSpikes.map((spike, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded flex items-center gap-1"
                    style={{
                      backgroundColor: spike.direction === 'increased' ? '#22c55e15' : '#ef444415',
                      color: spike.direction === 'increased' ? '#22c55e' : '#ef4444'
                    }}
                  >
                    <span>{spike.direction === 'increased' ? '↑' : '↓'}</span>
                    <span>{spike.spectrumName}</span>
                    <span className="font-medium">{spike.shift > 0 ? '+' : ''}{spike.shift}pt</span>
                  </span>
                ))}
              </div>
            </div>
          )}
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

      {/* Copy AI Context */}
      {member.normalizedScores && member.archetypeResult && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              AI Context
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Copy {member.displayName}'s profile for pasting into any AI tool.
            </p>
          </div>
          <button
            onClick={() => {
              const ctx = generateAIContext({
                displayName: member.displayName,
                normalizedScores: member.normalizedScores,
                archetypeResult: member.archetypeResult
              });
              navigator.clipboard.writeText(ctx);
              setAiContextCopied(true);
              setTimeout(() => setAiContextCopied(false), 2000);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer flex-shrink-0 ml-4"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white', border: 'none' }}
          >
            {aiContextCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
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
