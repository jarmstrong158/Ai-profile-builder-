import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { joinTeam } from '../lib/teams.js';

export default function JoinPage() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking | joining | joined | error
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Store invite code and redirect to login
      sessionStorage.setItem('pending-invite-code', code);
      navigate('/login', { replace: true });
      return;
    }

    // User is authenticated, try to join
    setStatus('joining');
    joinTeam(code, user.id)
      .then(team => {
        setTeamName(team.name);
        setStatus('joined');
      })
      .catch(err => {
        setError(err.message || 'Failed to join team');
        setStatus('error');
      });
  }, [user, authLoading, code, navigate]);

  if (authLoading || status === 'checking' || status === 'joining') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {status === 'joining' ? 'Joining team...' : 'Loading...'}
          </p>
        </div>
      </Layout>
    );
  }

  if (status === 'error') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              Could Not Join Team
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Joined successfully
  return (
    <Layout>
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1
            className="text-2xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
          >
            Welcome to {teamName}!
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            You've joined the team. Take the quiz to build your AI profile and share it with your manager.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Start the Quiz
          </button>
        </div>
      </div>
    </Layout>
  );
}
