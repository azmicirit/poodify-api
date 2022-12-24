import * as Handlebars from 'handlebars';
import { SES } from 'aws-sdk';
import { RegisterConfirmation } from './templates';

export enum MailTemplates {
  RegisterConfirmation,
}

export class MailerService {
  private static GetTemplate(template: MailTemplates) {
    try {
      switch (template) {
        case MailTemplates.RegisterConfirmation:
          return RegisterConfirmation;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  public static async Send(template: MailTemplates, sourceEmail: string, toAddressess: string[], subject: string, data?: object) {
    try {
      const ses = new SES({
        region: process.env.AWS_REGION_SES,
      });

      let htmlData = this.GetTemplate(template);
      if (data) {
        const template = Handlebars.compile(htmlData);
        htmlData = template(data);
      }

      const params = {
        Source: sourceEmail,
        Destination: {
          ToAddresses: toAddressess,
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: htmlData,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
      };

      return await ses.sendEmail(params).promise();
    } catch (error) {
      console.error('MailerService.Send Error', error);
      return null;
    }
  }
}
