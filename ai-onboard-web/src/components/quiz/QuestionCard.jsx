import { useState, useRef, useEffect, useCallback } from 'react';
import OptionCard from './OptionCard.jsx';

export default function QuestionCard({
  question,
  selectedValue,
  onSelect,
  onNext,
  onBack,
  showBack,
  autoAdvance = true,
  sectionTitle,
  questionNumber,
  totalInSection
}) {
  const [localSelected, setLocalSelected] = useState(selectedValue);
  const autoAdvanceTimer = useRef(null);

  useEffect(() => {
    setLocalSelected(selectedValue);
  }, [selectedValue, question.id]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const handleSingleSelect = useCallback((value) => {
    setLocalSelected(value);
    onSelect(value);

    if (autoAdvance) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        onNext();
      }, 300);
    }
  }, [onSelect, onNext, autoAdvance]);

  const handleMultiSelect = useCallback((value) => {
    setLocalSelected(prev => {
      const current = Array.isArray(prev) ? [...prev] : [];
      const rules = question.exclusivityRules;

      if (current.includes(value)) {
        // Deselect
        const next = current.filter(v => v !== value);
        onSelect(next);
        return next;
      } else {
        let next = [...current, value];
        // Apply exclusivity rules
        if (rules && rules[value]) {
          next = next.filter(v => !rules[value].includes(v));
          if (!next.includes(value)) next.push(value);
        }
        // Check if any existing selection excludes this new value
        if (rules) {
          for (const [exclusive, excludes] of Object.entries(rules)) {
            if (Number(exclusive) !== value && next.includes(Number(exclusive)) && excludes.includes(value)) {
              next = next.filter(v => v !== Number(exclusive));
            }
          }
        }
        onSelect(next);
        return next;
      }
    });
  }, [onSelect, question.exclusivityRules]);

  const handleTextChange = useCallback((e) => {
    const value = e.target.value.slice(0, 1000);
    setLocalSelected(value);
    onSelect(value);
  }, [onSelect]);

  const isMulti = question.type === 'multi';
  const isText = question.type === 'text';
  const canProceed = isText || isMulti
    ? true // multi and text always allow proceeding (skippable in individual mode)
    : localSelected !== null && localSelected !== undefined;

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
          {sectionTitle} ({questionNumber}/{totalInSection})
        </p>
        <h2 className="text-2xl font-medium leading-snug" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
          {question.text}
        </h2>
        {isMulti && question.instruction && (
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {question.instruction}
          </p>
        )}
        {isText && question.instruction && (
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {question.instruction}
          </p>
        )}
      </div>

      {isText ? (
        <div className="mb-6">
          <textarea
            value={typeof localSelected === 'string' ? localSelected : ''}
            onChange={handleTextChange}
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 rounded border text-[15px] resize-none focus:outline-2 focus:outline-offset-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)'
            }}
            placeholder="Type your response..."
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {typeof localSelected === 'string' ? localSelected.length : 0} / 1000
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((option, idx) => (
            <OptionCard
              key={option.value}
              text={option.text}
              selected={isMulti
                ? Array.isArray(localSelected) && localSelected.includes(option.value)
                : localSelected === option.value
              }
              onClick={() => isMulti ? handleMultiSelect(option.value) : handleSingleSelect(option.value)}
              index={idx}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        {showBack ? (
          <button
            onClick={onBack}
            className="text-sm px-3 py-2 rounded transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            &larr; Back
          </button>
        ) : <div />}

        {(isMulti || isText || !autoAdvance) && (
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canProceed ? 'var(--color-accent)' : 'var(--color-border)',
              color: 'white'
            }}
          >
            Next &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
