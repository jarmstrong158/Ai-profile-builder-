import ThemeToggle from './ThemeToggle.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-end px-4 z-40" style={{ backgroundColor: 'var(--color-bg)' }}>
        <ThemeToggle />
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
