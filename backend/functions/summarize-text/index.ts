import Anthropic from '@anthropic-ai/sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  buildResponse,
  validateTextInput,
  saveSummaryToS3,
  SummaryRecord,
} from '../../shared/utils';

crypto.randomUUID();

let client: Anthropic;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return buildResponse(200, {});

  try {
    const body = JSON.parse(event.body || '{}');
    const text = validateTextInput(body.text);

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Please summarise the following text clearly and concisely.
Use 3-5 sentences. Focus on the key points and main takeaways.
Do not include phrases like "This text discusses" or "The author says".
Write the summary directly.

Text to summarise:
${text}`,
      }],
    });

    const summary =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Save to S3
    const record: SummaryRecord = {
      id: crypto.randomUUID(),
      type: 'text',
      inputSnippet: text.slice(0, 120),
      summary,
      createdAt: new Date().toISOString(),
    };
    await saveSummaryToS3(record);

    return buildResponse(200, { summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('required') || message.includes('exceeds') ? 400 : 500;
    return buildResponse(statusCode, { error: message });
  }
};