import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import { decodeProfileFromHash } from '../engine/share.js';
import { assignZones } from '../engine/scoring.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { detectDeviations } from '../engine/deviation-detector.js';
import { archetypes } from '../data/archetypes.js';
import {
  zoneInstructions,
  gettingBetterResultsTips,
  blendingSentences,
  deviationTemplates
} from '../data/templates.js';

export default function SharedProfilePage() {
  const { hash } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (!hash) return null;

    const decoded = decodeProfileFromHash(hash);
    if (!decoded) return null;

    const { scores } = decoded;
    const zones = assignZones(scores);
    const archetypeResult = matchArchetypes(scores);
    const deviations = detectDeviations(scores, archetypeResult.primary, archetypeResult.secondary);

    // Build a minimal profile (no answers available, so no work context or direct instructions)
    const primary = archetypes[archetypeResult.primary];
    const aboutMeParts = [primary.summary];

    if (archetypeResult.secondary) {
      const key = `${archetypeResult.primary}+${archetypeResult.secondary}`;
      const bridge = blendingSentences[key];
      if (bridge) aboutMeParts.push(bridge);
    }

    for (const dev of deviations) {
      aboutMeParts.push(dev.sentence);
    }

    // Spectrum instructions only (no direct or friction — those need answers)
    const instructions = [];
    for (let i = 1; i <= 14; i++) {
      instructions.push(zoneInstructions[i][zones[i]]);
    }

    // Build markdown
    const mdLines = [
      '# AI Profile',
      '*Shared via AI Onboard*',
      '',
      '## About Me',
      '',
      ...aboutMeParts.map(p => p + '\n'),
      '## How to Work With Me',
      '',
      ...instructions.map(i => `- ${i}`),
      '',
      '## Getting Better Results',
      '',
      ...gettingBetterResultsTips.map(t => `- **${t.bold}** ${t.text}`)
    ];

    return {
      profile: {
        aboutMe: aboutMeParts,
        workContext: 'Work context is not available in shared profiles. Take the quiz to generate your full profile.',
        instructions,
        tips: gettingBetterResultsTips,
        customNotes: null,
        archetype: {
          primary: archetypeResult.primaryName,
          secondary: archetypeResult.secondaryName
        },
        markdown: mdLines.join('\n')
      },
      scores,
      zones,
      archetype: archetypeResult
    };
  }, [hash]);

  if (!data) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
              Invalid Profile Link
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              This shared profile link is invalid or corrupted.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Create Your Own Profile
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <ProfileView
          profile={data.profile}
          scores={data.scores}
          zones={data.zones}
          archetype={data.archetype}
          onRetake={() => navigate('/quiz')}
          isSharedView
        />
      </div>
    </Layout>
  );
}
