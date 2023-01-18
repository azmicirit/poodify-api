import { APIGatewayProxyEventV2 } from 'aws-lambda';

interface User {
  _id: string;
  forenames: string;
  lastname: string;
  email: string;
  active: boolean;
  profilePhoto: {
    url?: string;
    thumbnail?: string;
  };
}
export interface CustomAPIEvent extends APIGatewayProxyEventV2 {
  parsedBody?: { [k: string]: any };
  user?: User;
}

export interface GenericResult {
  success: boolean;
  error?: string;
  errorCode?: number;
}

export interface CheckAuthResult extends GenericResult {
  user?: {
    _id: string;
    forenames: string;
    lastname: string;
    email: string;
    active: boolean;
    profilePhoto: {
      url?: string;
      thumbnail?: string;
    };
  };
}
