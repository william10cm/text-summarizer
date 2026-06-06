import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export function buildResponse(statusCode: number, body: object) {
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
  
  export function validateTextInput(text: unknown): string {
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('text field is required and must be a non-empty string');
    }
    if (text.length > 50000) {
      throw new Error('text exceeds maximum length of 50,000 characters');
    }
    return text.trim();
  }
  
  export function validateUrl(url: unknown): string {
    if (typeof url !== 'string' || url.trim().length === 0) {
      throw new Error('url field is required');
    }
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error();
      }
      return url.trim();
    } catch {
      throw new Error('url must be a valid http or https URL');
    }
  }

  

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export interface SummaryRecord {
  id: string;
  type: 'text' | 'url';
  sourceUrl?: string;
  inputSnippet: string;
  summary: string;
  createdAt: string;
}

export async function saveSummaryToS3(record: SummaryRecord): Promise<void> {
  const bucket = process.env.S3_BUCKET_NAME!;
  const key = `summaries/${record.createdAt}-${record.id}.json`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(record),
    ContentType: 'application/json',
  }));
}

export async function listSummariesFromS3(): Promise<SummaryRecord[]> {
  const bucket = process.env.S3_BUCKET_NAME!;

  const list = await s3.send(new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: 'summaries/',
    MaxKeys: 50,
  }));

  if (!list.Contents || list.Contents.length === 0) return [];

  // Sort newest first
  const sorted = list.Contents
    .filter(obj => obj.Key)
    .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));

  const records = await Promise.all(
    sorted.map(async obj => {
      const result = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: obj.Key!,
      }));
      const body = await result.Body?.transformToString();
      return JSON.parse(body!) as SummaryRecord;
    })
  );

  return records;
}