import { useState } from 'react';
import '../styles/ResultCard.css';

interface Props {
  summary: string | null;
  isLoading: boolean;
}

export default function ResultCard({ summary, isLoading }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isLoading && !summary) return null;

  async function handleCopy() {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`result-card${isLoading ? ' result-card--loading' : ''}`}>
      <div className="result-card__header">
        <span className="result-card__label">Summary</span>
        {!isLoading && (
          <div className="result-card__actions">
            <button className="btn-icon" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button className="btn-icon" onClick={handleDownload}>
              Download
            </button>
          </div>
        )}
      </div>

      <div className="result-card__body">
        {isLoading ? (
          <>
            <div className="skeleton" style={{ width: '92%' }} />
            <div className="skeleton" style={{ width: '78%' }} />
            <div className="skeleton" style={{ width: '85%' }} />
            <div className="skeleton" style={{ width: '60%' }} />
          </>
        ) : (
          summary
        )}
      </div>
    </div>
  );
}