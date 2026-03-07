import { useQuiz } from '../../context/QuizContext.jsx';

export default function ProgressBar() {
  const { state, sections } = useQuiz();

  // Build section data for display
  const displaySections = sections.filter(s => {
    if (s.id === 7 && state.section7Opted === false) return false;
    if (s.id === 7 && state.section7Opted === null) return false;
    return true;
  });

  const currentDisplayIdx = displaySections.findIndex(s => s.id === sections[state.currentSection]?.id);

  return (
    <div className="w-full mb-8">
      <div className="flex gap-[2px] h-1">
        {displaySections.map((section, idx) => {
          const isCurrent = idx === currentDisplayIdx;
          const isCompleted = idx < currentDisplayIdx;
          const sectionQuestions = section.questions.length;

          // Calculate fill for current section
          let fillPercent = 0;
          if (isCompleted) {
            fillPercent = 100;
          } else if (isCurrent) {
            const answeredInSection = section.questions.filter(
              q => state.answers[q.id] !== undefined
            ).length;
            fillPercent = (answeredInSection / sectionQuestions) * 100;
          }

          return (
            <div
              key={section.id}
              className="flex-1 rounded-sm overflow-hidden"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <div
                className="h-full rounded-sm transition-all duration-300 ease-out"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: isCompleted
                    ? 'var(--color-accent-green)'
                    : 'var(--color-accent)'
                }}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
        Section {(currentDisplayIdx >= 0 ? currentDisplayIdx : 0) + 1} of {displaySections.length} · Question {state.currentQuestion + 1} of {sections[state.currentSection]?.questions.length || 0}
      </p>
    </div>
  );
}
