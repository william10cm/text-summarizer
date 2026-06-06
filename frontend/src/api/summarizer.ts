const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SummaryResult {
  summary: string;
  sourceUrl?: string;
}

export interface SummaryRecord {
  id: string;
  type: 'text' | 'url';
  sourceUrl?: string;
  inputSnippet: string;
  summary: string;
  createdAt: string;
}

async function post<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
  return data as T;
}

async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
  return data as T;
}

export async function summarizeText(text: string): Promise<SummaryResult> {
  return post<SummaryResult>('/summarize-text', { text });
}

export async function summarizeUrl(url: string): Promise<SummaryResult> {
  return post<SummaryResult>('/summarize-url', { url });
}

export async function fetchHistory(): Promise<SummaryRecord[]> {
  const data = await get<{ summaries: SummaryRecord[] }>('/history');
  return data.summaries;
}

