const ARCHETYPE_NAMES = {
  operator: 'The Operator',
  student: 'The Student',
  tinkerer: 'The Tinkerer',
  strategist: 'The Strategist',
  collaborator: 'The Collaborator',
  craftsman: 'The Craftsman',
  explorer: 'The Explorer',
  navigator: 'The Navigator',
  architect: 'The Architect'
};

const ARCHETYPE_TAGLINES = {
  operator: 'Direct, fast, results-first',
  student: 'Learns deeply, values understanding',
  tinkerer: 'Experiments fast, learns by doing',
  strategist: 'Analytical, data-driven decisions',
  collaborator: 'Thinks through dialogue, values partnership',
  craftsman: 'High standards, precision-focused',
  explorer: 'Curious, self-paced, pulls on threads',
  navigator: 'New to AI, wants orientation',
  architect: 'Precise vision, expects exact execution'
};

const MISSING_ARCHETYPE_IMPACTS = {
  operator: {
    gap: 'No one naturally pushes for speed and efficiency with AI.',
    suggestion: 'Encourage the team to time-box AI interactions. Set "good enough" thresholds to avoid over-polishing AI output.'
  },
  student: {
    gap: 'No one is naturally using AI as a deep learning tool.',
    suggestion: 'Share AI learning resources and encourage team members to ask AI "why" not just "what". Learning compounds.'
  },
  tinkerer: {
    gap: 'No one is naturally experimenting with new AI capabilities.',
    suggestion: 'Designate someone to spend 30 min/week testing new AI features and sharing what works. Innovation needs exploration.'
  },
  strategist: {
    gap: 'No one is naturally pushing AI for data-backed analysis and rigor.',
    suggestion: 'For important decisions, require AI to cite sources or show reasoning. Build a habit of asking "what data supports this?"'
  },
  collaborator: {
    gap: 'No one is naturally using AI as a thinking partner for brainstorming.',
    suggestion: 'Encourage open-ended AI conversations for ideation — not just task execution. The best AI insights come from dialogue.'
  },
  craftsman: {
    gap: 'No one naturally quality-checks AI output with high standards.',
    suggestion: 'Add a review step for AI-generated work that goes to clients or stakeholders. Assign someone to spot-check critical outputs.'
  },
  explorer: {
    gap: 'No one is naturally discovering new AI use cases through curiosity.',
    suggestion: 'Create a "cool AI finds" channel where anyone can share unexpected uses. Exploration drives adoption.'
  },
  navigator: {
    gap: 'Everyone is fairly comfortable with AI — no one is representing the "new user" perspective.',
    suggestion: 'When onboarding new team members, remember that your team\'s AI comfort level isn\'t the norm. Create beginner-friendly docs.'
  },
  architect: {
    gap: 'No one is naturally setting precise specifications for AI output.',
    suggestion: 'Build prompt templates for recurring tasks. Clear specs get better AI results — don\'t leave it to improvisation.'
  }
};

// Complementary archetype pairs with reasons to connect them
const PAIRING_RULES = [
  {
    a: 'operator', b: 'student',
    reason: 'Operator\'s speed + Student\'s depth = efficient learning. Pair for knowledge-sharing sessions where fast insights meet deep understanding.'
  },
  {
    a: 'tinkerer', b: 'strategist',
    reason: 'Tinkerer experiments, Strategist evaluates. Pair them to test new AI tools — one explores quickly, the other assesses what\'s actually useful.'
  },
  {
    a: 'collaborator', b: 'architect',
    reason: 'Collaborator ideates through dialogue, Architect turns ideas into precise specs. Great pair for planning AI-assisted projects.'
  },
  {
    a: 'explorer', b: 'craftsman',
    reason: 'Explorer discovers possibilities, Craftsman ensures quality. Pair for AI adoption — one finds new use cases, the other sets quality standards.'
  },
  {
    a: 'navigator', b: 'explorer',
    reason: 'Navigator needs orientation, Explorer loves showing what\'s possible. Natural AI mentoring pair.'
  },
  {
    a: 'navigator', b: 'student',
    reason: 'Both value learning, at different depths. Student can guide Navigator through AI fundamentals with patience and structure.'
  },
  {
    a: 'operator', b: 'collaborator',
    reason: 'Opposite engagement styles — Operator commands, Collaborator discusses. Cross-pollination helps both get more from AI.'
  },
  {
    a: 'tinkerer', b: 'craftsman',
    reason: 'Tinkerer moves fast and breaks things, Craftsman demands quality. Balance speed with standards on AI-generated deliverables.'
  },
  {
    a: 'strategist', b: 'collaborator',
    reason: 'Strategist brings analytical rigor, Collaborator brings brainstorming energy. Together they make better AI-assisted decisions.'
  }
];

function getPairingSuggestions(distribution) {
  const present = new Set(distribution.filter(a => a.count > 0).map(a => a.id));
  const suggestions = [];

  for (const rule of PAIRING_RULES) {
    if (present.has(rule.a) && present.has(rule.b)) {
      suggestions.push({
        archetypeA: ARCHETYPE_NAMES[rule.a],
        archetypeB: ARCHETYPE_NAMES[rule.b],
        reason: rule.reason
      });
    }
    if (suggestions.length >= 3) break;
  }

  return suggestions;
}

export default function TeamComposition({ archetypeDistribution, spectrumDiversity }) {
  if (!archetypeDistribution) return null;

  const { distribution, dominant, missing } = archetypeDistribution;
  const representedCount = distribution.filter(a => a.count > 0).length;
  const pairings = getPairingSuggestions(distribution);

  return (
    <div className="flex flex-col gap-6">
      {/* Section intro */}
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          How your team naturally interacts with AI. Each archetype represents a distinct working style
          — a balanced mix means the team can adapt to different situations.
        </p>
      </div>

      {/* Archetype Distribution */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Archetype Distribution — {representedCount} of 9 represented
        </p>
        <div className="flex flex-col gap-2">
          {distribution.filter(a => a.count > 0).map(arch => {
            const archId = arch.id;
            const tagline = ARCHETYPE_TAGLINES[archId] || '';
            return (
              <div key={archId}>
                <div className="flex items-center gap-3">
                  <div className="w-28 text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {arch.name}
                  </div>
                  <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${arch.percentage}%`,
                        backgroundColor: 'var(--color-accent)',
                        minWidth: arch.count > 0 ? '8px' : '0'
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {arch.count}
                  </div>
                </div>
                {tagline && (
                  <div className="ml-[7.5rem] text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                    {tagline}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div
        className="flex flex-col gap-3 px-4 py-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {dominant && (
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Dominant style: {dominant.name} ({dominant.percentage}%)
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {dominant.percentage >= 40
                ? 'A large portion of your team shares this style. AI tools and workflows should be optimized for this group, but don\'t neglect other styles.'
                : 'This is the most common style, but the team is fairly diverse. No single approach will fit everyone.'}
            </p>
          </div>
        )}

        {missing.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Missing perspective{missing.length > 1 ? 's' : ''}: {missing.map(id => ARCHETYPE_NAMES[id] || id).join(', ')}
            </p>
            {missing.map(id => {
              const impact = MISSING_ARCHETYPE_IMPACTS[id];
              if (!impact) return null;
              return (
                <div
                  key={id}
                  className="px-3 py-2 rounded"
                  style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)' }}
                >
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    No {ARCHETYPE_NAMES[id]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {impact.gap}
                  </p>
                  <p className="text-xs mt-1 pl-3" style={{ color: '#eab308', borderLeft: '2px solid #eab308' }}>
                    {impact.suggestion}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!dominant && missing.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Your team has a well-balanced mix of AI working styles. This is ideal for adapting to different tasks and tools.
          </p>
        )}
      </div>

      {/* Pairing Suggestions */}
      {pairings.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Suggested Pairings — complementary styles that work well together
          </p>
          <div className="flex flex-col gap-2">
            {pairings.map((pair, i) => (
              <div
                key={i}
                className="px-3 py-2.5 rounded"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {pair.archetypeA} + {pair.archetypeB}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {pair.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
