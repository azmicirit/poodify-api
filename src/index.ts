import * as url from 'url';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { PRIVATE_ROUTES, ROUTES } from './Routes';
import { CustomAPIEvent } from './types/Generic';

const env = process.env;

const parseURI = (uri: string, mainPath?: string): string => {
  try {
    const path = uri.split(mainPath || '/api')[1] || null;
    return url.parse(path, true)?.path || null;
  } catch (error) {
    console.error('index.parseAPIURI Error', error);
    return null;
  }
};

export const Handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  try {
    const path = parseURI(event?.rawPath);
    const route = ROUTES[path];
    const customEvent: CustomAPIEvent = { ...event, parsedBody: event.body ? JSON.parse(event.body) : null };

    return route
      ? await route.Func(customEvent, context)
      : {
          statusCode: 301,
          headers: {
            Location: 'http://localhost:3001/not-found',
          },
        };
  } catch (error) {
    console.error('index.Handler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: process.env.OFFLINE.toString() === 'true' ? error?.toString() : 'Fatal Error' }),
    };
  }
};

export const PrivateHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<any> => {
  try {
    // CHECK x-private-key HEADER
    if (env.PRIVATE_KEY !== event.headers['x-private-key']) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, error: 'Forbidden' }),
      };
    }

    const path = parseURI(event?.rawPath, '/private');
    const route = PRIVATE_ROUTES[path];
    const customEvent: CustomAPIEvent = { ...event, parsedBody: event.body ? JSON.parse(event.body) : null };

    return route
      ? await route.Func(customEvent, context)
      : {
          statusCode: 404,
          body: JSON.stringify({ success: false, error: 'Function Not Found' }),
        };
  } catch (error) {
    console.error('index.PrivateHandler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: process.env.OFFLINE.toString() === 'true' ? error?.toString() : 'Fatal Error' }),
    };
  }
};
