import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface CustomAPIEvent extends APIGatewayProxyEventV2 {
  parsedBody?: { [k: string]: any };
}
