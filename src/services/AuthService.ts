import { Lambda } from 'aws-sdk';
import { CheckAuthResult, CustomAPIEvent } from '../types/Generic';

const functionName = 'poodify-auth-check-api';

export enum PROCESS {
  CHECK_AUTH = 'CheckAuth',
  NEW_DRIVER = 'NewDriver',
}

export class AuthService {
  private lambda;

  constructor() {
    this.lambda = new Lambda({ region: process.env.AWS_REGION_DEFAULT, endpoint: process.env.OFFLINE === 'true' ? 'http://localhost:3100' : undefined });
  }

  public async Send(process: PROCESS, event: CustomAPIEvent): Promise<CheckAuthResult | null> {
    try {
      const result = await this.lambda.invoke({ InvocationType: 'RequestResponse', FunctionName: functionName, Payload: JSON.stringify({ process, ...event }) }).promise();

      if (result && result.StatusCode === 200) {
        return JSON.parse(JSON.parse(result.Payload.toString())?.body);
      } else {
        return null;
      }
    } catch (error) {
      console.error('AuthService.CheckAuth', error);
      return null;
    }
  }
}
