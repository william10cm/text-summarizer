import Anthropic from '@anthropic-ai/sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';
import {
  buildResponse,
  validateUrl,
  saveSummaryToS3,
  SummaryRecord,
} from '../../shared/utils';

crypto.randomUUID();

let client: Anthropic;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Briefly-Summarizer/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    throw new Error('URL must point to an HTML or plain text page');
  }

  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length < 100) throw new Error('Could not extract enough text from that URL');
  return text.slice(0, 40000);
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return buildResponse(200, {});

  try {
    const body = JSON.parse(event.body || '{}');
    const url = validateUrl(body.url);
    const pageText = await fetchPageText(url);

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Please summarise the following webpage content clearly and concisely.
Use 3-5 sentences. Focus on the key points and main takeaways.
Do not include phrases like "This page discusses" or "The website says".
Write the summary directly.

Webpage content:
${pageText}`,
      }],
    });

    const summary =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Save to S3
    const record: SummaryRecord = {
      id: crypto.randomUUID(),
      type: 'url',
      sourceUrl: url,
      inputSnippet: url,
      summary,
      createdAt: new Date().toISOString(),
    };
    await saveSummaryToS3(record);

    return buildResponse(200, { summary, sourceUrl: url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    let userMessage = message;
    if (message.includes('403') || message.includes('Forbidden')) {
      userMessage = 'This website blocks external requests. Try a Wikipedia or news article instead.';
    } else if (message.includes('timeout') || message.includes('abort')) {
      userMessage = 'The URL took too long to load. Try a different link.';
    }
    const statusCode = message.includes('required') || message.includes('valid') ? 400 : 500;
    return buildResponse(statusCode, { error: userMessage });
  }
}