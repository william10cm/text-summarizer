import express from 'express';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as summarizeText } from './functions/summarize-text/index';
import { handler as summarizeUrl } from './functions/summarize-url/index';
import { handler as listHistory } from './functions/list-history/index';

// Load .env for local dev
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Helper: wrap an express request into the shape Lambda expects
function toEvent(req: express.Request): APIGatewayProxyEvent {
  return {
    httpMethod: req.method,
    body: JSON.stringify(req.body),
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: req.path,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  };
}

app.post('/summarize-text', async (req, res) => {
  const result = await summarizeText(toEvent(req), {} as any, () => {});
  res.status(result!.statusCode).json(JSON.parse(result!.body));
});

app.post('/summarize-url', async (req, res) => {
  const result = await summarizeUrl(toEvent(req), {} as any, () => {});
  res.status(result!.statusCode).json(JSON.parse(result!.body));
});

app.get('/history', async (req, res) => {
  const result = await listHistory(toEvent(req), {} as any, () => {});
  res.status(result!.statusCode).json(JSON.parse(result!.body));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Local Lambda server running at http://localhost:${PORT}`);
});