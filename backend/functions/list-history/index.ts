import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, listSummariesFromS3 } from '../../shared/utils';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (_event.httpMethod === 'OPTIONS') return buildResponse(200, {});

  try {
    const summaries = await listSummariesFromS3();
    return buildResponse(200, { summaries });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return buildResponse(500, { error: message });
  }
};