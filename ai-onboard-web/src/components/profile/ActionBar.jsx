import { useState, useCallback } from 'react';

export default function ActionBar({ markdown, onRetake }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [markdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-profile.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-6 border-t z-50"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          {copied ? 'Copied \u2713' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Download .md
        </button>
      </div>
      <button
        onClick={onRetake}
        className="px-3 py-2 text-sm transition-colors duration-150 cursor-pointer"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
      >
        Retake Quiz
      </button>
    </div>
  );
}
