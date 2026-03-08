import { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import { buildShareUrl } from '../engine/share.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTeams } from '../lib/teams.js';
import { getMyLatestAssessment, getAssessmentHistory } from '../lib/assessments.js';
import { getMyActions, updateActionStatus } from '../lib/actions.js';
import { getNextRetakeDate } from '../engine/retake.js';
import { generateProfileData } from '../engine/profile-generator.js';
import { detectDeviations } from '../engine/deviation-detector.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { assignZones } from '../engine/scoring.js';
import { SPECTRUM_NAMES } from '../engine/team-composition.js';
import { generateAIContext } from '../engine/ai-context.js';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // State from navigation (fresh quiz completion)
  const stateProfile = location.state?.profile;
  const stateScores = location.state?.scores;
  const stateZones = location.state?.zones;
  const stateArchetype = location.state?.archetype;
  const stateAnswers = location.state?.answers;
  const savedToTeam = location.state?.savedToTeam;

  // Loaded state (from Supabase)
  const [profile, setProfile] = useState(stateProfile || null);
  const [scores, setScores] = useState(stateScores || null);
  const [zones, setZones] = useState(stateZones || null);
  const [archetype, setArchetype] = useState(stateArchetype || null);
  const [answers, setAnswers] = useState(stateAnswers || null);
  const [teams, setTeams] = useState([]);
  const [myActions, setMyActions] = useState([]);
  const [retakeDue, setRetakeDue] = useState(null); // { teamId, date }
  const [loadingProfile, setLoadingProfile] = useState(!stateProfile);
  const [fromSaved, setFromSaved] = useState(savedToTeam || false);
  const [aiContextCopied, setAiContextCopied] = useState(false);

  // If no state passed, try loading from Supabase
  useEffect(() => {
    if (stateProfile) return; // Already have data from navigation
    if (authLoading) return;

    if (!user) {
      navigate('/quiz', { replace: true });
      return;
    }

    getMyLatestAssessment(user.id)
      .then(assessment => {
        if (!assessment) {
          navigate('/quiz', { replace: true });
          return;
        }

        const savedScores = assessment.normalized_scores;
        const savedZones = assessment.zones || assignZones(savedScores);
        const savedArchetype = assessment.archetype_result || matchArchetypes(savedScores);
        const deviations = detectDeviations(savedScores, savedArchetype.primary, savedArchetype.secondary);
        const profileData = generateProfileData(
          assessment.core_answers,
          savedScores,
          savedZones,
          savedArchetype,
          deviations
        );

        setProfile(profileData);
        setScores(savedScores);
        setZones(savedZones);
        setArchetype(savedArchetype);
        setAnswers(assessment.core_answers);
        setFromSaved(true);
        setLoadingProfile(false);

        // Check retake date
        if (assessment.team_id) {
          const nextDate = getNextRetakeDate(
            assessment.volatility_status || 'new',
            assessment.created_at
          );
          if (nextDate && new Date(nextDate) < new Date()) {
            setRetakeDue({ teamId: assessment.team_id, date: nextDate });
          }
        }
      })
      .catch(() => {
        navigate('/quiz', { replace: true });
      });
  }, [stateProfile, user, authLoading, navigate]);

  // Only warn about unsaved data if profile came from fresh quiz (not loaded from DB)
  useEffect(() => {
    if (fromSaved) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your profile hasn't been saved. Download or copy it before leaving.";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [fromSaved]);

  // Fetch user's teams and active actions if authenticated
  useEffect(() => {
    if (user) {
      getMyTeams(user.id).then(setTeams).catch(() => {});
      getMyActions(user.id).then(setMyActions).catch(() => {});
    }
  }, [user]);

  const handleRetake = () => {
    navigate('/quiz', { replace: true });
  };

  const handleShare = useCallback(() => {
    if (!scores || !archetype) return '';
    return buildShareUrl(scores, archetype);
  }, [scores, archetype]);

  const handleSaveToTeam = (teamId) => {
    navigate('/supplementary', {
      state: {
        coreAnswers: answers,
        normalizedScores: scores,
        zones,
        archetypeResult: archetype,
        teamId,
        profile
      }
    });
  };

  if (loadingProfile) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!profile) return null;

  return (
    <Layout>
      <div className="py-8">
        <ProfileView
          profile={profile}
          scores={scores}
          zones={zones}
          archetype={archetype}
          onRetake={handleRetake}
          onShare={handleShare}
        />

        {/* Copy AI Context */}
        {scores && archetype && (
          <div className="w-full max-w-[720px] mx-auto mt-6 px-4 sm:px-0">
            <div
              className="px-5 py-4 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  AI Context
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Paste into ChatGPT, Claude, or any AI tool to personalize your experience.
                </p>
              </div>
              <button
                onClick={() => {
                  const ctx = generateAIContext({
                    displayName: user?.user_metadata?.display_name || 'User',
                    normalizedScores: scores,
                    archetypeResult: archetype
                  });
                  navigator.clipboard.writeText(ctx);
                  setAiContextCopied(true);
                  setTimeout(() => setAiContextCopied(false), 2000);
                }}
                className="px-4 py-2 rounded text-sm font-medium cursor-pointer flex-shrink-0 ml-4"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                {aiContextCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Retake due prompt */}
        {retakeDue && (
          <div className="w-full max-w-[720px] mx-auto mt-6 px-4 sm:px-0">
            <div
              className="px-5 py-4 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#f59e0b' }}>
                  Retake recommended
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Your team assessment is due for a retake. Retake now to track your growth.
                </p>
              </div>
              <button
                onClick={() => navigate('/retake', { state: { teamId: retakeDue.teamId } })}
                className="px-4 py-2 rounded text-sm font-medium cursor-pointer flex-shrink-0 ml-4"
                style={{ backgroundColor: '#f59e0b', color: 'white' }}
              >
                Retake Now
              </button>
            </div>
          </div>
        )}

        {/* Saved confirmation */}
        {savedToTeam && (
          <div className="w-full max-w-[720px] mx-auto mt-6 px-4 sm:px-0">
            <div
              className="px-5 py-4 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}
            >
              Your profile has been saved to your team's dashboard. Your manager can now see your results.
            </div>
          </div>
        )}

        {/* Active Actions — shown to team members */}
        {user && myActions.length > 0 && (
          <div className="w-full max-w-[720px] mx-auto mt-8 px-4 sm:px-0">
            <div
              className="px-6 py-5 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid #8b5cf640' }}
            >
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: '#8b5cf6' }}
              >
                Your Current Actions
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Assigned by your manager based on your team assessment.
              </p>
              <div className="flex flex-col gap-3">
                {myActions.map(action => {
                  const isTarget = action.target_member_id === user.id;
                  const message = isTarget ? action.message_to_target : action.message_to_partner;
                  const spectrumName = action.spectrum_focus ? SPECTRUM_NAMES[action.spectrum_focus] : null;

                  return (
                    <div
                      key={action.id}
                      className="px-4 py-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}
                        >
                          {action.action_type === 'pairing' ? 'Pairing' : action.action_type === 'task' ? 'Task' : 'Note'}
                        </span>
                        {spectrumName && (
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            Focus: {spectrumName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {action.title}
                      </p>
                      {message && (
                        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {message}
                        </p>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await updateActionStatus(action.id, 'completed');
                            setMyActions(prev => prev.filter(a => a.id !== action.id));
                          } catch (err) {
                            console.error('Failed to complete action:', err);
                          }
                        }}
                        className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
                        style={{ backgroundColor: '#22c55e20', color: '#22c55e', border: 'none' }}
                      >
                        Mark Complete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Save to Team section — only if logged in, has teams, and hasn't already saved */}
        {user && teams.length > 0 && !fromSaved && (
          <div className="w-full max-w-[720px] mx-auto mt-8 px-4 sm:px-0">
            <div
              className="px-6 py-5 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Save to Team
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Share your profile with your team's dashboard. You'll answer a few extra questions about your AI usage.
              </p>
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleSaveToTeam(team.id)}
                    className="px-4 py-2 rounded text-sm font-medium cursor-pointer transition-opacity"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
