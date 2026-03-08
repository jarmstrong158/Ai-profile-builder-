import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import QuizContainer from '../components/quiz/QuizContainer.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTeams } from '../lib/teams.js';
import { calculateRawScores, normalizeScores, assignZones } from '../engine/scoring.js';
import { matchArchetypes } from '../engine/archetype-matching.js';
import { detectDeviations } from '../engine/deviation-detector.js';
import { generateProfileData } from '../engine/profile-generator.js';

export default function QuizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = useCallback(async (answers, section7Answered) => {
    // Run scoring pipeline
    const rawScores = calculateRawScores(answers);
    const normalizedScores = normalizeScores(rawScores, section7Answered);
    const zones = assignZones(normalizedScores);
    const archetypeResult = matchArchetypes(normalizedScores);
    const deviations = detectDeviations(normalizedScores, archetypeResult.primary, archetypeResult.secondary);
    const profileData = generateProfileData(answers, normalizedScores, zones, archetypeResult, deviations);

    // If user is authenticated, check if they have a team
    if (user) {
      try {
        const teams = await getMyTeams(user.id);
        if (teams.length > 0) {
          // Auto-redirect to supplementary questions for team members
          const teamId = teams[0].id;
          navigate('/supplementary', {
            state: {
              coreAnswers: answers,
              normalizedScores,
              zones,
              archetypeResult,
              teamId,
              // Pass profile data so supplementary page can forward it
              profile: profileData
            }
          });
          return;
        }
      } catch {
        // If team fetch fails, fall through to profile page
      }
    }

    // No team — go to profile page as normal
    navigate('/profile', {
      state: {
        profile: profileData,
        scores: normalizedScores,
        zones,
        archetype: archetypeResult,
        answers
      }
    });
  }, [navigate, user]);

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
