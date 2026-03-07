import { useEffect, useState } from 'react';

export default function CompletionLoader({ onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-[600px] mx-auto text-center flex flex-col items-center justify-center min-h-[300px]">
      <h2
        className={`text-2xl font-medium transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text-primary)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      >
        Building your profile...
      </h2>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
