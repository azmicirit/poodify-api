import { Context } from 'aws-lambda';
import Api from './Api';
import { Down, Up } from './seeds';
import { CustomAPIEvent } from './types/Generic';

export const ROUTES: { [k: string]: { Func: (event: CustomAPIEvent, context: Context) => {} } } = {
  '/test': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new Api(event, context).Test();
    },
  },
};

export const PRIVATE_ROUTES: { [k: string]: { Func: (event: CustomAPIEvent, context: Context) => {} } } = {
  '/seed': {
    Func: async () => {
      try {
        await Down();
        await Up();

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error }),
        };
      }
    },
  },
  '/seed/up': {
    Func: async () => {
      try {
        await Up();

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error }),
        };
      }
    },
  },
  '/seed/down': {
    Func: async () => {
      try {
        await Down();

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error }),
        };
      }
    },
  },
};
