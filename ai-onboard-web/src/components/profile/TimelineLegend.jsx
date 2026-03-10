export default function TimelineLegend({ allSpectrums, visibleSpectrums, colors, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-4">
      {allSpectrums.map(({ id, name, totalShift }) => {
        const isVisible = visibleSpectrums.has(id);
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full cursor-pointer transition-opacity"
            style={{
              backgroundColor: isVisible ? colors[id] + '18' : 'transparent',
              color: isVisible ? colors[id] : 'var(--color-text-secondary)',
              border: `1px solid ${isVisible ? colors[id] + '40' : 'var(--color-border)'}`,
              opacity: isVisible ? 1 : 0.55
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: colors[id],
                opacity: isVisible ? 1 : 0.35,
                flexShrink: 0
              }}
            />
            <span>{name}</span>
            {totalShift > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.75 }}>
                {'\u00B1'}{Math.round(totalShift)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
