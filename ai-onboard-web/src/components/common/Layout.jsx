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
    </div>
  );
}
