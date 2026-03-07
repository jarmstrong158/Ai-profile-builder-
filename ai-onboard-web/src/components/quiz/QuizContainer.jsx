import { useCallback, useRef } from 'react';
import { useQuiz } from '../../context/QuizContext.jsx';
import QuestionCard from './QuestionCard.jsx';
import ProgressBar from './ProgressBar.jsx';
import SectionOptIn from './SectionOptIn.jsx';
import CompletionLoader from './CompletionLoader.jsx';

export default function QuizContainer({ onComplete }) {
  const { state, dispatch, currentQuestion, currentSection, isFirstQuestion } = useQuiz();
  const direction = useRef('forward');

  const handleSelect = useCallback((value) => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'single') {
      direction.current = 'forward';
      dispatch({ type: 'ANSWER', questionId: currentQuestion.id, value });
    } else {
      dispatch({ type: 'STAGE_ANSWER', questionId: currentQuestion.id, value });
    }
  }, [dispatch, currentQuestion]);

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;
    direction.current = 'forward';

    if (currentQuestion.type === 'multi' || currentQuestion.type === 'text') {
      const value = state.answers[currentQuestion.id];
      dispatch({
        type: 'ANSWER',
        questionId: currentQuestion.id,
        value: value !== undefined ? value : (currentQuestion.type === 'multi' ? [] : '')
      });
    }
  }, [dispatch, currentQuestion, state.answers]);

  const handleBack = useCallback(() => {
    direction.current = 'back';
    dispatch({ type: 'GO_BACK' });
  }, [dispatch]);

  const handleOptIn = useCallback(() => {
    direction.current = 'forward';
    dispatch({ type: 'OPT_IN_SECTION_7' });
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    direction.current = 'forward';
    dispatch({ type: 'SKIP_SECTION_7' });
  }, [dispatch]);

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

  if (state.isComplete) {
    return <CompletionLoader onComplete={() => onComplete(state.answers, state.section7Opted !== false)} />;
  }

  if (state.showSection7OptIn) {
    return (
      <div>
        <ProgressBar />
        <SectionOptIn onOptIn={handleOptIn} onSkip={handleSkip} />
      </div>
    );
  }

  if (!currentQuestion || !currentSection) return null;

  return (
    <div>
      <ProgressBar />
      <div
        key={currentQuestion.id}
        className="animate-slide-in"
        style={{ '--slide-direction': direction.current === 'forward' ? '1' : '-1' }}
      >
        <QuestionCard
          question={currentQuestion}
          selectedValue={state.answers[currentQuestion.id]}
          onSelect={handleSelect}
          onNext={handleNext}
          onBack={handleBack}
          showBack={!isFirstQuestion}
          autoAdvance={currentQuestion.type === 'single'}
          sectionTitle={currentSection.title}
          questionNumber={state.currentQuestion + 1}
          totalInSection={currentSection.questions.length}
        />
      </div>
    </div>
  );
}
