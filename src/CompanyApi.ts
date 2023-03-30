import mongoose, { ClientSession } from 'mongoose';
import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import Database from './helpers/Database';
import { CustomAPIEvent } from './types/Generic';
import Company from './models/Company';
import City from './models/City';
import CompanyUser from './models/CompanyUser';
import Town from './models/Town';

export default class CompanyApi extends Database {
  constructor(event: CustomAPIEvent, context: Context) {
    super(event, context);
  }

  public async GetList(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;
      const filters = parsedBody?.filters;
      const current = parsedBody?.pagination?.current || 1;
      const pageSize = parsedBody?.pagination?.pageSize || 10;

      const result = await Company.getCompaniesByUser(user._id?.toString(), filters, current, pageSize);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, companies: result.list, total: result.size }),
      };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }

  public async GetOne(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;
      const filters = parsedBody?.filters;
      const current = parsedBody?.pagination?.current || 1;
      const pageSize = parsedBody?.pagination?.pageSize || 10;

      const result = await Company.getCompanyByUser(user._id?.toString(), filters, current, pageSize);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, company: result.list, total: result.size }),
      };
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }

  // ERROR CODES
  // 2001 (404) City Not Found
  // 2002 (409) Company Already Taken
  public async Create(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();

    try {
      const { user } = this.event;
      const city = await City.findOne({ code: this.event?.parsedBody?.cityId });

      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2001, message: `"${this.event?.parsedBody?.cityId}" City Record not found!"` }),
        };
      }
      const town = await Town.findOne({ code: this.event?.parsedBody?.townId });
      const currentRecord = await Company.findOne({ companyNumber: this.event?.parsedBody?.companyNumber });
      if (currentRecord) {
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 2002, message: `"${this.event?.parsedBody?.companyNumber}" company has already been recorded!"` }),
        };
      }

      await session.startTransaction();

      const company = new Company({
        name: this.event?.parsedBody?.name || null,
        companyNumber: this.event?.parsedBody?.companyNumber || null,
        taxOffice: this.event?.parsedBody?.taxOffice || null,
        country: this.event?.parsedBody?.country || null,
        cityId: city._id || null,
        townId: town ? town._id : undefined,
        postCode: this.event?.parsedBody?.postCode || null,
        houseNumber: this.event?.parsedBody?.houseNumber || null,
        email: this.event?.parsedBody?.email || null,
        mobile: this.event?.parsedBody?.mobile || null,
        phone: this.event?.parsedBody?.phone || null,
        webSite: this.event?.parsedBody?.webSite || null,
        isActive: true,
        mailServer: this.event?.parsedBody?.mailServer || null,
        mailServerUserName: this.event?.parsedBody?.mailServerUserName || null,
        mailServerPassword: this.event?.parsedBody?.mailServerPassword || null,
        mailServerUserPort: this.event?.parsedBody?.mailServerUserPort || null,
        isMailServerHasVPN: this.event?.parsedBody?.isMailServerHasVPN || null,
        reporterEmail: this.event?.parsedBody?.reporterEmail || null,
        createdBy: user.email,
        updatedBy: user.email,
      });

      await company.save();

      const companyUser = await new CompanyUser({
        companyId: company._id,
        userId: user._id,
        active: true,
        createdBy: user.email,
        updatedBy: user.email,
      });

      companyUser.save();

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, company }),
      };
    } catch (error) {
      await session.abortTransaction();

      console.log('CompanyApi.CreateCompany', error);
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, error: process.env.DEBUG == 'true' ? error.toString() : 'Fatal Error' }),
      };
    } finally {
      session.endSession();
    }
  }

  public async Update(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;

      await Company.findOneAndUpdate(
        { _id: parsedBody?._id },
        {
          $set: {
            name: this.event?.parsedBody?.name || null,
            companyNumber: this.event?.parsedBody?.companyNumber || null,
            taxOffice: this.event?.parsedBody?.taxOffice || null,
            address:[ {
              country: this.event?.parsedBody?.address?.country || null,
              cityId: this.event?.parsedBody?.address?.cityId || null,
              townId: this.event?.parsedBody?.address?.townId || null,
              postCode: this.event?.parsedBody?.address?.postCode || null,
              houseNumber: this.event?.parsedBody?.address?.houseNumber || null,
              addressText:this.event?.parsedBody?.address?.addressText || null,
            }],
            email: this.event?.parsedBody?.email || null,
            mobile: this.event?.parsedBody?.mobile || null,
            phone: this.event?.parsedBody?.phone || null,
            webSite: this.event?.parsedBody?.webSite || null,
            isActive: this.event?.parsedBody?.isActive,
            mailServer: this.event?.parsedBody?.mailServer || null,
            mailServerUserName: this.event?.parsedBody?.mailServerUserName || null,
            mailServerPassword: this.event?.parsedBody?.mailServerPassword || null,
            mailServerUserPort: this.event?.parsedBody?.mailServerUserPort || null,
            isMailServerHasVPN: this.event?.parsedBody?.isMailServerHasVPN || null,
            reporterEmail: this.event?.parsedBody?.reporterEmail || null,
            updatedBy: user.email,
          },
        }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }
  public async DeleteOne(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user } = this.event;
      const company = await Company.findOneAndDelete({});

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, company }),
      };
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }
}
