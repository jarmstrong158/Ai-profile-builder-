import { useState } from 'react';

/**
 * Each spectrum gets:
 * - polarized: what the disagreement means
 * - action: what the manager should do about it
 * - impact: why this matters for real team outcomes
 * - clustered: what agreement means
 */
const SPECTRUM_DATA = {
  'Information Density': {
    polarized: 'Some team members want dense, detailed AI output while others want brief, to-the-point answers.',
    action: 'Use tiered AI output formats — lead with a summary, then offer expandable detail for those who want depth.',
    impact: 'When people get the wrong density, they either waste time reading or miss critical details.',
    clustered: 'The team broadly agrees on how much detail they want from AI.'
  },
  'Explanation Depth': {
    polarized: 'Big gap between those who want deep explanations and those who just want the answer.',
    action: 'Let team members set their own "explanation level" preference in AI tools — minimal, standard, or deep.',
    impact: 'Over-explaining slows down experienced users; under-explaining leaves others confused.',
    clustered: 'Team is aligned on how much explanation they expect from AI.'
  },
  'Autonomy': {
    polarized: 'Some want AI to take the lead and run with tasks, others want to stay in full control.',
    action: 'Offer both autonomous AI workflows ("just do it") and step-by-step manual options. Let individuals choose.',
    impact: 'Forcing one mode causes either bottlenecks (too much oversight) or trust issues (too little).',
    clustered: 'Team agrees on how much independence to give AI.'
  },
  'Analytical Rigor': {
    polarized: 'Split between those who want data-backed reasoning and those who prefer quick intuitive answers.',
    action: 'For critical decisions, require AI to show sources and reasoning. For routine tasks, allow quick answers without citations.',
    impact: 'Inconsistent rigor creates quality gaps — some outputs get double-checked, others don\'t.',
    clustered: 'Team shares expectations for how rigorous AI analysis should be.'
  },
  'Emotional Tone': {
    polarized: 'Some prefer warm, conversational AI while others want purely professional and neutral.',
    action: 'Allow individual AI tone preferences. Avoid forcing a single "team voice" for personal AI use.',
    impact: 'Low friction — tone is personal preference. Only matters if the team shares AI-generated content externally.',
    clustered: 'Team has consistent expectations for AI tone and warmth.'
  },
  'Guardrails': {
    polarized: 'Disagreement on how much AI should double-check, confirm, and ask before acting.',
    action: 'Set team-wide guardrails for high-risk tasks (approvals, external comms) but let individuals control confirmation prompts for low-risk work.',
    impact: 'High friction — too few guardrails and mistakes go out; too many and people bypass the system entirely.',
    clustered: 'Team agrees on how cautious vs. autonomous AI should be.'
  },
  'Initiative': {
    polarized: 'Some want AI to proactively suggest ideas, others want it to only respond when asked.',
    action: 'Make AI suggestions opt-in. Let proactive users enable "suggestion mode" while others keep a reactive assistant.',
    impact: 'Unwanted suggestions annoy focused workers; lack of suggestions leaves others underserved.',
    clustered: 'Team agrees on how proactive AI should be.'
  },
  'Interaction Pacing': {
    polarized: 'Split between those who want fast, rapid-fire exchanges and those who prefer slower, thoughtful responses.',
    action: 'Don\'t standardize response expectations. Let rapid-fire users iterate quickly while thorough users take their time.',
    impact: 'Speed pressure frustrates careful thinkers; slow pacing frustrates iterators.',
    clustered: 'Team has similar expectations for conversation speed with AI.'
  },
  'Tech Comfort': {
    polarized: 'Wide range of technical comfort — some are power users, others are still getting oriented.',
    action: 'Pair less comfortable users with experienced ones for onboarding. Create simple "starter workflows" alongside advanced options.',
    impact: 'High friction — uncomfortable users avoid AI entirely, widening the skill gap over time.',
    clustered: 'Team has similar levels of technical comfort with AI tools.'
  },
  'Motivation': {
    polarized: 'Different reasons for using AI — some for efficiency, others for learning or exploration.',
    action: 'Acknowledge both motivations. Share efficiency wins for the productivity-focused, and interesting use cases for the curious.',
    impact: 'Moderate — different motivations are fine as long as both groups feel their approach is valued.',
    clustered: 'Team shares similar motivations for using AI.'
  },
  'Confidence': {
    polarized: 'Big gap in how confident team members feel using AI tools.',
    action: 'Create a safe environment for less confident users to experiment. Share small wins and avoid "AI expert" pressure.',
    impact: 'Confidence gaps become skill gaps. Less confident users fall further behind without support.',
    clustered: 'Team has similar confidence levels with AI.'
  },
  'Structure': {
    polarized: 'Some want highly structured AI interactions, others prefer freeform and flexible.',
    action: 'Provide templates and prompt libraries for structure-seekers, while leaving open-ended tools available for freeform users.',
    impact: 'Forcing structure kills creativity for freeform users; no structure leaves structured users lost.',
    clustered: 'Team agrees on how structured AI interactions should be.'
  },
  'Detail Orientation': {
    polarized: 'Split between those who scrutinize every AI output and those who skim and move fast.',
    action: 'For shared outputs, designate a reviewer. For individual work, let people set their own quality-check habits.',
    impact: 'High friction for shared work — skimmers pass along errors that detail-oriented reviewers catch too late.',
    clustered: 'Team handles AI output detail at a similar level.'
  },
  'Engagement Style': {
    polarized: 'Some treat AI as a collaborative partner, others treat it as a tool to execute commands.',
    action: 'Support both modes — let collaborative users have open-ended AI conversations, while directive users get command-style interfaces.',
    impact: 'Standardizing one mode alienates the other group — collaborators feel rushed, commanders feel slowed down.',
    clustered: 'Team has a consistent style of engaging with AI.'
  }
};

/**
 * Compound patterns — when 2-3 polarized spectrums overlap,
 * the combined friction is worse than each individually.
 * Each pattern requires ALL listed spectrums to be in the polarized set.
 */
const COMPOUND_PATTERNS = [
  {
    id: 'ai-divide',
    name: 'The AI Divide',
    spectrums: ['Tech Comfort', 'Confidence'],
    description: 'Your team has a wide gap in both technical comfort and confidence with AI. These two reinforce each other — power users race ahead while less confident members disengage, widening the gap over time.',
    risk: 'Left unaddressed, this creates a two-tier team where some people integrate AI deeply and others quietly stop using it altogether.',
    action: 'Create separate onboarding tracks — "AI Basics" and "AI Advanced." Pair experienced users with newer ones as buddies. Don\'t let the power users set the pace for the whole team.'
  },
  {
    id: 'control-clash',
    name: 'The Control Clash',
    spectrums: ['Autonomy', 'Guardrails', 'Initiative'],
    minMatch: 2,
    description: 'Your team fundamentally disagrees about how much freedom AI should have. Some want it autonomous, proactive, and unguarded. Others want it locked down, reactive, and confirming every step.',
    risk: 'This isn\'t just preference — it\'s a philosophical divide about trust in AI. The "let it run" group sees the cautious group as bottlenecks. The cautious group sees the autonomous group as reckless.',
    action: 'Separate AI policies by risk level. High-risk tasks (client-facing, financial) get guardrails everyone agrees on. Low-risk individual tasks get personal freedom. Make the boundary explicit.'
  },
  {
    id: 'communication-rift',
    name: 'The Communication Rift',
    spectrums: ['Information Density', 'Explanation Depth', 'Interaction Pacing'],
    minMatch: 2,
    description: 'Half the team wants dense, deeply explained, carefully paced AI output. The other half wants brief, answer-only, rapid-fire exchanges. This creates daily friction whenever AI-generated content is shared.',
    risk: 'The team can\'t agree on what "good AI output" looks like, which poisons collaborative AI use. Shared documents, reports, and prompts become battlegrounds.',
    action: 'Never force a single AI output format. For shared deliverables, use an "executive summary + appendix" structure — concise people read the top, thorough people read the full doc.'
  },
  {
    id: 'quality-gap',
    name: 'The Quality Gap',
    spectrums: ['Detail Orientation', 'Analytical Rigor', 'Structure'],
    minMatch: 2,
    description: 'Your team has no shared definition of "done" for AI-assisted work. Some produce meticulously structured, data-backed, reviewed outputs. Others produce quick, intuitive, loosely organized outputs.',
    risk: 'For anything that gets handed off or reviewed, this creates constant rework. The detail-oriented group rewrites everything. The fast group resents the "over-engineering."',
    action: 'Define shared quality standards only for outputs that leave the team (client work, cross-team reports). For internal work, let people work their own way. Create a lightweight checklist for shared AI outputs.'
  },
  {
    id: 'adoption-split',
    name: 'The Adoption Split',
    spectrums: ['Tech Comfort', 'Confidence', 'Motivation'],
    minMatch: 2,
    description: 'Team members are on completely different AI adoption trajectories. Comfortable, confident, efficiency-driven members integrate AI deeply. Others are still experimenting tentatively.',
    risk: 'Without intervention, these groups diverge further over time. The advanced group stops sharing tips. The exploring group stops asking questions because they feel behind.',
    action: 'Create two onboarding tracks. Share cross-track wins in team meetings — efficiency users share time-saving workflows, explorers share creative uses. Frame both as valuable, not leaders vs. laggards.'
  }
];

/**
 * Detect which compound patterns are active based on the polarized spectrums.
 */
function detectCompoundPatterns(polarized) {
  const polarizedNames = new Set(polarized.map(p => p.name));
  const active = [];

  for (const pattern of COMPOUND_PATTERNS) {
    const minMatch = pattern.minMatch || pattern.spectrums.length;
    const matched = pattern.spectrums.filter(s => polarizedNames.has(s));
    if (matched.length >= minMatch) {
      // Calculate average spread of the matched spectrums
      const matchedSpreads = polarized.filter(p => matched.includes(p.name));
      const avgSpread = Math.round(matchedSpreads.reduce((sum, p) => sum + p.spread, 0) / matchedSpreads.length);
      active.push({ ...pattern, matched, avgSpread });
    }
  }

  // Sort by average spread descending
  return active.sort((a, b) => b.avgSpread - a.avgSpread);
}

/**
 * Get a severity label + color for the spread value.
 */
function getSpreadSeverity(spread) {
  if (spread >= 70) return { label: 'High', color: '#ef4444' };
  if (spread >= 50) return { label: 'Moderate', color: '#f59e0b' };
  return { label: 'Low', color: '#22c55e' };
}

export default function TeamPatterns({ teamPatterns }) {
  const [showMonitor, setShowMonitor] = useState(false);
  const [monitorDetails, setMonitorDetails] = useState(false);

  if (!teamPatterns) return null;

  const { polarized, clustered } = teamPatterns;

  if (polarized.length === 0 && clustered.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        No notable team patterns detected yet. Patterns emerge with more team members.
      </p>
    );
  }

  // Split polarized into tiers: top 3 = address first, rest = monitor
  const addressFirst = polarized.slice(0, 3);
  const monitor = polarized.slice(3);
  const compoundPatterns = detectCompoundPatterns(polarized);

  return (
    <div className="flex flex-col gap-8">
      {/* Scale explanation */}
      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          How to read this
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>Spread</strong> measures how much your team disagrees on each AI preference, on a 0–100 scale. A 20pt spread means
          everyone is similar. An 80pt spread means some members are at one extreme and others are at the opposite.
          Focus on the top items first — those are the ones most likely causing friction today.
        </p>
      </div>

      {/* Compound Patterns — overlapping gaps */}
      {compoundPatterns.length > 0 && (
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#dc2626' }}>
              Overlapping Gaps — {compoundPatterns.length} pattern{compoundPatterns.length !== 1 ? 's' : ''} detected
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              These gaps are reinforcing each other and creating compounding friction. Address the underlying pattern, not just the individual spectrums.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {compoundPatterns.map(pattern => (
              <div
                key={pattern.id}
                className="px-4 py-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderLeft: '3px solid #dc2626'
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {pattern.name}
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#dc2626' }}>
                    ~{pattern.avgSpread}pt avg spread
                  </span>
                </div>

                {/* Which spectrums */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pattern.matched.map(name => (
                    <span
                      key={name}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
                    >
                      {name}
                    </span>
                  ))}
                </div>

                {/* What's happening */}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {pattern.description}
                </p>

                {/* Risk */}
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Risk: </span>
                  {pattern.risk}
                </p>

                {/* What to do */}
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-accent)' }}>
                    What to do
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {pattern.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address First — top 3 */}
      {addressFirst.length > 0 && (
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#ef4444' }}>
              Address First — {addressFirst.length} item{addressFirst.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Your widest team gaps. These are most likely to cause friction, miscommunication, or uneven AI adoption right now.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {addressFirst.map((p, idx) => {
              const info = SPECTRUM_DATA[p.name];
              const severity = getSpreadSeverity(p.spread);
              return (
                <div
                  key={p.spectrum}
                  className="px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderLeft: `3px solid ${severity.color}`
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: severity.color + '20', color: severity.color }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: severity.color }}>
                      {p.spread}pt spread
                    </span>
                  </div>

                  {/* What's happening */}
                  {info?.polarized && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {info.polarized}
                    </p>
                  )}

                  {/* Why it matters */}
                  {info?.impact && (
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Why it matters: </span>
                      {info.impact}
                    </p>
                  )}

                  {/* What to do */}
                  {info?.action && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-accent)' }}>
                        What to do
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {info.action}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monitor — remaining polarized */}
      {monitor.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#f59e0b' }}>
                Monitor — {monitor.length} item{monitor.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Notable differences but lower priority. Revisit these after the top items have stabilized.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {showMonitor && (
                <button
                  onClick={() => setMonitorDetails(!monitorDetails)}
                  className="text-xs px-3 py-1 rounded cursor-pointer"
                  style={{
                    color: 'var(--color-accent)',
                    backgroundColor: 'var(--color-accent)' + '15',
                    border: 'none'
                  }}
                >
                  {monitorDetails ? 'Less Detail' : 'More Detail'}
                </button>
              )}
              <button
                onClick={() => { setShowMonitor(!showMonitor); if (showMonitor) setMonitorDetails(false); }}
                className="text-xs px-3 py-1 rounded cursor-pointer"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent)' + '15',
                  border: 'none'
                }}
              >
                {showMonitor ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showMonitor && !monitorDetails && (
            <div className="flex flex-col gap-1.5">
              {monitor.map(p => {
                const info = SPECTRUM_DATA[p.name];
                const severity = getSpreadSeverity(p.spread);
                return (
                  <div
                    key={p.spectrum}
                    className="px-4 py-2.5 rounded"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </span>
                      <span className="text-xs font-medium" style={{ color: severity.color }}>
                        {p.spread}pt spread
                      </span>
                    </div>
                    {info?.polarized && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {info.polarized}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {showMonitor && monitorDetails && (
            <div className="flex flex-col gap-3">
              {monitor.map((p, idx) => {
                const info = SPECTRUM_DATA[p.name];
                const severity = getSpreadSeverity(p.spread);
                return (
                  <div
                    key={p.spectrum}
                    className="px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderLeft: `3px solid ${severity.color}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </span>
                      <span className="text-xs font-medium" style={{ color: severity.color }}>
                        {p.spread}pt spread
                      </span>
                    </div>
                    {info?.polarized && (
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {info.polarized}
                      </p>
                    )}
                    {info?.impact && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Why it matters: </span>
                        {info.impact}
                      </p>
                    )}
                    {info?.action && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-accent)' }}>
                          What to do
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                          {info.action}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Team Strengths — clustered */}
      {clustered.length > 0 && (
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#22c55e' }}>
              Team Strengths — {clustered.length} item{clustered.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Your team agrees here. Build on these — standardize AI tools and workflows around these shared preferences.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {clustered.map(c => {
              const explanation = SPECTRUM_DATA[c.name]?.clustered;
              return (
                <div
                  key={c.spectrum}
                  className="px-4 py-2.5 rounded"
                  style={{ backgroundColor: '#22c55e08' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {c.name}
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                      {c.spread}pt spread
                    </span>
                  </div>
                  {explanation && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
