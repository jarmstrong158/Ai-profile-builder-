import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import QuizContainer from '../components/quiz/QuizContainer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getAssessmentHistory, saveAssessment } from '../lib/assessments.js';
import { supplementaryQuestions } from '../data/supplementary-questions.js';
import { calculateRawScores, normalizeScores, assignZones } from '../engine/scoring.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { determineVolatilityStatus, detectSpectrumSpikes } from '../engine/retake.js';
import { SPECTRUM_NAMES } from '../engine/team-composition.js';
import { completeScheduledRetake, autoScheduleNextRetake, getDueRetake } from '../lib/scheduled-retakes.js';

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

      if (!shouldSave && practiceMode) {
        // Practice mode — don't save, show results
        setPracticeComplete(true);
        setPhase('practice-done');
        return;
      }

      // If no scheduled retake and not first assessment, still check if auto-schedule is due
      if (!shouldSave && !isFirstAssessment) {
        // Unscheduled retake — show practice results
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

  // Practice complete — scores not saved
  if (phase === 'practice-done') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="w-full max-w-[440px] px-4 text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl"
              style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
            >
              &#9998;
            </div>
            <h1
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              Practice Complete
            </h1>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              This was a practice retake — your scores were <strong>not</strong> updated.
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Scores only update during scheduled retakes (set automatically or by your manager).
              Your next scheduled retake will appear on your dashboard when it's due.
            </p>
            <button
              onClick={() => navigate('/my-dashboard', { replace: true })}
              className="px-6 py-2.5 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
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
