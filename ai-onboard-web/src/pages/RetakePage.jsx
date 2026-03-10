import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import QuizContainer from '../components/quiz/QuizContainer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAssessmentHistory, getMyLatestAssessment, saveAssessment } from '../lib/assessments.js';
import { createAction } from '../lib/actions.js';
import { supplementaryQuestions } from '../data/supplementary-questions.js';
import { calculateRawScores, normalizeScores, assignZones } from '../engine/scoring.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { determineVolatilityStatus, detectSpectrumSpikes } from '../engine/retake.js';
import { SPECTRUM_NAMES } from '../engine/team-composition.js';
import { completeScheduledRetake, autoScheduleNextRetake, getDueRetake } from '../lib/scheduled-retakes.js';
import SpectrumChart from '../components/profile/SpectrumChart.jsx';

export default function RetakePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const teamId = location.state?.teamId;
  const practiceMode = location.state?.practiceMode || false;
  const scheduledRetakeId = location.state?.scheduledRetakeId || null;

  const [phase, setPhase] = useState('quiz'); // quiz | supplementary | saving
  const [coreAnswers, setCoreAnswers] = useState(null);
  const [normalizedScores, setNormalizedScores] = useState(null);
  const [zones, setZones] = useState(null);
  const [archetypeResult, setArchetypeResult] = useState(null);
  const [suppAnswers, setSuppAnswers] = useState({});
  const [suppIdx, setSuppIdx] = useState(0);
  const [error, setError] = useState('');
  const [willSave, setWillSave] = useState(!practiceMode); // determined after checking schedule
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [savedScores, setSavedScores] = useState(null);
  const [savedArchetype, setSavedArchetype] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestSending, setRequestSending] = useState(false);

  if (!teamId) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>Missing team context.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 rounded text-sm cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleQuizComplete = useCallback((answers, section7Answered) => {
    const rawScores = calculateRawScores(answers);
    const normalized = normalizeScores(rawScores, section7Answered);
    const z = assignZones(normalized);
    const arch = matchArchetypes(normalized);

    setCoreAnswers(answers);
    setNormalizedScores(normalized);
    setZones(z);
    setArchetypeResult(arch);
    setPhase('supplementary');
  }, []);

  const handleSuppAnswer = (value) => {
    const q = supplementaryQuestions[suppIdx];
    const updated = { ...suppAnswers, [q.id]: value };
    setSuppAnswers(updated);

    if (q.type !== 'multi' && suppIdx < supplementaryQuestions.length - 1) {
      setSuppIdx(suppIdx + 1);
    }
  };

  const handleSuppMultiToggle = (value) => {
    const q = supplementaryQuestions[suppIdx];
    const current = suppAnswers[q.id] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setSuppAnswers({ ...suppAnswers, [q.id]: updated });
  };

  const handleSave = async () => {
    setPhase('saving');
    setError('');

    try {
      // Get assessment history for volatility
      const history = await getAssessmentHistory(user.id, teamId);
      const isFirstAssessment = history.length === 0;

      // Determine if we should save:
      // - First assessment: ALWAYS save
      // - Has a scheduled retake that's due: save
      // - Practice mode with no schedule: don't save
      let shouldSave = isFirstAssessment;
      let retakeToComplete = scheduledRetakeId;

      if (!isFirstAssessment && !scheduledRetakeId) {
        // Check if there's a due retake we didn't get the ID for
        const dueRetake = await getDueRetake(user.id, teamId).catch(() => null);
        if (dueRetake) {
          shouldSave = true;
          retakeToComplete = dueRetake.id;
        }
      } else if (scheduledRetakeId) {
        shouldSave = true;
      }

      if (!shouldSave && (practiceMode || !isFirstAssessment)) {
        // Practice mode or unscheduled — don't save, show results with comparison
        const saved = await getMyLatestAssessment(user.id).catch(() => null);
        if (saved) {
          setSavedScores(saved.normalized_scores);
          setSavedArchetype(saved.archetype_result);
        }
        setPracticeComplete(true);
        setPhase('practice-done');
        return;
      }

      const volatilityStatus = determineVolatilityStatus(history, normalizedScores);

      await saveAssessment({
        userId: user.id,
        teamId,
        coreAnswers,
        supplementaryAnswers: suppAnswers,
        normalizedScores,
        zones,
        archetypeResult,
        volatilityStatus
      });

      // Mark the scheduled retake as completed
      if (retakeToComplete) {
        await completeScheduledRetake(retakeToComplete).catch(() => {});
      }

      // Auto-schedule the next retake
      await autoScheduleNextRetake({
        teamId,
        userId: user.id,
        volatilityStatus,
        assessmentDate: new Date().toISOString()
      }).catch(() => {});

      navigate('/my-dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save');
      setPhase('supplementary');
    }
  };

  // Quiz phase
  if (phase === 'quiz') {
    return (
      <QuizProvider>
        <Layout>
          <div className="min-h-[calc(100vh-48px)] flex items-center justify-center py-8">
            <QuizContainer onComplete={handleQuizComplete} />
          </div>
        </Layout>
      </QuizProvider>
    );
  }

  // Saving phase
  if (phase === 'saving') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>Saving your retake...</p>
        </div>
      </Layout>
    );
  }

  // Practice complete — show results with comparison
  if (phase === 'practice-done') {
    const archetypeChanged = savedArchetype && archetypeResult &&
      savedArchetype.primary !== archetypeResult.primary;
    const displayName = user?.user_metadata?.display_name || 'User';

    const handleRequestUpdate = async () => {
      setRequestSending(true);
      try {
        await createAction({
          teamId,
          createdBy: user.id,
          actionType: 'retake_request',
          targetMemberId: user.id,
          title: `${displayName} requests profile update`,
          data: { coreAnswers, supplementaryAnswers: suppAnswers, normalizedScores, zones, archetypeResult }
        });
        setRequestSent(true);
      } catch (err) {
        setError(err.message || 'Failed to send request');
      }
      setRequestSending(false);
    };

    return (
      <Layout>
        <div className="py-8 w-full max-w-[600px] mx-auto px-4">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            Practice Results
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            These scores are <strong>not saved</strong> yet. You can request your manager to approve updating your profile.
          </p>

          {/* Archetype result */}
          <div
            className="mb-6 px-5 py-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-accent)' }}>
              Your Archetype
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {archetypeResult.primaryName}
            </p>
            {archetypeResult.primaryMatch && (
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {(archetypeResult.primaryMatch * 100).toFixed(1)}% match
                {archetypeResult.secondaryName && ` \u00B7 Secondary: ${archetypeResult.secondaryName}`}
              </p>
            )}
          </div>

          {/* Archetype change callout */}
          {archetypeChanged && (
            <div
              className="mb-6 px-4 py-3 rounded-lg"
              style={{ backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30' }}
            >
              <p className="text-sm font-medium" style={{ color: '#f59e0b' }}>
                Archetype Changed
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {savedArchetype.primaryName} &rarr; {archetypeResult.primaryName}
              </p>
            </div>
          )}

          {/* Spectrum comparison */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
              Spectrum Comparison
            </h2>
            <SpectrumChart scores={normalizedScores} zones={zones} previousScores={savedScores} />
            {savedScores && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                Shift indicators show changes compared to your current saved profile.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded text-sm" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Request update + back */}
          <div className="flex flex-col gap-3">
            {requestSent ? (
              <div
                className="px-4 py-3 rounded-lg text-sm font-medium text-center"
                style={{ backgroundColor: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30' }}
              >
                Request sent to your manager. They'll review and approve or decline.
              </div>
            ) : (
              <button
                onClick={handleRequestUpdate}
                disabled={requestSending}
                className="w-full px-6 py-2.5 rounded text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  opacity: requestSending ? 0.6 : 1
                }}
              >
                {requestSending ? 'Sending...' : 'Request Profile Update'}
              </button>
            )}
            <button
              onClick={() => navigate('/my-dashboard', { replace: true })}
              className="w-full px-6 py-2.5 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Supplementary phase
  const question = supplementaryQuestions[suppIdx];
  const isMulti = question.type === 'multi';
  const isLast = suppIdx === supplementaryQuestions.length - 1;
  const currentAnswer = suppAnswers[question.id];
  const canProceed = isMulti
    ? (currentAnswer && currentAnswer.length > 0)
    : currentAnswer !== undefined;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="w-full max-w-[560px] px-4">
          <div className="mb-6 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Retake — Team Questions {suppIdx + 1} of {supplementaryQuestions.length}
            </p>
            <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  width: `${((suppIdx + 1) / supplementaryQuestions.length) * 100}%`
                }}
              />
            </div>
          </div>

          <h2
            className="text-lg font-medium mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            {question.text}
          </h2>

          {question.instruction && (
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {question.instruction}
            </p>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded text-sm" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-6">
            {question.options.map(option => {
              const isSelected = isMulti
                ? (currentAnswer || []).includes(option.value)
                : currentAnswer === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => isMulti ? handleSuppMultiToggle(option.value) : handleSuppAnswer(option.value)}
                  className="text-left px-4 py-3 rounded text-sm transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: isSelected ? 'white' : 'var(--color-text-primary)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`
                  }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => suppIdx > 0 && setSuppIdx(suppIdx - 1)}
              disabled={suppIdx === 0}
              className="px-4 py-2 rounded text-sm cursor-pointer"
              style={{
                color: suppIdx === 0 ? 'var(--color-border)' : 'var(--color-text-secondary)',
                cursor: suppIdx === 0 ? 'default' : 'pointer'
              }}
            >
              Back
            </button>

            {(isMulti || isLast) && (
              <button
                onClick={() => {
                  if (isLast) handleSave();
                  else setSuppIdx(suppIdx + 1);
                }}
                disabled={!canProceed}
                className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  opacity: canProceed ? 1 : 0.5,
                  cursor: canProceed ? 'pointer' : 'default'
                }}
              >
                {isLast ? 'Save Retake' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
