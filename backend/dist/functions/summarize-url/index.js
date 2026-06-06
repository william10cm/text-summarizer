"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("../../shared/utils");
crypto.randomUUID();
let client;
function getClient() {
    if (!client)
        client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
}
async function fetchPageText(url) {
    const response = await (0, node_fetch_1.default)(url, {
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
    if (text.length < 100)
        throw new Error('Could not extract enough text from that URL');
    return text.slice(0, 40000);
}
const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS')
        return (0, utils_1.buildResponse)(200, {});
    try {
        const body = JSON.parse(event.body || '{}');
        const url = (0, utils_1.validateUrl)(body.url);
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
        const summary = message.content[0].type === 'text' ? message.content[0].text : '';
        // Save to S3
        const record = {
            id: crypto.randomUUID(),
            type: 'url',
            sourceUrl: url,
            inputSnippet: url,
            summary,
            createdAt: new Date().toISOString(),
        };
        await (0, utils_1.saveSummaryToS3)(record);
        return (0, utils_1.buildResponse)(200, { summary, sourceUrl: url });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const statusCode = message.includes('required') || message.includes('valid') || message.includes('extract')
            ? 400 : 500;
        return (0, utils_1.buildResponse)(statusCode, { error: message });
    }
};
exports.handler = handler;
