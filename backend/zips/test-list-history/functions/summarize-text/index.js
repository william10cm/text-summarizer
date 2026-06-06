"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const utils_1 = require("../../shared/utils");
crypto.randomUUID();
let client;
function getClient() {
    if (!client)
        client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
}
const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS')
        return (0, utils_1.buildResponse)(200, {});
    try {
        const body = JSON.parse(event.body || '{}');
        const text = (0, utils_1.validateTextInput)(body.text);
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
        const summary = message.content[0].type === 'text' ? message.content[0].text : '';
        // Save to S3
        const record = {
            id: crypto.randomUUID(),
            type: 'text',
            inputSnippet: text.slice(0, 120),
            summary,
            createdAt: new Date().toISOString(),
        };
        await (0, utils_1.saveSummaryToS3)(record);
        return (0, utils_1.buildResponse)(200, { summary });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const statusCode = message.includes('required') || message.includes('exceeds') ? 400 : 500;
        return (0, utils_1.buildResponse)(statusCode, { error: message });
    }
};
exports.handler = handler;
