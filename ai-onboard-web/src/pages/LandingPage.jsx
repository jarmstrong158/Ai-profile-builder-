import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero */}
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="max-w-[640px] text-center px-4">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            AI Onboard
          </h1>
          <p
            className="text-lg sm:text-xl leading-relaxed mb-10"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Build your AI profile in 15 minutes. Drop it into any conversation. The AI knows how to work with you from the first message.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-8 py-3 rounded text-base font-medium transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Start the Quiz &rarr;
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-[640px] mx-auto pb-24 px-4">
        <div className="flex flex-col gap-16">
          <InfoSection
            title="You answer. We score."
            body="33 questions about how you think, communicate, and work. No right answers — every option describes a capable person with a preference."
          />
          <InfoSection
            title="Your profile, generated."
            body="Your answers are scored across personality dimensions and matched against behavioral archetypes. The result is a plain-English document that tells the AI exactly how to work with you."
          />
          <InfoSection
            title="Paste and go."
            body="Copy your profile. Paste it at the start of any AI conversation. No more wasted messages calibrating. No more fighting against the AI's defaults."
          />
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/quiz')}
            className="px-8 py-3 rounded text-base font-medium transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Start the Quiz &rarr;
          </button>
        </div>

        <div className="mt-16 pt-8 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <h3
            className="text-xl font-semibold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            Managing a team?
          </h3>
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Create a team, invite members, and get a live dashboard with health scores, archetype distribution, and actionable recommendations.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded text-base font-medium transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
          >
            Sign In / Sign Up &rarr;
          </button>
        </div>

        <div className="mt-16 pt-8 text-center text-sm" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
          <p>Everything runs in your browser. No data is sent anywhere.</p>
        </div>
      </div>
    </Layout>
  );
}

function InfoSection({ title, body }) {
  return (
    <div>
      <h3
        className="text-xl font-semibold mb-3"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {body}
      </p>
    </div>
  );
}
