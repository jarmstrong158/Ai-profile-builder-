import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { sections, SECTION_7_INDEX } from '../data/questions.js';

const QuizContext = createContext(null);

const STORAGE_KEY = 'ai-onboard-quiz-state';

function getInitialState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.answers && !parsed.isComplete) {
        return { ...parsed, recovered: true };
      }
    }
  } catch {}
  return createFreshState();
}

function createFreshState() {
  return {
    currentSection: 0,
    currentQuestion: 0,
    answers: {},
    section7Opted: null,
    startTime: Date.now(),
    isComplete: false,
    recovered: false
  };
}

function getQuestionAt(sectionIdx, questionIdx) {
  if (sectionIdx < 0 || sectionIdx >= sections.length) return null;
  const section = sections[sectionIdx];
  if (questionIdx < 0 || questionIdx >= section.questions.length) return null;
  return section.questions[questionIdx];
}

function advancePosition(state) {
  const section = sections[state.currentSection];
  const nextQ = state.currentQuestion + 1;

  if (nextQ < section.questions.length) {
    return { currentSection: state.currentSection, currentQuestion: nextQ };
  }

  // Move to next section
  let nextSection = state.currentSection + 1;

  // Check if we're about to enter Section 7 (optional)
  if (nextSection === SECTION_7_INDEX && state.section7Opted === null) {
    return { currentSection: state.currentSection, currentQuestion: state.currentQuestion, showSection7OptIn: true };
  }

  // Skip Section 7 if opted out
  if (nextSection === SECTION_7_INDEX && state.section7Opted === false) {
    nextSection = SECTION_7_INDEX + 1;
  }

  if (nextSection >= sections.length) {
    return { isComplete: true };
  }

  return { currentSection: nextSection, currentQuestion: 0 };
}

function goBackPosition(state) {
  if (state.currentQuestion > 0) {
    return { currentSection: state.currentSection, currentQuestion: state.currentQuestion - 1 };
  }

  // Go to previous section
  let prevSection = state.currentSection - 1;

  // Skip Section 7 if opted out
  if (prevSection === SECTION_7_INDEX && state.section7Opted === false) {
    prevSection = SECTION_7_INDEX - 1;
  }

  if (prevSection < 0) return null;

  const prevSectionData = sections[prevSection];
  return { currentSection: prevSection, currentQuestion: prevSectionData.questions.length - 1 };
}

function quizReducer(state, action) {
  switch (action.type) {
    case 'ANSWER': {
      const newAnswers = { ...state.answers, [action.questionId]: action.value };
      const next = advancePosition({ ...state, answers: newAnswers });

      if (next.isComplete) {
        return { ...state, answers: newAnswers, isComplete: true };
      }
      if (next.showSection7OptIn) {
        return { ...state, answers: newAnswers, showSection7OptIn: true };
      }
      return {
        ...state,
        answers: newAnswers,
        currentSection: next.currentSection,
        currentQuestion: next.currentQuestion,
        showSection7OptIn: false
      };
    }

    case 'GO_BACK': {
      const prev = goBackPosition(state);
      if (!prev) return state;
      return {
        ...state,
        currentSection: prev.currentSection,
        currentQuestion: prev.currentQuestion,
        showSection7OptIn: false
      };
    }

    case 'OPT_IN_SECTION_7':
      return {
        ...state,
        section7Opted: true,
        currentSection: SECTION_7_INDEX,
        currentQuestion: 0,
        showSection7OptIn: false
      };

    case 'SKIP_SECTION_7': {
      const nextSection = SECTION_7_INDEX + 1;
      return {
        ...state,
        section7Opted: false,
        currentSection: nextSection < sections.length ? nextSection : state.currentSection,
        currentQuestion: 0,
        showSection7OptIn: false
      };
    }

    case 'COMPLETE':
      return { ...state, isComplete: true };

    case 'RESET':
      return createFreshState();

    case 'DISMISS_RECOVERY':
      return { ...state, recovered: false };

    case 'RESTORE':
      return { ...state, recovered: false };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, null, getInitialState);

  // Save state to sessionStorage on every change
  useEffect(() => {
    if (!state.isComplete) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentSection: state.currentSection,
          currentQuestion: state.currentQuestion,
          answers: state.answers,
          section7Opted: state.section7Opted,
          startTime: state.startTime,
          isComplete: state.isComplete
        }));
      } catch {}
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const currentQuestion = getQuestionAt(state.currentSection, state.currentQuestion);
  const currentSection = sections[state.currentSection];

  // Calculate progress
  const totalAnswered = Object.keys(state.answers).length;
  let totalQuestions = 0;
  for (const s of sections) {
    if (s.id === 7 && state.section7Opted === false) continue;
    if (s.id === 7 && state.section7Opted === null) continue;
    totalQuestions += s.questions.length;
  }
  // If section 7 hasn't been decided yet, count without it
  if (state.section7Opted === null) {
    totalQuestions = sections.reduce((t, s) => s.id === 7 ? t : t + s.questions.length, 0);
  }

  const value = {
    state,
    dispatch,
    currentQuestion,
    currentSection,
    sections,
    totalAnswered,
    totalQuestions,
    isFirstQuestion: state.currentSection === 0 && state.currentQuestion === 0
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
