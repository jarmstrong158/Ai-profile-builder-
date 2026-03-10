import { useState, useMemo } from 'react';
import { SPECTRUM_NAMES } from '../../data/weights.js';
import { selectMostChangedSpectrums } from '../../engine/retake.js';
import TimelineSVG from './TimelineSVG.jsx';
import TimelineLegend from './TimelineLegend.jsx';

/** 14 distinct colors readable on both dark and light themes */
const SPECTRUM_COLORS = {
  1:  '#3B82F6',   // blue
  2:  '#10B981',   // green
  3:  '#F59E0B',   // amber
  4:  '#EF4444',   // red
  5:  '#8B5CF6',   // purple
  6:  '#EC4899',   // pink
  7:  '#06B6D4',   // cyan
  8:  '#F97316',   // orange
  9:  '#84CC16',   // lime
  10: '#6366F1',   // indigo
  11: '#14B8A6',   // teal
  12: '#E879F9',   // fuchsia
  13: '#FB923C',   // light orange
  14: '#22D3EE',   // light cyan
};

export default function ProfileTimeline({ history }) {
  // Reverse to chronological (oldest first) for chart display
  const chronological = useMemo(() => [...history].reverse(), [history]);

  // Compute which spectrums changed the most
  const spectrumRankings = useMemo(
    () => selectMostChangedSpectrums(chronological),
    [chronological]
  );

  // Default: top 5 most-changed are visible
  const [visibleSpectrums, setVisibleSpectrums] = useState(() => {
    const defaultIds = spectrumRankings.slice(0, 5).map(s => s.id);
    return new Set(defaultIds.length > 0 ? defaultIds : [1, 2, 3, 4, 5]);
  });

  // Detect archetype changes between consecutive assessments
  const archetypeChanges = useMemo(() => {
    const changes = [];
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1].archetypeResult?.primary;
      const curr = chronological[i].archetypeResult?.primary;
      if (prev && curr && prev !== curr) {
        changes.push({
          idx: i,
          from: chronological[i - 1].archetypeResult?.primaryName,
          to: chronological[i].archetypeResult?.primaryName
        });
      }
    }
    return changes;
  }, [chronological]);

  // Build the full spectrum list for the legend (all 14, sorted by shift)
  const allSpectrums = useMemo(() => {
    const first = chronological[0]?.normalizedScores || {};
    const latest = chronological[chronological.length - 1]?.normalizedScores || {};
    return Object.keys(SPECTRUM_NAMES).map(k => {
      const id = Number(k);
      return {
        id,
        name: SPECTRUM_NAMES[id],
        totalShift: Math.round(Math.abs((latest[id] || 0) - (first[id] || 0)) * 10) / 10
      };
    }).sort((a, b) => b.totalShift - a.totalShift);
  }, [chronological]);

  const toggleSpectrum = (id) => {
    setVisibleSpectrums(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // keep at least 1
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const firstDate = chronological[0].date;
  const lastDate = chronological[chronological.length - 1].date;
  const sameMonth = firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear();
  const dateRange = sameMonth
    ? firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : `${firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} \u2013 ${lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  return (
    <div>
      {/* Summary */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        {chronological.length} assessment{chronological.length !== 1 ? 's' : ''} &middot; {dateRange}
      </p>

      {/* Chart */}
      <div
        className="rounded-lg px-3 py-3"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <TimelineSVG
          data={chronological}
          visibleSpectrums={visibleSpectrums}
          archetypeChanges={archetypeChanges}
          colors={SPECTRUM_COLORS}
        />
      </div>

      {/* Archetype change callouts */}
      {archetypeChanges.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1">
          {archetypeChanges.map(({ idx, from, to }) => (
            <p key={idx} className="text-xs" style={{ color: 'var(--color-accent-amber)' }}>
              {'\u25C6'} Archetype shifted from <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> on{' '}
              {chronological[idx].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          ))}
        </div>
      )}

      {/* Legend / toggles */}
      <TimelineLegend
        allSpectrums={allSpectrums}
        visibleSpectrums={visibleSpectrums}
        colors={SPECTRUM_COLORS}
        onToggle={toggleSpectrum}
      />
    </div>
  );
}
