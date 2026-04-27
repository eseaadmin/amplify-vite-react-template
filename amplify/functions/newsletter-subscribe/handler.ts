import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Declare process global for TypeScript
declare const process: {
  env: {
    NEWS_SUBSCRIBER_TABLE_NAME?: string;
  };
};

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler: APIGatewayProxyHandler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body);
    const { email } = body;

    // Validate email presence
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get a table name from the environment
    const tableName = process.env.NEWS_SUBSCRIBER_TABLE_NAME;
    if (!tableName) {
      throw new Error('Table name not configured');
    }

    const now = new Date().toISOString();
    const subscribed_at = now;

    // Upsert by email so duplicate subscription attempts update the same item
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        email: normalizedEmail,
      },
      UpdateExpression:
        'SET subscribed_at = :subscribedAt, updatedAt = :updatedAt, createdAt = if_not_exists(createdAt, :createdAt)',
      ExpressionAttributeValues: {
        ':subscribedAt': subscribed_at,
        ':updatedAt': now,
        ':createdAt': now,
      },
      ReturnValues: 'ALL_OLD',
    });

    const result = await docClient.send(command);
    const alreadySubscribed = Boolean(result.Attributes?.email);
    const message = alreadySubscribed
      ? 'Email already subscribed. Subscription timestamp refreshed.'
      : 'Successfully subscribed to newsletter';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message,
        alreadySubscribed,
        email: normalizedEmail,
        subscribed_at,
      }),
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to subscribe to newsletter',
      }),
    };
  }
};
