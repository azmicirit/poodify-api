import { Schema, model, PopulatedDoc, Model, ObjectId, StringExpressionOperatorReturningBoolean } from 'mongoose';
import { FilterQueryBuilder } from '../helpers/FilterQueryBuilder';
import { ICity } from './City';
import CompanyUser from './CompanyUser';
import { ITown } from './Town';

export interface IMailServer {
  mailServerEndpoint: string;
  mailServerUserName: string;
  mailServerPassword: string;
  mailServerPort: number;
  isMailServerHasVPN: boolean;
}

export interface IAddress {
  country: string;
  city: PopulatedDoc<ICity>;
  town?: PopulatedDoc<ITown>;
  addressText: string;
  postCode: string;
  houseNumber: string;
}

enum PhoneType {
  Mobile = 1,
  Home = 2,
  Office = 3,
  Fax = 4,
}

export interface IPhone {
  countryCode: number;
  phoneType: PhoneType;
  number: string;
}

export interface ICompany {
  _id: string;
  name: string;
  companyNumber: string;
  taxOffice: string;
  userCount: number;
  addresses: [IAddress];
  emails: [string];
  phones: [IPhone];
  webSite: string;
  isActive: boolean;
  mailServer: IMailServer;
  reporterEmail: string;
  logo: {
    url: string;
    thumbnail?: string;
  };
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyListResult {
  list: ICompany[];
  size: number;
}

type ICompanyModel = Model<ICompany, {}>;

interface CompanyModel extends Model<ICompany> {
  isCompanyBelongsToUser(userId: string, companyId: string): Promise<boolean>;
  getCompaniesByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
  getCompanyByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
}

const companySchema = new Schema<ICompany, CompanyModel>(
  {
    name: { type: String, required: true, maxlength: 256, index: true },
    companyNumber: { type: String, required: true, maxlength: 128, unique: true, index: true },
    taxOffice: { type: String, required: false, maxlength: 128 },
    userCount: { type: Number, required: true, default: 1 },
    addresses: [
      {
        type: {
          country: { type: String, required: true, maxlength: 3 },
          city: { type: Schema.Types.ObjectId, required: true, ref: 'cities' },
          town: { type: Schema.Types.ObjectId, required: false, default: null, ref: 'towns' },
          addressText: { type: String, required: false, maxlength: 512 },
          postCode: { type: String, required: true, maxlength: 16 },
          houseNumber: { type: String, required: true },
        },
        required: false,
        default: { houseNumber: null, description: null, postCode: null, country: null },
      },
    ],
    emails: [{ type: String, required: true }],
    phones: [{ type: String, required: false, maxlength: 16 }],
    isActive: { type: Boolean, required: true, default: true },
    mailServer: {
      type: {
        mailServerEndpoint: { type: String, required: false, maxlength: 32 },
        mailServerUserName: { type: String, required: false, maxlength: 32 },
        mailServerPassword: { type: String, required: false, maxlength: 32 },
        mailServerPort: { type: Number, required: false },
        isMailServerHasVPN: { type: Boolean, required: false, default: true },
      },
      default: { mailServerName: null, mailServerUserName: null, mailServerPassword: null, mailServerPort: null, isMailServerHasVPN: null },
    },
    reporterEmail: { type: String, required: false, maxlength: 32 },
    logo: {
      type: {
        url: { type: String, required: false },
        thumbnail: { type: String, required: false },
      },
      default: { url: null, thumbnail: null },
    },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
  },
  {
    timestamps: true,
    toObject: {
      transform: function (doc, ret) {
        doc.id = doc._id?.toString();
      },
    },
  }
);

companySchema.static('isCompanyBelongsToUser', async function (userId: string, companyId: string): Promise<boolean> {
  try {
    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId?.toString());

    return companyIds.indexOf(companyId) > -1 ? true : false;
  } catch (error) {
    return false;
  }
});

companySchema.static('getCompaniesByUser', async function (userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null> {
  try {
    current = current || 0;
    pageSize = pageSize || 10;

    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const companies = await this.find({ ...FilterQueryBuilder.RefineFilterParser(filters, { _id: { $in: companyIds } }) }, {}, { skip: (current - 1) * 10, limit: pageSize })
      .populate('addresses.city')
      .exec();

    return {
      list: companies,
      size: companyIds?.length || 0,
    };
  } catch (error) {
    return null;
  }
});

companySchema.static('getCompanyByUser', async function (userId: string, companyId: StringExpressionOperatorReturningBoolean): Promise<ICompany | null> {
  try {
    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyObjectId = companyUsers.map((companyUser: any) => companyUser.companyId)?.filter((cid: any) => cid?.toString() === companyId)?.[0] || null;
    const company = await this.findById(companyObjectId)
      .populate('addresses.city')
      .exec();

    return company;
  } catch (error) {
    return null;
  }
});

companySchema.set('toObject', { virtuals: true });
companySchema.set('toJSON', { virtuals: true });

export default model<ICompany, CompanyModel>('companies', companySchema);
