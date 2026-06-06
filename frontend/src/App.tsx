import { useState, useRef } from 'react';
import InputPanel from './components/InputPanel';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import { summarizeText, summarizeUrl } from './api/summarizer';
import './styles/global.css';
import './styles/App.css';

type InputType = 'text' | 'url';

export default function App() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<{ load: () => void }>(null);

  async function handleSubmit(type: InputType, input: string) {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result =
        type === 'text'
          ? await summarizeText(input)
          : await summarizeUrl(input);

      setSummary(result.summary);
      // Refresh history after a short delay to let S3 write settle
      setTimeout(() => historyRef.current?.load(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Brief<span>ly</span></h1>
        <p className="app__subtitle">Paste text or a URL — get a clean summary instantly</p>
      </header>

      <main>
        <InputPanel onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        <ResultCard summary={summary} isLoading={isLoading} />
        <HistoryPanel ref={historyRef} />
      </main>
    </div>
  );
}