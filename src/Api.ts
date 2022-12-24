import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import Database from './helpers/Database';
import { CustomAPIEvent } from './types/Generic';

export default class Api extends Database {
  constructor(event: CustomAPIEvent, context: Context) {
    super(event, context);
  }

  public async Test(): Promise<APIGatewayProxyResultV2> {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
    
  }
}
