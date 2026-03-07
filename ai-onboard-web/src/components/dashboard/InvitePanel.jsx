import { useState } from 'react';

export default function InvitePanel({ inviteCode }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}${window.location.pathname}#/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = inviteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="px-4 py-3 rounded flex items-center justify-between gap-3"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          Invite Link
        </p>
        <p
          className="text-sm truncate"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace' }}
        >
          {inviteUrl}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer flex-shrink-0"
        style={{
          backgroundColor: copied ? '#22c55e' : 'var(--color-accent)',
          color: 'white'
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
