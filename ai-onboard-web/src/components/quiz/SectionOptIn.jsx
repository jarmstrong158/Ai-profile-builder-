export default function SectionOptIn({ onOptIn, onSkip }) {
  return (
    <div className="w-full max-w-[600px] mx-auto text-center">
      <h2 className="text-2xl font-medium mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
        This next section is optional.
      </h2>
      <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        It helps the AI understand your energy and work patterns. Three quick questions.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={onOptIn}
          className="w-full px-6 py-3 rounded text-base font-medium transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          Answer these questions &rarr;
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 text-sm transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          Skip to final question
        </button>
      </div>
    </div>
  );
}
