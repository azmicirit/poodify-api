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
        body: JSON.stringify({ success: true, companies: result?.list || [], total: result?.size || 0 }),
      };
    } catch (error) {
      console.error('CompanyApi.GetList', error);

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

      const result = await Company.getCompanyByUser(user._id?.toString(), parsedBody?.companyId, filters);

      if (result) {
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, company: result }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, company: null }),
        };
      }
    } catch (error) {
      console.error('CompanyApi.GetOne', error);

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
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      const currentRecord = await Company.findOne({ companyNumber: parsedBody?.companyNumber });
      if (currentRecord) {
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 2002, message: `"${parsedBody?.companyNumber}" company has already been recorded!"` }),
        };
      }
      console.log();

      const company = new Company({
        name: parsedBody?.name || null,
        companyNumber: parsedBody?.companyNumber || null,
        taxOffice: parsedBody?.taxOffice || null,
        addresses: [
          {
            country: parsedBody?.addresses?.[0]?.country || null,
            city: city?._id || null,
            town: town?._id || null,
            postCode: parsedBody?.addresses?.[0]?.postCode || null,
            houseNumber: parsedBody?.addresses?.[0]?.houseNumber || null,
            addressText: parsedBody?.addresses?.[0]?.addressText || null,
          },
        ],
        emails: parsedBody?.emails || null,
        phones: parsedBody?.phones || null,
        webSite: parsedBody?.webSite || null,
        isActive: true,
        mailServer: {
          mailServerEndpoint: parsedBody?.mailServerEndpoint || null,
          mailServerPort: parsedBody?.mailServerPort || null,
          mailServerUserName: parsedBody?.mailServerUserName || null,
          mailServerPassword: parsedBody?.mailServerPassword || null,
          isMailServerHasVPN: parsedBody?.isMailServerHasVPN ? true : false,
        },
        reporterEmail: parsedBody?.reporterEmail || null,
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

      await companyUser.save();
      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, company }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('CompanyApi.CreateCompany', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, error: process.env.DEBUG == 'true' ? error.toString() : 'Fatal Error' }),
      };
    } finally {
      session.endSession();
    }
  }

  // ERROR CODES
  // 2003 (404) Company Not Found
  public async Update(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;

      const isValidCompany = await Company.isCompanyBelongsToUser(user?._id.toString(), parsedBody?._id);
      if (!isValidCompany) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2003, message: `Company Record not found!` }),
        };
      }

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      await Company.findOneAndUpdate(
        { _id: parsedBody?._id },
        {
          $set: {
            name: parsedBody?.name || null,
            companyNumber: parsedBody?.companyNumber || null,
            taxOffice: parsedBody?.taxOffice || null,
            addresses: [
              {
                country: parsedBody?.addresses?.[0]?.country || null,
                city: city?._id || null,
                town: town?._id || null,
                postCode: parsedBody?.addresses?.[0]?.postCode || null,
                houseNumber: parsedBody?.addresses?.[0]?.houseNumber || null,
                addressText: parsedBody?.addresses?.[0]?.addressText || null,
              },
            ],
            emails: parsedBody?.emails || null,
            phones: parsedBody?.phones || null,
            webSite: parsedBody?.webSite || null,
            isActive: true,
            mailServer: {
              mailServerEndpoint: parsedBody?.mailServerEndpoint || null,
              mailServerPort: parsedBody?.mailServerPort || null,
              mailServerUserName: parsedBody?.mailServerUserName || null,
              mailServerPassword: parsedBody?.mailServerPassword || null,
              isMailServerHasVPN: parsedBody?.isMailServerHasVPN ? true : false,
            },
            reporterEmail: parsedBody?.reporterEmail || null,
            createdBy: user.email,
            updatedBy: user.email,
          },
        }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      console.error('CompanyApi.Update', error);

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
      console.error('CompanyApi.DeleteOne', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }
}
