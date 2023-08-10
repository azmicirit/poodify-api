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
import { AuthService, PROCESS } from './services/AuthService';
import Validator from './utils/Validator';

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

      const result = await Driver.getDriversByUser(user._id?.toString(), parsedBody?.companyId, filters, current, pageSize);

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

      const driver = await Driver.getDriverByUser(user._id?.toString(), parsedBody?.companyId, parsedBody?.driverId);

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
  // 3003 (409) Driver email is already registered in that company
  // 3004 (500) File Upload Error
  // 3006 (422) Weak Password
  public async Create(): Promise<APIGatewayProxyResultV2> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user, parsedBody } = this.event;

      // CHECK PASSWORD
      const isStrongPassword = Validator.CheckIsPasswordValid(parsedBody?.password);
      if (!isStrongPassword) {
        return {
          statusCode: 422,
          body: JSON.stringify({ success: false, ecode: 3006, message: `Weak Password` }),
        };
      }

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, ecode: 3001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      const company = await Company.getCompanyByUser(user?._id?.toString(), parsedBody?.companyId);
      if (!company) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, ecode: 3002, message: `Company Record not found!` }),
        };
      }

      let driver = await Driver.findOne({ email: parsedBody?.email }).exec();
      // ADD A NEW DRIVER IF IT ISN'T EXIST
      if (!driver) {
        driver = new Driver({
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
      }

      let isCompanyDriverExist = await CompanyDriver.exists({ driverId: driver._id, companyId: company._id });
      // ADD A NEW COMPANY DRIVER IF IT ISN'T EXIST
      if (!isCompanyDriverExist) {
        const companyDriver = new CompanyDriver({
          companyId: company._id,
          driverId: driver._id,
          isActive: true,
          createdBy: user.email,
          updatedBy: user.email,
        });

        await companyDriver.save();
      } else {
        await session.abortTransaction();

        return {
          statusCode: 409,
          body: JSON.stringify({ success: false, ecode: 3003, message: `Driver email is already registered in that company` }),
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

      await driver.update({
        $set: {
          profilePhoto: {
            url: uploadedLogo,
          },
        },
      });

      // ADD A NEW USER IN AUTH API
      const authResult = await new AuthService().Send(PROCESS.NEW_DRIVER, this.event);
      if (!authResult?.success) {
        await session.abortTransaction();

        return {
          statusCode: authResult?.errorCode || 500,
          body: JSON.stringify({ success: false, error: authResult?.error || 'Fatal Error' }),
        };
      }

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

      // CHECK PASSWORD IF IT IS EXIST
      const isStrongPassword = parsedBody?.password?.length > 0 ? Validator.CheckIsPasswordValid(parsedBody?.password) : true;
      if (!isStrongPassword) {
        return {
          statusCode: 422,
          body: JSON.stringify({ success: false, ecode: 3006, message: `Weak Password` }),
        };
      }

      const city = await City.findOne({ code: parsedBody?.addresses?.[0]?.city?.code });
      if (!city) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, ecode: 3001, message: `City Record not found!` }),
        };
      }

      const town = await Town.findOne({ code: parsedBody?.addresses?.[0]?.town });

      // CHECK DRIVER
      const driver = await Driver.isDriverBelongToUser(user?._id?.toString(), parsedBody?.driverId);
      if (!driver) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, ecode: 3005, message: `Driver not found!` }),
        };
      }

      // CHECK PASSWORD IF EMAIL IS CHANGED
      if (driver.email.toLowerCase() !== parsedBody?.email?.toLowerCase() && !parsedBody?.password?.length) {
        return {
          statusCode: 422,
          body: JSON.stringify({ success: false, ecode: 3006, message: `Weak Password` }),
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

      // ADD A NEW USER IN AUTH API
      const authResult = await new AuthService().Send(PROCESS.NEW_DRIVER, this.event);
      if (!authResult?.success) {
        await session.abortTransaction();

        return {
          statusCode: authResult?.errorCode || 500,
          body: JSON.stringify({ success: false, error: authResult?.error || 'Fatal Error' }),
        };
      }

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

      // CHECK DRIVER
      const driver = await Driver.isDriverBelongToUser(user?._id.toString(), driverId);
      if (!driver) {
        return {
          statusCode: 404,
          body: JSON.stringify({ success: false, ecode: 2003, message: `Driver Record not found!` }),
        };
      }

      await Driver.findOneAndUpdate(
        { _id: driver._id },
        {
          $set: {
            isActive: false,
            updatedBy: user.email,
          },
        }
      );

      await CompanyDriver.updateMany(
        { driverId: driver._id },
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
