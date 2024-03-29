import { Context } from 'aws-lambda';
import CompanyApi from './CompanyApi';
import { Down, Up } from './seeds';
import { CustomAPIEvent } from './types/Generic';
import DriverApi from './DriverApi';

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
  '/company/driver/getList': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new DriverApi(event, context).GetList();
    },
  },
  '/company/driver/getOne': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new DriverApi(event, context).GetOne();
    },
  },
  '/company/driver/create': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new DriverApi(event, context).Create();
    },
  },
  '/company/driver/update': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new DriverApi(event, context).Update();
    },
  },
  '/company/driver/deleteOne': {
    Func: async (event: CustomAPIEvent, context: Context) => {
      return await new DriverApi(event, context).DeleteOne();
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
          body: JSON.stringify({ success: false, message:error }),
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
          body: JSON.stringify({ success: false, message:error }),
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
          body: JSON.stringify({ success: false, message:error }),
        };
      }
    },
  },
};
