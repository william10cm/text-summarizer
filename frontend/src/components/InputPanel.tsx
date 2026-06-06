import { useState } from 'react';
import '../styles/InputPanel.css';

type Tab = 'text' | 'url';

interface Props {
  onSubmit: (type: Tab, value: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function InputPanel({ onSubmit, isLoading, error }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [textValue, setTextValue] = useState('');
  const [urlValue, setUrlValue] = useState('');

  const currentValue = activeTab === 'text' ? textValue : urlValue;
  const canSubmit = currentValue.trim().length > 0 && !isLoading;

  function handleSubmit() {
    if (canSubmit) onSubmit(activeTab, currentValue.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  }

  return (
    <div className="input-panel">
      <div className="input-panel__tabs" role="tablist">
        {(['text', 'url'] as Tab[]).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`input-panel__tab${activeTab === tab ? ' input-panel__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'text' ? '📄 Paste Text' : '🔗 Enter URL'}
          </button>
        ))}
      </div>

      {activeTab === 'text' ? (
        <textarea
          className="input-panel__textarea"
          placeholder="Paste any text here — articles, reports, notes, emails…"
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      ) : (
        <input
          type="url"
          className="input-panel__url-input"
          placeholder="https://example.com/article"
          value={urlValue}
          onChange={e => setUrlValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      )}

      <div className="input-panel__footer">
        <span className="input-panel__char-count">
          {activeTab === 'text' && textValue.length > 0
            ? `${textValue.length.toLocaleString()} characters`
            : activeTab === 'text' ? 'Ctrl+Enter to submit' : 'Press Enter to submit'}
        </span>
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isLoading ? 'Summarising…' : 'Summarise →'}
        </button>
      </div>

      {error && <p className="input-panel__error">⚠ {error}</p>}
    </div>
  );
}