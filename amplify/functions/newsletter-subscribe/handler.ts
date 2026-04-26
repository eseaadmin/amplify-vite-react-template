import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

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

    // Get a table name from the environment
    const tableName = process.env.NEWS_SUBSCRIBER_TABLE_NAME;
    if (!tableName) {
      throw new Error('Table name not configured');
    }

    const subscribed_at = new Date().toISOString();

    // Store in DynamoDB
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        email: email.toLowerCase().trim(),
        subscribed_at,
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Successfully subscribed to newsletter',
        email,
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
