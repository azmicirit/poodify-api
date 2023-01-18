import { Lambda } from 'aws-sdk';
import { CheckAuthResult, CustomAPIEvent } from '../types/Generic';

const functionName = 'poodify-auth-check-api';

export class AuthService {
  private lambda;

  constructor() {
    this.lambda = new Lambda({ region: process.env.AWS_REGION_DEFAULT, endpoint: process.env.OFFLINE === 'true' ? 'http://localhost:3100' : undefined });
  }

  public async CheckAuth(event: CustomAPIEvent): Promise<CheckAuthResult | null> {
    try {
      const result = await this.lambda.invoke({ InvocationType: 'RequestResponse', FunctionName: functionName, Payload: JSON.stringify(event) }).promise();

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
