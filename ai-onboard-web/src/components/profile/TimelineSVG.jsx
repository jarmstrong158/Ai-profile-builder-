import { useState } from 'react';
import { SPECTRUM_NAMES } from '../../data/weights.js';

const PADDING = { top: 24, right: 20, bottom: 50, left: 42 };
const W = 680;
const H = 320;
const PLOT_W = W - PADDING.left - PADDING.right;
const PLOT_H = H - PADDING.top - PADDING.bottom;

const Y_TICKS = [0, 25, 50, 75, 100];

function getX(idx, count) {
  const step = PLOT_W / Math.max(count - 1, 1);
  return PADDING.left + idx * step;
}

function getY(score) {
  return PADDING.top + PLOT_H - ((score ?? 50) / 100) * PLOT_H;
}

/**
 * Determine which X-axis labels to show to avoid overlap.
 * Always show first and last. Thin the middle if > 6 points.
 */
function getVisibleLabels(count) {
  if (count <= 6) return new Set(Array.from({ length: count }, (_, i) => i));
  const step = Math.ceil(count / 5);
  const visible = new Set([0, count - 1]);
  for (let i = step; i < count - 1; i += step) visible.add(i);
  return visible;
}

export default function TimelineSVG({ data, visibleSpectrums, archetypeChanges, colors }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const count = data.length;
  const visibleLabels = getVisibleLabels(count);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ display: 'block' }}
      onClick={() => setHoveredPoint(null)}
    >
      {/* Grid lines */}
      {Y_TICKS.map(val => {
        const y = getY(val);
        return (
          <g key={val}>
            <line
              x1={PADDING.left} y1={y}
              x2={W - PADDING.right} y2={y}
              stroke="var(--color-border)"
              strokeDasharray={val === 50 ? 'none' : '4 4'}
              strokeOpacity={val === 50 ? 0.5 : 0.25}
            />
            <text
              x={PADDING.left - 8} y={y + 4}
              textAnchor="end"
              fill="var(--color-text-secondary)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((assess, idx) => {
        if (!visibleLabels.has(idx)) return null;
        const x = getX(idx, count);
        const label = assess.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <text
            key={idx}
            x={x} y={H - PADDING.bottom + 20}
            textAnchor="middle"
            fill="var(--color-text-secondary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        );
      })}

      {/* Archetype change markers */}
      {archetypeChanges.map(({ idx }) => (
        <g key={`arch-${idx}`}>
          <line
            x1={getX(idx, count)} y1={PADDING.top}
            x2={getX(idx, count)} y2={PADDING.top + PLOT_H}
            stroke="var(--color-accent-amber)"
            strokeDasharray="3 3"
            strokeOpacity="0.45"
          />
          <polygon
            points={`${getX(idx, count)},${PADDING.top - 2} ${getX(idx, count) + 5},${PADDING.top + 5} ${getX(idx, count)},${PADDING.top + 12} ${getX(idx, count) - 5},${PADDING.top + 5}`}
            fill="var(--color-accent-amber)"
            fillOpacity="0.7"
          />
        </g>
      ))}

      {/* Lines */}
      {[...visibleSpectrums].map(specId => {
        const points = data.map((assess, idx) =>
          `${getX(idx, count)},${getY(assess.normalizedScores[specId])}`
        ).join(' ');

        return (
          <polyline
            key={`line-${specId}`}
            points={points}
            fill="none"
            stroke={colors[specId]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
        );
      })}

      {/* Data point dots */}
      {[...visibleSpectrums].map(specId =>
        data.map((assess, idx) => {
          const isHovered = hoveredPoint?.specId === specId && hoveredPoint?.idx === idx;
          return (
            <circle
              key={`dot-${specId}-${idx}`}
              cx={getX(idx, count)}
              cy={getY(assess.normalizedScores[specId])}
              r={isHovered ? 6 : 4}
              fill={colors[specId]}
              stroke="var(--color-surface)"
              strokeWidth="2"
              style={{ transition: 'r 0.15s ease', cursor: 'pointer' }}
            />
          );
        })
      )}

      {/* Invisible hit areas per column — one for each spectrum at each time point */}
      {[...visibleSpectrums].map(specId =>
        data.map((assess, idx) => {
          const cx = getX(idx, count);
          const cy = getY(assess.normalizedScores[specId]);
          return (
            <rect
              key={`hit-${specId}-${idx}`}
              x={cx - 12} y={cy - 12}
              width="24" height="24"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onPointerEnter={() => setHoveredPoint({ specId, idx })}
              onPointerLeave={() => setHoveredPoint(prev =>
                prev?.specId === specId && prev?.idx === idx ? null : prev
              )}
              onClick={(e) => {
                e.stopPropagation();
                setHoveredPoint(prev =>
                  prev?.specId === specId && prev?.idx === idx
                    ? null
                    : { specId, idx }
                );
              }}
            />
          );
        })
      )}

      {/* Tooltip */}
      {hoveredPoint && (() => {
        const assess = data[hoveredPoint.idx];
        const score = assess.normalizedScores[hoveredPoint.specId];
        const name = SPECTRUM_NAMES[hoveredPoint.specId] || `Spectrum ${hoveredPoint.specId}`;
        const dateStr = assess.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const cx = getX(hoveredPoint.idx, count);
        const cy = getY(score);
        const tooltipW = 150;
        const tooltipH = 42;

        // Position above point, flip below if too close to top
        const above = cy > PADDING.top + 55;
        const tooltipY = above ? cy - tooltipH - 12 : cy + 14;
        // Keep horizontally within bounds
        const tooltipX = Math.max(PADDING.left + tooltipW / 2, Math.min(cx, W - PADDING.right - tooltipW / 2));

        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={tooltipX - tooltipW / 2} y={tooltipY}
              width={tooltipW} height={tooltipH}
              rx="6"
              fill="var(--color-bg)"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={tooltipX} y={tooltipY + 16}
              textAnchor="middle"
              fill={colors[hoveredPoint.specId]}
              fontSize="11" fontWeight="600"
              fontFamily="var(--font-body)"
            >
              {name}: {Math.round(score ?? 0)}
            </text>
            <text
              x={tooltipX} y={tooltipY + 32}
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {dateStr}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
