import { useState } from 'react';
import { SPECTRUM_LABELS } from '../../data/weights.js';

const SPECTRUM_ACTIONS = {
  'Engagement Style': 'Support both collaborative and directive AI modes — let individuals choose how they engage.',
  'Interaction Pacing': 'Don\'t enforce response speed norms. Let rapid-fire users iterate while thorough users take their time.',
  'Detail Orientation': 'For shared AI outputs, assign a reviewer. For individual work, let people set their own quality-check habits.',
  'Motivation': 'Share both efficiency wins and interesting experiments — appeal to different reasons people use AI.',
  'Emotional Tone': 'Let individuals configure AI tone. Don\'t force a single "team voice" for personal AI interactions.',
  'Autonomy': 'Offer both "just do it" and "step-by-step" AI workflows. Let individuals choose their control level.',
  'Information Density': 'Use tiered output — summary first, expandable detail for depth-seekers.',
  'Structure': 'Provide prompt templates for structure-seekers, and open-ended tools for freeform users.',
  'Guardrails': 'Standardize guardrails for high-risk tasks, but let individuals control confirmations for routine work.',
  'Initiative': 'Make AI suggestions opt-in. Proactive users can enable "suggestion mode", others keep reactive mode.',
  'Explanation Depth': 'Let team members set their own explanation level — minimal, standard, or deep.',
  'Tech Comfort': 'Pair less comfortable users with power users. Create simple starter workflows alongside advanced options.',
  'Confidence': 'Create a safe space to experiment. Share small wins and avoid "AI expert" pressure.'
};

/**
 * Why each spectrum split matters for a team.
 */
const SPECTRUM_WHY = {
  'Engagement Style': 'When some team members want conversational, back-and-forth AI interaction and others prefer one-shot commands, shared AI workflows break down. One group feels the tool is too rigid, the other feels it wastes time.',
  'Interaction Pacing': 'Speed mismatches cause friction in shared work. Fast iterators may push half-baked AI output into team processes while methodical users hold things up trying to perfect prompts.',
  'Detail Orientation': 'If some people accept rough AI drafts and others reject anything imperfect, you\'ll get inconsistent quality in team deliverables and arguments about "good enough."',
  'Motivation': 'When efficiency-driven members clash with mastery-driven ones, AI adoption stalls — each group thinks the other is "using it wrong."',
  'Emotional Tone': 'Teams that force a single AI communication style alienate members who think differently. Some need warmth, others find it patronizing.',
  'Autonomy': 'Control preferences directly affect how people set up AI workflows. Micromanagers and autonomous workers need fundamentally different AI configurations.',
  'Information Density': 'When some want bullet points and others want full analysis, shared AI outputs satisfy nobody. One group complains about information overload, the other about missing context.',
  'Structure': 'Structured thinkers and freeform thinkers clash on prompt design, workflow setup, and how AI output should be organized.',
  'Guardrails': 'Teams without agreed guardrail standards either over-restrict (killing adoption) or under-restrict (creating risk). The split means neither camp is satisfied.',
  'Initiative': 'Some want AI to proactively suggest; others find unsolicited suggestions distracting. Shared tool configurations force one camp to compromise.',
  'Explanation Depth': 'When AI explanations are set to one level, half the team skips them (too long) and the other half misses critical context (too short).',
  'Tech Comfort': 'Comfort gaps create a two-tier team — power users race ahead while less comfortable users fall behind, widening the adoption gap over time.',
  'Confidence': 'Confidence splits mean some members experiment freely while others avoid AI altogether. The gap widens as confident users compound skills.'
};

/**
 * Best practices per spectrum — concrete action items managers can take.
 */
const SPECTRUM_PRACTICES = {
  'Engagement Style': [
    'Let individuals choose their AI interaction mode (chat vs. single-prompt)',
    'For team AI tasks, designate both a "quick draft" and "refined output" path',
    'Don\'t judge people by how they interact with AI — judge by output quality'
  ],
  'Interaction Pacing': [
    'Set expectations around output quality, not speed of AI interaction',
    'Allow rapid iterators to submit multiple drafts without judgment',
    'Give thorough users buffer time for AI-assisted tasks'
  ],
  'Detail Orientation': [
    'Define quality standards per deliverable type, not per person',
    'Assign detail-oriented members as reviewers for high-stakes AI output',
    'Let individuals set their own quality bar for personal/internal work'
  ],
  'Motivation': [
    'Celebrate both efficiency wins ("saved 2 hours") and learning wins ("discovered a new approach")',
    'Create space for experimentation alongside practical task completion',
    'Let people share AI wins in their own framing, don\'t force a single narrative'
  ],
  'Emotional Tone': [
    'Allow personal AI tone customization — don\'t enforce a team standard',
    'For customer-facing work, agree on tone guidelines separately from personal AI use',
    'Avoid labeling tone preferences as "right" or "wrong"'
  ],
  'Autonomy': [
    'Offer both guided workflows (with checkpoints) and open-ended AI access',
    'Let autonomous users skip confirmation steps for routine tasks',
    'Provide step-by-step guides for those who want more structure'
  ],
  'Information Density': [
    'Use "summary first, details on demand" for shared AI outputs',
    'Let individuals configure their own output verbosity in personal tools',
    'For team reports, provide both an executive summary and detailed appendix'
  ],
  'Structure': [
    'Create optional prompt templates — structured users will love them, freeform users can ignore them',
    'Don\'t mandate a single workflow format for AI tasks',
    'Let teams self-organize around their preferred structure level'
  ],
  'Guardrails': [
    'Standardize guardrails for high-risk tasks (client-facing, financial, legal)',
    'Allow individual control over guardrails for low-risk, personal tasks',
    'Document which tasks require review and which don\'t'
  ],
  'Initiative': [
    'Make proactive AI features opt-in by default',
    'Let power users enable suggestion mode, others keep manual control',
    'Don\'t assume everyone wants AI to "help" unprompted'
  ],
  'Explanation Depth': [
    'Set default explanation level to "standard" with easy toggle for more/less',
    'For training materials, provide depth options rather than one-size-fits-all',
    'Let team members configure their own AI explanation preferences'
  ],
  'Tech Comfort': [
    'Pair power users with beginners for informal mentoring',
    'Create beginner-friendly quick-start guides alongside advanced documentation',
    'Avoid assuming tech comfort level — some quiet users are more capable than they appear'
  ],
  'Confidence': [
    'Create a "safe to experiment" culture — celebrate attempts, not just successes',
    'Share small AI wins in team channels to build confidence collectively',
    'Don\'t create pressure around "everyone should be an AI expert"'
  ]
};

const MISSING_ACTIONS = {
  operator: 'Assign someone to champion speed and efficiency — time-box AI interactions and set "good enough" thresholds.',
  student: 'Encourage the team to ask AI "why" not just "what". Dedicated learning time compounds.',
  tinkerer: 'Designate someone to spend 30 min/week testing new AI features and sharing discoveries.',
  strategist: 'Require AI to cite sources for important decisions. Build a "trust but verify" habit.',
  collaborator: 'Encourage open-ended AI brainstorming sessions, not just task execution.',
  craftsman: 'Add a review step for AI-generated work that reaches clients or stakeholders.',
  explorer: 'Create a "cool AI finds" channel — exploration drives adoption.',
  navigator: 'Build beginner-friendly AI docs for future new hires.',
  architect: 'Create prompt templates for recurring tasks — clear specs get better results.'
};

const MISSING_WHY = {
  operator: 'Without an efficiency champion, the team may over-invest time in AI interactions without measurable gains. Someone needs to push for practical speed.',
  student: 'Without curious learners, AI adoption plateaus at surface-level use. The team misses deeper capabilities that compound over time.',
  tinkerer: 'Without someone testing new features, the team gets locked into one way of using AI and misses improvements.',
  strategist: 'Without strategic thinkers, the team may trust AI output too readily or fail to verify critical decisions.',
  collaborator: 'Without open-ended AI exploration, the team only uses AI for rote tasks and misses creative applications.',
  craftsman: 'Without quality-focused members, AI output goes out without adequate review, risking reputation and accuracy.',
  explorer: 'Without curiosity-driven members, the team won\'t discover new AI use cases and adoption stays narrow.',
  navigator: 'Without someone who naturally creates guides and documentation, knowledge stays siloed with power users.',
  architect: 'Without systematic prompt design, AI interactions remain inconsistent and quality varies wildly across the team.'
};

const MISSING_PRACTICES = {
  operator: ['Set time limits on AI tasks to encourage efficiency', 'Create "good enough" thresholds for common outputs', 'Track time-saved metrics to motivate practical use'],
  student: ['Allocate 30 min/week for AI learning experiments', 'Encourage "AI learnings" sharing in team meetings', 'Reward curiosity and exploration, not just output'],
  tinkerer: ['Assign someone to test one new AI feature per week', 'Create a channel for sharing AI experiments', 'Budget time for trying new approaches without pressure'],
  strategist: ['Require source verification for important AI-assisted decisions', 'Build a "trust but verify" checklist for AI output', 'Discuss AI reliability openly — where it\'s strong vs. weak'],
  collaborator: ['Schedule brainstorming sessions using AI as a creative partner', 'Encourage open-ended AI conversations, not just task execution', 'Share unexpected AI insights in team discussions'],
  craftsman: ['Add a human review step for all client-facing AI output', 'Create quality checklists for different output types', 'Pair output with manual review standards'],
  explorer: ['Create a "cool AI finds" Slack channel or thread', 'Celebrate when someone discovers a new use case', 'Allow exploration time without requiring immediate ROI'],
  navigator: ['Ask experienced users to document their workflows for others', 'Create simple getting-started guides for common tasks', 'Build a team AI knowledge base that grows over time'],
  architect: ['Create prompt templates for your team\'s 5 most common tasks', 'Document which prompt patterns work best for your domain', 'Standardize input formats for consistent AI output quality']
};

/**
 * Find team members on each side of a spectrum split.
 */
function findSpectrumExtremes(members, spectrumId) {
  const assessed = members.filter(m => m.normalizedScores?.[spectrumId] != null);
  if (assessed.length === 0) return { low: [], high: [] };

  const sorted = [...assessed].sort((a, b) => a.normalizedScores[spectrumId] - b.normalizedScores[spectrumId]);
  const labels = SPECTRUM_LABELS[spectrumId];

  // Low side: score <= 35, High side: score >= 65
  const low = sorted.filter(m => m.normalizedScores[spectrumId] <= 35).map(m => ({
    name: m.displayName,
    score: m.normalizedScores[spectrumId]
  }));
  const high = sorted.filter(m => m.normalizedScores[spectrumId] >= 65).map(m => ({
    name: m.displayName,
    score: m.normalizedScores[spectrumId]
  }));

  return {
    low,
    high,
    lowLabel: labels?.[0] || 'Low',
    highLabel: labels?.[1] || 'High'
  };
}

export default function CompositionPriorities({ archetypeDistribution, teamPatterns, members, spectrumDiversity }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!archetypeDistribution && !teamPatterns) return null;

  const actions = [];

  // Priority 1: Top polarized spectrum (biggest team disagreement)
  if (teamPatterns?.polarized?.length > 0) {
    const top = teamPatterns.polarized[0];
    const action = SPECTRUM_ACTIONS[top.name];
    if (action) {
      actions.push({
        type: 'spectrum',
        spectrumId: top.spectrum,
        spectrumName: top.name,
        label: `Resolve ${top.name} split`,
        detail: `Your team has an ${top.spread}pt spread — the biggest disagreement. ${action}`,
        color: '#ef4444',
        spread: top.spread
      });
    }
  }

  // Priority 2: Missing archetype with biggest impact
  if (archetypeDistribution?.missing?.length > 0) {
    const topMissing = archetypeDistribution.missing[0];
    const action = MISSING_ACTIONS[topMissing];
    if (action) {
      actions.push({
        type: 'archetype',
        archetypeKey: topMissing,
        label: `Fill the ${topMissing.charAt(0).toUpperCase() + topMissing.slice(1)} gap`,
        detail: action,
        color: '#eab308'
      });
    }
  }

  // Priority 3: Second polarized spectrum or dominant archetype issue
  if (teamPatterns?.polarized?.length > 1) {
    const second = teamPatterns.polarized[1];
    const action = SPECTRUM_ACTIONS[second.name];
    if (action) {
      actions.push({
        type: 'spectrum',
        spectrumId: second.spectrum,
        spectrumName: second.name,
        label: `Address ${second.name} differences`,
        detail: `${second.spread}pt spread across the team. ${action}`,
        color: '#ef4444',
        spread: second.spread
      });
    }
  } else if (archetypeDistribution?.dominant) {
    const d = archetypeDistribution.dominant;
    actions.push({
      type: 'dominant',
      label: `Balance around ${d.name}`,
      detail: `${d.percentage}% of your team shares this style. Optimize defaults for them, but accommodate minority styles to avoid alienating the rest.`,
      color: '#3b82f6'
    });
  }

  if (actions.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
        Top Priorities
      </p>
      <div className="flex flex-col gap-2">
        {actions.slice(0, 3).map((action, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <div key={i}>
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="flex gap-3 px-4 py-3 rounded-lg w-full text-left cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: isExpanded ? `1px solid ${action.color}40` : '1px solid transparent'
                }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: action.color + '20', color: action.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {action.label}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {action.detail}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 text-xs mt-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded breakdown */}
              {isExpanded && (
                <ExpandedBreakdown action={action} members={members} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpandedBreakdown({ action, members }) {
  if (action.type === 'spectrum') {
    return <SpectrumBreakdown action={action} members={members} />;
  }
  if (action.type === 'archetype') {
    return <ArchetypeBreakdown action={action} />;
  }
  return null;
}

function SpectrumBreakdown({ action, members }) {
  const extremes = members ? findSpectrumExtremes(members, action.spectrumId) : null;
  const why = SPECTRUM_WHY[action.spectrumName];
  const practices = SPECTRUM_PRACTICES[action.spectrumName];

  return (
    <div
      className="mx-4 mb-2 px-4 py-4 rounded-b-lg flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-surface)', borderTop: `1px solid ${action.color}20` }}
    >
      {/* Who's affected */}
      {extremes && (extremes.low.length > 0 || extremes.high.length > 0) && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: action.color }}>
            Who's Driving This Split
          </p>
          <div className="flex gap-4">
            {extremes.low.length > 0 && (
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {extremes.lowLabel} side
                </p>
                <div className="flex flex-wrap gap-1">
                  {extremes.low.map(m => (
                    <span
                      key={m.name}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: action.color + '15', color: 'var(--color-text-primary)' }}
                    >
                      {m.name} ({m.score})
                    </span>
                  ))}
                </div>
              </div>
            )}
            {extremes.high.length > 0 && (
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {extremes.highLabel} side
                </p>
                <div className="flex flex-wrap gap-1">
                  {extremes.high.map(m => (
                    <span
                      key={m.name}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: action.color + '15', color: 'var(--color-text-primary)' }}
                    >
                      {m.name} ({m.score})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Why it matters */}
      {why && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Why This Matters
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {why}
          </p>
        </div>
      )}

      {/* Best practices */}
      {practices && (
        <div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
            Best Practices
          </p>
          <ul className="flex flex-col gap-1">
            {practices.map((practice, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: action.color }}>•</span>
                {practice}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ArchetypeBreakdown({ action }) {
  const key = action.archetypeKey;
  const why = MISSING_WHY[key];
  const practices = MISSING_PRACTICES[key];

  return (
    <div
      className="mx-4 mb-2 px-4 py-4 rounded-b-lg flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-surface)', borderTop: `1px solid ${action.color}20` }}
    >
      {/* Why it matters */}
      {why && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Why This Matters
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {why}
          </p>
        </div>
      )}

      {/* Best practices */}
      {practices && (
        <div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
            Best Practices
          </p>
          <ul className="flex flex-col gap-1">
            {practices.map((practice, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: action.color }}>•</span>
                {practice}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
