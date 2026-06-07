"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// functions/list-history/index.ts
var index_exports = {};
__export(index_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(index_exports);

// shared/utils.ts
var import_client_s3 = require("@aws-sdk/client-s3");
function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}
var s3 = new import_client_s3.S3Client({ region: process.env.AWS_REGION || "us-east-1" });
async function listSummariesFromS3() {
  const bucket = process.env.S3_BUCKET_NAME;
  const list = await s3.send(new import_client_s3.ListObjectsV2Command({
    Bucket: bucket,
    Prefix: "summaries/",
    MaxKeys: 50
  }));
  if (!list.Contents || list.Contents.length === 0) return [];
  const sorted = list.Contents.filter((obj) => obj.Key).sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));
  const records = await Promise.all(
    sorted.map(async (obj) => {
      const result = await s3.send(new import_client_s3.GetObjectCommand({
        Bucket: bucket,
        Key: obj.Key
      }));
      const body = await result.Body?.transformToString();
      return JSON.parse(body);
    })
  );
  return records;
}

// functions/list-history/index.ts
var handler = async (_event) => {
  if (_event.httpMethod === "OPTIONS") return buildResponse(200, {});
  try {
    const summaries = await listSummariesFromS3();
    return buildResponse(200, { summaries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return buildResponse(500, { error: message });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
