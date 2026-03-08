import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-40" style={{ backgroundColor: 'var(--color-bg)' }}>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold cursor-pointer bg-transparent border-none"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          AI Onboard
        </button>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--color-accent)' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="text-sm cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--color-accent)' }}
            >
              Sign In
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="pt-12 px-4 pb-8">
        {children}
      </main>
      <footer className="text-center py-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Built by <a href="https://github.com/jarmstrong158" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>Jonny Armstrong</a>
      </footer>
    </div>
  );
}
