"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponse = buildResponse;
exports.validateTextInput = validateTextInput;
exports.validateUrl = validateUrl;
exports.saveSummaryToS3 = saveSummaryToS3;
exports.listSummariesFromS3 = listSummariesFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        },
        body: JSON.stringify(body),
    };
}
function validateTextInput(text) {
    if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('text field is required and must be a non-empty string');
    }
    if (text.length > 50000) {
        throw new Error('text exceeds maximum length of 50,000 characters');
    }
    return text.trim();
}
function validateUrl(url) {
    if (typeof url !== 'string' || url.trim().length === 0) {
        throw new Error('url field is required');
    }
    try {
        const parsed = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error();
        }
        return url.trim();
    }
    catch {
        throw new Error('url must be a valid http or https URL');
    }
}
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
async function saveSummaryToS3(record) {
    const bucket = process.env.S3_BUCKET_NAME;
    const key = `summaries/${record.createdAt}-${record.id}.json`;
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(record),
        ContentType: 'application/json',
    }));
}
async function listSummariesFromS3() {
    const bucket = process.env.S3_BUCKET_NAME;
    const list = await s3.send(new client_s3_1.ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'summaries/',
        MaxKeys: 50,
    }));
    if (!list.Contents || list.Contents.length === 0)
        return [];
    // Sort newest first
    const sorted = list.Contents
        .filter(obj => obj.Key)
        .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));
    const records = await Promise.all(sorted.map(async (obj) => {
        const result = await s3.send(new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: obj.Key,
        }));
        const body = await result.Body?.transformToString();
        return JSON.parse(body);
    }));
    return records;
}
