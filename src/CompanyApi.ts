import mongoose, { ClientSession, Types } from 'mongoose';
import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import Database from './helpers/Database';
import { CustomAPIEvent } from './types/Generic';
import Company from './models/Company';
import City from './models/City';
import CompanyUser from './models/CompanyUser';
import Town from './models/Town';
import Uploader, { FOLDERS } from './helpers/Uploader';
import moment = require('moment');
import Formatter from './utils/Formatter';

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

      const result = await Company.getCompanyByUser(user._id?.toString(), parsedBody?._id, filters);

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
  // 2004 (500) File Upload Error
  public async Create(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
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
        isActive: true,
        createdBy: user.email,
        updatedBy: user.email,
      });

      await companyUser.save();

      const uploadedLogo = await new Uploader().Upload(FOLDERS.COMPANY, `logo_${company._id?.toString()}`, parsedBody?.logo?.url, true, 'base64');
      if (!uploadedLogo) {
        await session.abortTransaction();
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 2004, message: `File Upload Error` }),
        };
      }

      await company.update({
        $set: {
          logo: {
            url: uploadedLogo,
          },
        },
      });

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
      await session.endSession();
    }
  }

  // ERROR CODES
  // 2003 (404) Company Not Found
  public async Update(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;

      // VALIDATE COMPANY IS EXIST AND BELONGS TO USER
      const company = await Company.isCompanyBelongsToUser(user?._id.toString(), parsedBody?._id.toString());
      if (!company) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2003, message: `Company Record not found!` }),
        };
      }

      const currentRecord = await Company.findOne({ $and: [{ _id: { $ne: company._id } }, { companyNumber: parsedBody?.companyNumber }] });
      if (currentRecord) {
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 2002, message: `"${parsedBody?.companyNumber}" company has already been recorded!"` }),
        };
      }

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      const uploadedLogo = await new Uploader().Upload(FOLDERS.COMPANY, `logo_${company._id.toString()}`, parsedBody?.logo?.url, true, 'base64');
      if (!uploadedLogo) {
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 2004, message: `File Upload Error` }),
        };
      }

      await Company.findOneAndUpdate(
        { _id: company._id },
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
            mailServer: {
              mailServerEndpoint: parsedBody?.mailServerEndpoint || null,
              mailServerPort: parsedBody?.mailServerPort || null,
              mailServerUserName: parsedBody?.mailServerUserName || null,
              mailServerPassword: parsedBody?.mailServerPassword || null,
              isMailServerHasVPN: parsedBody?.isMailServerHasVPN ? true : false,
            },
            logo: {
              url: uploadedLogo || null,
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
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;
      const companyId = parsedBody?._id;

      const company = await Company.isCompanyBelongsToUser(user?._id.toString(), companyId);
      if (!company) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2003, message: `Company Record not found!` }),
        };
      }

      await Company.findOneAndUpdate(
        { _id: company._id },
        {
          $set: {
            isActive: false,
            updatedBy: user.email,
          },
        }
      );

      await CompanyUser.updateMany(
        { companyId },
        {
          $set: {
            isActive: false,
            updatedBy: user.email,
          },
        }
      );

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('CompanyApi.DeleteOne', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    } finally {
      await session.endSession();
    }
  }

  public async SetActive(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;
      const companyId = parsedBody?._id;

      const company = await Company.isCompanyBelongsToUser(user?._id.toString(), companyId);
      if (!company) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2003, message: `Company Record not found!` }),
        };
      }

      const updatedCompany = await Company.findOneAndUpdate(
        { _id: company._id },
        {
          $set: {
            isActive: parsedBody?.isActive ? true : false,
            updatedBy: user.email,
          },
        },
        {
          new: true,
        }
      );

      await CompanyUser.updateMany(
        { companyId },
        {
          $set: {
            isActive: parsedBody?.isActive ? true : false,
            updatedBy: user.email,
          },
        }
      );

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, company: updatedCompany }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('CompanyApi.DeleteOne', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    } finally {
      await session.endSession();
    }
  }
}
