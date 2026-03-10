import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import SpectrumChart from '../components/profile/SpectrumChart.jsx';
import ProfileTimeline from '../components/profile/ProfileTimeline.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTeams } from '../lib/teams.js';
import { getMyLatestAssessment, getAssessmentHistory } from '../lib/assessments.js';
import { getMyActions, updateActionStatus, acknowledgeAction } from '../lib/actions.js';
import { getMyPendingRetakes } from '../lib/scheduled-retakes.js';
import { getNextRetakeDate, VOLATILITY_STATUS } from '../engine/retake.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { assignZones } from '../engine/scoring.js';
import { generateAIContext } from '../engine/ai-context.js';
import { SPECTRUM_NAMES } from '../data/weights.js';
import { archetypes } from '../data/archetypes.js';

const STATUS_LABELS = {
  new: 'New',
  volatile: 'Volatile',
  stabilizing: 'Stabilizing',
  stable: 'Stabilized'
};

const STATUS_COLORS = {
  new: '#3b82f6',
  volatile: '#ef4444',
  stabilizing: '#f59e0b',
  stable: '#22c55e'
};

export default function MyDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [teams, setTeams] = useState([]);
  const [actions, setActions] = useState([]);
  const [pendingRetakes, setPendingRetakes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiCopied, setAiCopied] = useState(false);
  const [actionBusy, setActionBusy] = useState(null); // actionId currently processing
  const [actionSuccess, setActionSuccess] = useState(null); // { id, type } for success feedback

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }

    Promise.all([
      getMyLatestAssessment(user.id).catch(() => null),
      getMyTeams(user.id).catch(() => []),
      getMyActions(user.id).catch(() => []),
      getMyPendingRetakes(user.id).catch(() => [])
    ]).then(([assess, myTeams, myActions, retakes]) => {
      setAssessment(assess);
      setTeams(myTeams);
      setActions(myActions.filter(a => a.status === 'active'));
      setPendingRetakes(retakes);

      // Also fetch history if we have an assessment
      if (assess?.team_id) {
        getAssessmentHistory(user.id, assess.team_id)
          .then(setHistory)
          .catch(() => {});
      }

      setLoading(false);
    });
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </Layout>
    );
  }

  // No assessment yet — direct to quiz
  if (!assessment) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-[400px]">
            <h1 className="text-xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
              No Assessment Yet
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Take the quiz to build your AI interaction profile and see your results here.
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="px-6 py-2.5 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Take the Quiz
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const scores = assessment.normalized_scores;
  const zones = assessment.zones || assignZones(scores);
  const archetypeResult = assessment.archetype_result || matchArchetypes(scores);
  const primaryArchetype = archetypes[archetypeResult.primary];
  const volatility = assessment.volatility_status || 'new';
  const assessmentDate = new Date(assessment.created_at);

  // Check retake status
  const hasDueRetake = pendingRetakes.some(r => new Date(r.scheduled_for) <= new Date());
  const hasUpcomingRetake = pendingRetakes.length > 0 && !hasDueRetake;
  const nextScheduled = pendingRetakes.length > 0 ? pendingRetakes[0] : null;

  // If no scheduled retake, compute the auto-recommendation
  const autoNextDate = getNextRetakeDate(volatility, assessment.created_at);
  const isAutoOverdue = !nextScheduled && autoNextDate && new Date(autoNextDate) <= new Date();

  const handleAcknowledge = async (actionId) => {
    setActionBusy(actionId);
    try {
      await acknowledgeAction(actionId);
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, acknowledged_at: new Date().toISOString() } : a));
      setActionSuccess({ id: actionId, type: 'acknowledged' });
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to acknowledge action:', err);
    }
    setActionBusy(null);
  };

  const handleSubmitForReview = async (actionId) => {
    setActionBusy(actionId);
    try {
      await updateActionStatus(actionId, 'pending_review');
      setActionSuccess({ id: actionId, type: 'submitted' });
      // Keep showing for a moment before removing
      setTimeout(() => {
        setActions(prev => prev.filter(a => a.id !== actionId));
        setActionSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit for review:', err);
    }
    setActionBusy(null);
  };

  const handleCopyAIContext = () => {
    const ctx = generateAIContext({
      displayName: user?.user_metadata?.display_name || 'User',
      normalizedScores: scores,
      archetypeResult
    });
    navigator.clipboard.writeText(ctx);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="py-8 w-full max-w-[720px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
            My Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Your AI interaction profile and team activity.
          </p>
        </div>

        {/* Welcome banner for first-time users */}
        {location.state?.firstAssessment && (
          <div
            className="mb-6 px-5 py-4 rounded-lg"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
              Profile Created
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Your AI interaction profile is ready. This is your personal dashboard — you'll see retake schedules, actions from your manager, and how your profile evolves over time.
            </p>
          </div>
        )}

        {/* Retake alert — due now */}
        {(hasDueRetake || isAutoOverdue) && (
          <div
            className="mb-6 px-5 py-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: hasDueRetake ? '#f59e0b15' : '#3b82f615',
              border: `1px solid ${hasDueRetake ? '#f59e0b30' : '#3b82f630'}`
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: hasDueRetake ? '#f59e0b' : '#3b82f6' }}>
                {hasDueRetake ? 'Retake Requested' : 'Retake Recommended'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {hasDueRetake
                  ? `Your manager has scheduled a retake for you.${nextScheduled?.schedule_type === 'manager' ? ' This was manually requested.' : ''}`
                  : 'Your profile is due for a refresh based on your assessment schedule.'
                }
              </p>
              <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-secondary)' }}>
                Retaking now will update your scores. Unscheduled retakes won't save — they're for practice only.
              </p>
            </div>
            <button
              onClick={() => navigate('/retake', { state: { teamId: assessment.team_id, scheduledRetakeId: nextScheduled?.id } })}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer flex-shrink-0 ml-4"
              style={{ backgroundColor: hasDueRetake ? '#f59e0b' : '#3b82f6', color: 'white' }}
            >
              Retake Now
            </button>
          </div>
        )}

        {/* Upcoming retake (not due yet) */}
        {hasUpcomingRetake && !hasDueRetake && (
          <div
            className="mb-6 px-5 py-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Next retake scheduled for{' '}
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {new Date(nextScheduled.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {nextScheduled.schedule_type === 'manager' && ' (requested by your manager)'}
            </p>
          </div>
        )}

        {/* Archetype + Status card */}
        <div
          className="mb-6 px-5 py-5 rounded-lg flex items-start justify-between"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-accent)' }}>
              Your Archetype
            </p>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {primaryArchetype?.name || archetypeResult.primaryName}
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {archetypeResult.primaryMatch ? `${(archetypeResult.primaryMatch * 100).toFixed(1)}% match` : ''}
              {archetypeResult.secondary && ` · Secondary: ${archetypes[archetypeResult.secondary]?.name || archetypeResult.secondaryName}`}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Assessed {assessmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Volatility badge */}
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: STATUS_COLORS[volatility] + '20', color: STATUS_COLORS[volatility] }}
            >
              {STATUS_LABELS[volatility]}
            </span>
          </div>
        </div>

        {/* Spectrum Chart */}
        <Section title="Your Spectrum">
          <SpectrumChart scores={scores} zones={zones} />
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => navigate('/profile')}
              className="text-xs cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--color-accent)' }}
            >
              View Full Profile →
            </button>
          </div>
        </Section>

        {/* Profile Timeline — only show with 2+ assessments */}
        {history.length >= 2 && (
          <Section title="Changes Over Time">
            <ProfileTimeline history={history} />
          </Section>
        )}

        {/* AI Context */}
        <Section title="AI Context">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Copy your personalized AI prompt
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Paste into ChatGPT, Claude, or any AI tool to get responses tailored to your style.
              </p>
            </div>
            <button
              onClick={handleCopyAIContext}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer flex-shrink-0 ml-4"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              {aiCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </Section>

        {/* Active Actions */}
        {actions.length > 0 && (
          <Section title="Your Actions">
            <div className="flex flex-col gap-3">
              {actions.map(action => (
                <div
                  key={action.id}
                  className="px-4 py-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}
                    >
                      {action.action_type === 'pairing' ? 'Pairing' : action.action_type}
                    </span>
                    {action.spectrum_focus && (
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Focus: {SPECTRUM_NAMES[action.spectrum_focus]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {action.title}
                  </p>
                  {/* Show the message addressed to this user */}
                  {action.target_member_id === user.id && action.message_to_target && (
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {action.message_to_target}
                    </p>
                  )}
                  {action.partner_member_id === user.id && action.message_to_partner && (
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {action.message_to_partner}
                    </p>
                  )}
                  {/* Success banner */}
                  {actionSuccess?.id === action.id && (
                    <div
                      className="mb-3 px-3 py-2 rounded text-xs font-medium"
                      style={{
                        backgroundColor: actionSuccess.type === 'submitted' ? '#22c55e20' : '#3b82f620',
                        color: actionSuccess.type === 'submitted' ? '#22c55e' : '#3b82f6'
                      }}
                    >
                      {actionSuccess.type === 'submitted'
                        ? 'Submitted for review — your manager will be notified.'
                        : 'Acknowledged — your manager can see you\'re working on this.'}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!action.acknowledged_at ? (
                      <button
                        onClick={() => handleAcknowledge(action.id)}
                        disabled={actionBusy === action.id}
                        className="text-xs px-3 py-1.5 rounded cursor-pointer transition-opacity"
                        style={{
                          backgroundColor: '#3b82f620',
                          color: '#3b82f6',
                          border: 'none',
                          opacity: actionBusy === action.id ? 0.5 : 1
                        }}
                      >
                        {actionBusy === action.id ? 'Sending...' : 'Acknowledge'}
                      </button>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded flex items-center gap-1" style={{ backgroundColor: '#3b82f610', color: '#3b82f6' }}>
                        &#10003; Acknowledged
                      </span>
                    )}
                    <button
                      onClick={() => handleSubmitForReview(action.id)}
                      disabled={actionBusy === action.id}
                      className="text-xs px-3 py-1.5 rounded cursor-pointer transition-opacity"
                      style={{
                        backgroundColor: '#22c55e20',
                        color: '#22c55e',
                        border: 'none',
                        opacity: actionBusy === action.id ? 0.5 : 1
                      }}
                    >
                      {actionBusy === action.id ? 'Submitting...' : 'Task Complete, Submit for Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Retake info */}
        <Section title="Assessment Schedule">
          <div
            className="px-4 py-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: STATUS_COLORS[volatility] }}
                >
                  {STATUS_LABELS[volatility]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Assessments taken</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {history.length || 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Current cadence</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {volatility === 'stable' ? 'Quarterly (90 days)' : 'Biweekly (14 days)'}
                </span>
              </div>
              {nextScheduled ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Next retake</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(nextScheduled.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Recommended next</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {autoNextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Practice retake note */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => navigate('/retake', { state: { teamId: assessment.team_id, practiceMode: true } })}
                className="text-xs cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--color-accent)' }}
              >
                Take a practice retake →
              </button>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Practice retakes let you see the quiz again without updating your scores.
                Your scores only update during scheduled retakes.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <div className="mb-4 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--color-accent)' }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
