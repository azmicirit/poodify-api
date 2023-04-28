import { Context } from 'aws-lambda';
import CompanyApi from './CompanyApi';
import { Down, Up } from './seeds';
import { CustomAPIEvent } from './types/Generic';

export const ROUTES: { [k: string]: { Func: (event: CustomAPIEvent, context: Context) => {} } } = {
  '/company/getList': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).GetList();
    },
  },
  '/company/getOne': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).GetOne();
    },
  },
  '/company/create': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).Create();
    },
  },
  '/company/update': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).Update();
    },
  },
  '/company/deleteOne': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).DeleteOne();
    },
  },
  '/company/active': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new CompanyApi(event, context).SetActive();
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
        console.log('Heyyy lets up the process');

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
