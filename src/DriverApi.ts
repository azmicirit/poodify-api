import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import Database from './helpers/Database';
import { CustomAPIEvent } from './types/Generic';
import Driver from './models/Driver';
import Company from './models/Company';
import mongoose, { ClientSession } from 'mongoose';
import Town from './models/Town';
import City from './models/City';
import CompanyDriver from './models/CompanyDriver';
import Uploader, { FOLDERS } from './helpers/Uploader';

export default class DriverApi extends Database {
  constructor(event: CustomAPIEvent, context: Context) {
    super(event, context);
  }

  public async GetList(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;
      const filters = parsedBody?.filters;
      const current = parsedBody?.pagination?.current || 1;
      const pageSize = parsedBody?.pagination?.pageSize || 10;

      const result = await Driver.getDriversByUser(user._id?.toString(), filters, current, pageSize);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, drivers: result?.list || [], total: result?.size || 0 }),
      };
    } catch (error) {
      console.error('DriverApi.GetList', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }

  public async GetOne(): Promise<APIGatewayProxyResultV2> {
    try {
      const { user, parsedBody } = this.event;

      const driver = await Driver.getDriverByUser(user._id?.toString(), parsedBody?.driverId);

      if (driver) {
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, driver }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, driver: null }),
        };
      }
    } catch (error) {
      console.error('DriverApi.GetOne', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    }
  }

  // ERROR CODES
  // 3001 (404) City Not Found
  // 3002 (404) Company Not Found
  // 3003 (409) Email is taken by someone else
  // 3004 (500) File Upload Error
  public async Create(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 3001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      const company = await Company.getCompanyByUser(user?._id?.toString(), parsedBody?.companyId);
      if (!company) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 3002, message: `Company Record not found!` }),
        };
      }

      const isDriverExist = await Driver.exists({ email: parsedBody?.email }).exec();
      if (isDriverExist) {
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, ecode: 3003, message: `Email is taken by someone else` }),
        };
      }

      const driver = new Driver({
        forenames: parsedBody?.forenames,
        lastname: parsedBody?.lastname,
        email: parsedBody?.email,
        isActive: parsedBody?.isActive || false,
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
        identityNumber: parsedBody?.identityNumber,
        dob: parsedBody?.dob,
        mobile: parsedBody?.mobile,
      });

      await driver.save();

      const companyDriver = await new CompanyDriver({
        companyId: company._id,
        driverId: driver._id,
        isActive: true,
        createdBy: user.email,
        updatedBy: user.email,
      });

      await companyDriver.save();

      const uploadedLogo = await new Uploader().Upload(FOLDERS.DRIVER, `profile_${driver._id?.toString()}`, parsedBody?.profilePhoto?.url, true, 'base64');
      if (!uploadedLogo) {
        await session.abortTransaction();
        return {
          statusCode: 409,
          body: JSON.stringify({ success: false, ecode: 3004, message: `File Upload Error` }),
        };
      }

      await driver.update({
        $set: {
          profilePhoto: {
            url: uploadedLogo,
          },
        },
      });

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, driver }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('DriverApi.Create', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, error: process.env.DEBUG == 'true' ? error.toString() : 'Fatal Error' }),
      };
    } finally {
      await session.endSession();
    }
  }

  // ERROR CODES
  // 3005 (404) Driver Not Found
  public async Update(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 3001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });
      const driver = await Driver.getDriverByUser(user?._id?.toString(), parsedBody?.driverId);

      if (!driver) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 3005, message: `Driver not found!` }),
        };
      }

      const uploadedLogo = await new Uploader().Upload(FOLDERS.DRIVER, `profile_${driver._id?.toString()}`, parsedBody?.profilePhoto?.url, true, 'base64');
      if (!uploadedLogo) {
        await session.abortTransaction();
        return {
          statusCode: 409,
          body: JSON.stringify({ success: false, ecode: 3004, message: `File Upload Error` }),
        };
      }

      await Driver.findOneAndUpdate(
        { _id: driver._id },
        {
          $set: {
            forenames: parsedBody?.forenames,
            lastname: parsedBody?.lastname,
            email: parsedBody?.email,
            isActive: parsedBody?.isActive || false,
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
            identityNumber: parsedBody?.identityNumber,
            dob: parsedBody?.dob,
            mobile: parsedBody?.mobile,
            profilePhoto: {
              url: uploadedLogo || null,
            },
          },
        }
      );

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, driver }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('DriverApi.Update', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, error: process.env.DEBUG == 'true' ? error.toString() : 'Fatal Error' }),
      };
    } finally {
      await session.endSession();
    }
  }

  public async DeleteOne(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;
      const driverId = parsedBody?.driverId;

      const driver = await Driver.getDriverByUser(user?._id.toString(), driverId);
      if (!driver) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: true, ecode: 2003, message: `Driver Record not found!` }),
        };
      }

      await Driver.deleteOne({ _id: driver._id });
      await CompanyDriver.deleteOne({ companyId: parsedBody?.companyId, driverId: driver._id });

      await session.commitTransaction();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('DriverApi.DeleteOne', error);

      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };
    } finally {
      await session.endSession();
    }
  }
}
