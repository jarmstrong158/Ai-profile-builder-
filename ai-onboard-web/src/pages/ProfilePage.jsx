import { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import { buildShareUrl } from '../engine/share.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTeams } from '../lib/teams.js';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = location.state?.profile;
  const scores = location.state?.scores;
  const zones = location.state?.zones;
  const archetype = location.state?.archetype;
  const answers = location.state?.answers;

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!profile) {
      navigate('/quiz', { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your profile hasn't been saved. Download or copy it before leaving.";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Fetch user's teams if authenticated
  useEffect(() => {
    if (user) {
      getMyTeams(user.id).then(setTeams).catch(() => {});
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
        teamId
      }
    });
  };

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

        {/* Save to Team section — only if logged in and has teams */}
        {user && teams.length > 0 && (
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
