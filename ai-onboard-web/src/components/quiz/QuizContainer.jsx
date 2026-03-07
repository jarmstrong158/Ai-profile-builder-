import { useCallback } from 'react';
import { useQuiz } from '../../context/QuizContext.jsx';
import QuestionCard from './QuestionCard.jsx';
import ProgressBar from './ProgressBar.jsx';
import SectionOptIn from './SectionOptIn.jsx';
import CompletionLoader from './CompletionLoader.jsx';

export default function QuizContainer({ onComplete }) {
  const { state, dispatch, currentQuestion, currentSection, isFirstQuestion } = useQuiz();

  const handleSelect = useCallback((value) => {
    // Don't dispatch ANSWER yet for multi-select/text - just store locally
    // For single-select, the QuestionCard auto-advances which calls handleNext
    if (currentQuestion?.type === 'single') {
      dispatch({ type: 'ANSWER', questionId: currentQuestion.id, value });
    }
  }, [dispatch, currentQuestion]);

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'multi' || currentQuestion.type === 'text') {
      const value = state.answers[currentQuestion.id];
      // For multi-select, store current selection (or empty array)
      // For text, store current text (or empty string)
      dispatch({
        type: 'ANSWER',
        questionId: currentQuestion.id,
        value: value !== undefined ? value : (currentQuestion.type === 'multi' ? [] : '')
      });
    }
    // Single-select already dispatched in handleSelect
  }, [dispatch, currentQuestion, state.answers]);

  const handleMultiOrTextSelect = useCallback((value) => {
    // For multi-select and text, we need to store the value but not advance
    dispatch({ type: 'ANSWER', questionId: currentQuestion.id, value });
    // But we need to prevent auto-advance, so we store it differently
    // Actually, let's just update the answers directly without advancing
  }, [dispatch, currentQuestion]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, [dispatch]);

  const handleOptIn = useCallback(() => {
    dispatch({ type: 'OPT_IN_SECTION_7' });
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_SECTION_7' });
  }, [dispatch]);

  // Recovery prompt
  if (state.recovered) {
    return (
      <div className="w-full max-w-[600px] mx-auto text-center flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-2xl font-medium mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
          Welcome back.
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          You were on Question {state.currentQuestion + 1} of Section {state.currentSection + 1}. Continue where you left off?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'RESTORE' })}
            className="px-6 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Continue
          </button>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-6 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Completion
  if (state.isComplete) {
    return <CompletionLoader onComplete={() => onComplete(state.answers, state.section7Opted !== false)} />;
  }

  // Section 7 opt-in
  if (state.showSection7OptIn) {
    return (
      <div>
        <ProgressBar />
        <SectionOptIn onOptIn={handleOptIn} onSkip={handleSkip} />
      </div>
    );
  }

  if (!currentQuestion || !currentSection) return null;

  const isMultiOrText = currentQuestion.type === 'multi' || currentQuestion.type === 'text';

  return (
    <div>
      <ProgressBar />
      <QuestionCard
        question={currentQuestion}
        selectedValue={state.answers[currentQuestion.id]}
        onSelect={isMultiOrText ? (value) => {
          // Store without advancing
          state.answers[currentQuestion.id] = value;
        } : handleSelect}
        onNext={() => {
          if (isMultiOrText) {
            const value = state.answers[currentQuestion.id];
            dispatch({
              type: 'ANSWER',
              questionId: currentQuestion.id,
              value: value !== undefined ? value : (currentQuestion.type === 'multi' ? [] : '')
            });
          }
          // For single-select, answer was already dispatched
        }}
        onBack={handleBack}
        showBack={!isFirstQuestion}
        autoAdvance={currentQuestion.type === 'single'}
        sectionTitle={currentSection.title}
        questionNumber={state.currentQuestion + 1}
        totalInSection={currentSection.questions.length}
      />
    </div>
  );
}
