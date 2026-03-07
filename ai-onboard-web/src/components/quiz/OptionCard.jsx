export default function OptionCard({ text, selected, onClick, index }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded transition-all duration-150 ease-out cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        minHeight: '56px',
        backgroundColor: selected ? 'var(--color-accent-muted)' : 'transparent',
        borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)',
        color: 'var(--color-text-primary)'
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] leading-relaxed">{text}</span>
        {selected && (
          <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
