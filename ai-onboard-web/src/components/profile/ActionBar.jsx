import { useState, useCallback } from 'react';

export default function ActionBar({ markdown, onRetake, onShare, isSharedView }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyText = useCallback(async (text, onSuccess) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onSuccess();
    }
  }, []);

  const handleCopy = useCallback(() => {
    copyText(markdown, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [markdown, copyText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-profile.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleShare = useCallback(() => {
    if (!onShare) return;
    const url = onShare();
    copyText(url, () => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [onShare, copyText]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-3 border-t z-50"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className="px-3 sm:px-4 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          {copied ? 'Copied \u2713' : 'Copy Profile'}
        </button>
        <button
          onClick={handleDownload}
          className="px-3 sm:px-4 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span className="hidden sm:inline">Download .md</span>
          <span className="sm:hidden">.md</span>
        </button>
        {onShare && (
          <button
            onClick={handleShare}
            className="px-3 sm:px-4 py-2 rounded text-sm font-medium transition-all duration-150 cursor-pointer border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {linkCopied ? 'Link Copied \u2713' : 'Share Link'}
          </button>
        )}
      </div>
      {!isSharedView && (
        <button
          onClick={onRetake}
          className="px-3 py-2 text-sm transition-colors duration-150 cursor-pointer shrink-0"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <span className="hidden sm:inline">Retake Quiz</span>
          <span className="sm:hidden">Retake</span>
        </button>
      )}
    </div>
  );
}
