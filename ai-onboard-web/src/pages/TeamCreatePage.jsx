import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createTeam } from '../lib/teams.js';
import { getMyLatestAssessment } from '../lib/assessments.js';

export default function TeamCreatePage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdTeam, setCreatedTeam] = useState(null);
  const [hasAssessment, setHasAssessment] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if manager already has an assessment
  useEffect(() => {
    if (!user) return;
    getMyLatestAssessment(user.id)
      .then(a => setHasAssessment(!!a))
      .catch(() => setHasAssessment(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setLoading(true);

    try {
      const team = await createTeam(name.trim(), user.id);
      setCreatedTeam(team);
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  // Post-creation screen: prompt manager to take quiz or go to dashboard
  if (createdTeam) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="w-full max-w-[440px] px-4 text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl"
              style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
            >
              &#10003;
            </div>
            <h1
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              {createdTeam.name} Created
            </h1>

            {!hasAssessment ? (
              <>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Take the quiz yourself first — you'll see exactly what your team will experience,
                  and your dashboard will show a preview with your own data.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/quiz')}
                    className="w-full py-2.5 rounded text-sm font-medium cursor-pointer"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                  >
                    Take the Quiz First
                  </button>
                  <button
                    onClick={() => navigate('/dashboard', { state: { newTeamId: createdTeam.id } })}
                    className="w-full py-2.5 rounded text-sm cursor-pointer"
                    style={{
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    Skip to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Share the invite link with your team to start collecting profiles.
                </p>
                <button
                  onClick={() => navigate('/dashboard', { state: { newTeamId: createdTeam.id } })}
                  className="w-full py-2.5 rounded text-sm font-medium cursor-pointer"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="w-full max-w-[400px] px-4">
          <h1
            className="text-2xl font-semibold mb-2 text-center"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            Create a Team
          </h1>
          <p className="text-sm mb-6 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Once created, you'll get an invite link to share with your team members.
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded text-sm"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
                placeholder="e.g. Marketing Team"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-sm font-medium cursor-pointer transition-opacity"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
