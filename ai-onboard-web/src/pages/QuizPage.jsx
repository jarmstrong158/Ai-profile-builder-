import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import QuizContainer from '../components/quiz/QuizContainer.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import { calculateRawScores, normalizeScores, assignZones } from '../engine/scoring.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { detectDeviations } from '../engine/deviation-detector.js';
import { generateProfileData } from '../engine/profile-generator.js';

export default function QuizPage() {
  const navigate = useNavigate();

  const handleComplete = useCallback((answers, section7Answered) => {
    // Run scoring pipeline
    const rawScores = calculateRawScores(answers);
    const normalizedScores = normalizeScores(rawScores, section7Answered);
    const zones = assignZones(normalizedScores);
    const archetypeResult = matchArchetypes(normalizedScores);
    const deviations = detectDeviations(normalizedScores, archetypeResult.primary, archetypeResult.secondary);
    const profileData = generateProfileData(answers, normalizedScores, zones, archetypeResult, deviations);

    navigate('/profile', {
      state: {
        profile: profileData,
        scores: normalizedScores,
        zones,
        archetype: archetypeResult
      }
    });
  }, [navigate]);

  return (
    <QuizProvider>
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center py-8">
          <QuizContainer onComplete={handleComplete} />
        </div>
      </Layout>
    </QuizProvider>
  );
}
