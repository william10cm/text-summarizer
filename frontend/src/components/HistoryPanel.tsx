import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { fetchHistory, type SummaryRecord } from '../api/summarizer';
import '../styles/HistoryPanel.css';

const HistoryPanel = forwardRef((_props, ref) => {
  const [records, setRecords] = useState<SummaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchHistory();
      setRecords(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }

  useImperativeHandle(ref, () => ({ load }));
  useEffect(() => { load(); }, []);


  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (isLoading) return null;
  if (records.length === 0) return null;

  return (
    <section className="history-panel">
      <div className="history-panel__header">
        <span className="history-panel__title">Recent Summaries</span>
        <button className="btn-refresh" onClick={load}>↻ Refresh</button>
      </div>

      <div className="history-panel__list">
        {records.map(record => (
          <div
            key={record.id}
            className={`history-item${expandedId === record.id ? ' history-item--expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
          >
            <div className="history-item__meta">
              <span className="history-item__badge">{record.type}</span>
              <span className="history-item__snippet">{record.inputSnippet}</span>
              <span className="history-item__date">{formatDate(record.createdAt)}</span>
            </div>

            {expandedId === record.id && (
              <div className="history-item__summary">{record.summary}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

export default HistoryPanel;