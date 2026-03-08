import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supplementaryQuestions } from '../data/supplementary-questions.js';
import { validateTeamAnswers } from '../engine/team-quiz.js';
import { saveAssessment } from '../lib/assessments.js';
import { autoScheduleNextRetake } from '../lib/scheduled-retakes.js';

export default function SupplementaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { coreAnswers, normalizedScores, zones, archetypeResult, teamId, profile } = location.state || {};

  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if missing required state
  if (!coreAnswers || !teamId) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Missing quiz data. Please take the quiz first.
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="mt-4 px-6 py-2 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Go to Quiz
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const question = supplementaryQuestions[currentIdx];
  const isLast = currentIdx === supplementaryQuestions.length - 1;
  const totalAnswered = Object.keys(answers).length;

  const handleSingleAnswer = (value) => {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);

    if (!isLast) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleMultiToggle = (value) => {
    const current = answers[question.id] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [question.id]: updated });
  };

  const handleNext = () => {
    if (isLast) {
      handleSave();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSave = async () => {
    // Validate
    const validation = validateTeamAnswers(coreAnswers, answers);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveAssessment({
        userId: user.id,
        teamId,
        coreAnswers,
        supplementaryAnswers: answers,
        normalizedScores,
        zones,
        archetypeResult
      });

      // Auto-schedule the first retake (14 days for new users)
      await autoScheduleNextRetake({
        teamId,
        userId: user.id,
        volatilityStatus: 'new',
        assessmentDate: new Date().toISOString()
      }).catch(() => {}); // Don't block on scheduling failure

      // Redirect to profile page with data so user can see their results
      navigate('/profile', {
        replace: true,
        state: {
          profile,
          scores: normalizedScores,
          zones,
          archetype: archetypeResult,
          answers: coreAnswers,
          savedToTeam: true
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to save assessment');
      setSaving(false);
    }
  };

  const currentAnswer = answers[question.id];
  const isMulti = question.type === 'multi';
  const canProceed = isMulti
    ? (currentAnswer && currentAnswer.length > 0)
    : currentAnswer !== undefined;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="w-full max-w-[560px] px-4">
          {/* Progress */}
          <div className="mb-6 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Team Questions — {currentIdx + 1} of {supplementaryQuestions.length}
            </p>
            <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  width: `${((currentIdx + 1) / supplementaryQuestions.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Question */}
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
            <div
              className="mb-4 px-4 py-3 rounded text-sm"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2 mb-6">
            {question.options.map(option => {
              const isSelected = isMulti
                ? (currentAnswer || []).includes(option.value)
                : currentAnswer === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => isMulti ? handleMultiToggle(option.value) : handleSingleAnswer(option.value)}
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

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded text-sm cursor-pointer"
              style={{
                color: currentIdx === 0 ? 'var(--color-border)' : 'var(--color-text-secondary)',
                cursor: currentIdx === 0 ? 'default' : 'pointer'
              }}
            >
              Back
            </button>

            {(isMulti || isLast) && (
              <button
                onClick={isLast ? handleSave : handleNext}
                disabled={!canProceed || saving}
                className="px-6 py-2 rounded text-sm font-medium cursor-pointer transition-opacity"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  opacity: (!canProceed || saving) ? 0.5 : 1,
                  cursor: (!canProceed || saving) ? 'default' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : isLast ? 'Save & View Profile' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
