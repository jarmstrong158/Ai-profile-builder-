import { useState, useEffect } from 'react';

/**
 * Minimal in-app toast notification.
 * Usage: <Toast message="..." type="success|error" onClose={() => ...} />
 */
export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for fade-out
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = type === 'error'
    ? { bg: 'rgba(220, 38, 38, 0.12)', border: '#ef4444', text: '#ef4444' }
    : { bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e', text: '#22c55e' };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          backdropFilter: 'blur(12px)',
          maxWidth: '420px'
        }}
      >
        <span style={{ fontSize: '1rem' }}>
          {type === 'error' ? '\u2716' : '\u2714'}
        </span>
        <span>{message}</span>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="ml-2 cursor-pointer"
          style={{ color: colors.text, background: 'none', border: 'none', fontSize: '1rem', lineHeight: 1, opacity: 0.7 }}
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
