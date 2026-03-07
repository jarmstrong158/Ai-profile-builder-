export default function ArchetypeCard({ archetype }) {
  if (!archetype) return null;

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Primary */}
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
            Primary Archetype
          </p>
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
            {archetype.primaryName}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {archetype.primarySimilarity}% match
          </p>
        </div>

        {/* Divider */}
        {archetype.secondaryName && (
          <>
            <div className="hidden sm:block w-px h-12" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="block sm:hidden h-px" style={{ backgroundColor: 'var(--color-border)' }} />

            {/* Secondary */}
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Secondary
              </p>
              <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
                {archetype.secondaryName}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {archetype.secondarySimilarity}% match
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
