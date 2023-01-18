import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import Database from './helpers/Database';
import { CustomAPIEvent } from './types/Generic';
import Company from './models/Company';
import City from './models/City';

export default class Api extends Database {
  constructor(event: CustomAPIEvent, context: Context) {
    super(event, context);
  }

  public async CreateCompany(): Promise<APIGatewayProxyResultV2> {
    try {
      
      const city = await City.findOne({ code: this.event?.parsedBody?.cityId });
      if(!city){
        return {
          statusCode: 410,
          body: JSON.stringify({ success: true, message:`"${this.event?.parsedBody?.cityId }" City Record not found!"` }),
        };
      }
      const currentRecord = await Company.findOne({ companyNumber: this.event?.parsedBody?.companyNumber });
      if(currentRecord){
        return {
          statusCode: 409,
          body: JSON.stringify({ success: true, message:`"${this.event?.parsedBody?.companyNumber }" company has already been recorded!"` }),
        };
      }
      const company = new Company({
        name: this.event?.parsedBody?.name || null,
        companyNumber: this.event?.parsedBody?.companyNumber || null,
        taxOffice: this.event?.parsedBody?.taxOffice || null,
        country: this.event?.parsedBody?.country || null,
        cityId: city._id || null,
        townId: this.event?.parsedBody?.townId || null,
        postCode: this.event?.parsedBody?.postCode || null,
        houseNumber: this.event?.parsedBody?.houseNumber || null,
        email: this.event?.parsedBody?.email || null,
        mobile: this.event?.parsedBody?.mobile || null,
        phone: this.event?.parsedBody?.phone || null,
        webSite: this.event?.parsedBody?.webSite || null,
        isActive: this.event?.parsedBody?.isActive || null,
        mailServer: this.event?.parsedBody?.mailServer || null,
        mailServerUserName: this.event?.parsedBody?.mailServerUserName || null,
        mailServerPassword: this.event?.parsedBody?.mailServerPassword || null,
        mailServerUserPort: this.event?.parsedBody?.mailServerUserPort || null,
        isMailServerHasVPN: this.event?.parsedBody?.isMailServerHasVPN || null,
        reporterEmail: this.event?.parsedBody?.reporterEmail || null,
        createdBy:this.event?.parsedBody?.createdBy || null,
        updatedBy:this.event?.parsedBody?.updatedBy || null,
      });

      await company.save();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Company saved successfully!' }),
      };
      
    } catch (error) {
      console.log('CompanyApi.CreateCompany',error);
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };  
    }
  }

  public async GetAllCompanies(): Promise<APIGatewayProxyResultV2> {
    try {
      const company=await Company.find({});
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true,body:company }),
      };
      
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false }),
      };  
    }
  }


}
