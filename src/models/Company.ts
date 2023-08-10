import { Schema, model, PopulatedDoc, Model, ObjectId, StringExpressionOperatorReturningBoolean } from 'mongoose';
import { FilterQueryBuilder } from '../helpers/FilterQueryBuilder';
import { ICity } from './City';
import CompanyUser from './CompanyUser';
import { ITown } from './Town';
import Formatter from '../utils/Formatter';

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

export enum PhoneType {
  Mobile = 1,
  Office = 2,
  Home = 3,
  Fax = 4,
}

export interface IPhone {
  countryCode: string;
  phoneType: PhoneType;
  number: string;
}

export interface ICompany {
  _id: string;
  name: string;
  companyNumber: string;
  taxOffice: string;
  userCount: number;
  addresses: IAddress[];
  emails: string[];
  phones: IPhone[];
  webSite: string;
  isActive: boolean;
  mailServer: IMailServer;
  reporterEmail: string;
  logo: {
    url: string;
    thumbnail?: string;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyListResult {
  list: ICompany[];
  size: number;
}

interface CompanyModel extends Model<ICompany> {
  isCompanyBelongToUser(userId: string, companyId: string): Promise<ICompany | null>;
  getCompaniesByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
  getCompanyByUser(userId: string, companyId: string): Promise<ICompany | null>;
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
    phones: [
      {
        type: {
          countryCode: { type: String, required: true },
          number: { type: String, required: true },
          phoneType: { type: Number, enum: PhoneType, required: true },
        },
      },
    ],
    isActive: { type: Boolean, required: true, default: true },
    webSite: { type: String, required: false, maxlength: 128 },
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
      required: false,
    },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: false },
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

companySchema.pre('save', function (this: ICompany, next: any): void {
  this.phones = Formatter.FormatPhones(this.phones);

  return next();
});

companySchema.pre('updateOne', function (this: any, next: any): void {
  if (this?.phones) {
    this.phones = Formatter.FormatPhones(this.phones);
  } else if (this?._update['$set']?.phones) {
    this.set({ phones: Formatter.FormatPhones(this.phone) });
  }

  return next();
});

companySchema.static('isCompanyBelongToUser', async function (userId: string, companyId: string): Promise<ICompany | null> {
  try {
    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId?.toString());
    const company = await this.findOne({ $and: [{ _id: companyId }] });
    return companyIds.indexOf(companyId) > -1 && company ? company : null;
  } catch (error) {
    return null;
  }
});

companySchema.static('getCompaniesByUser', async function (userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null> {
  try {
    current = current || 0;
    pageSize = pageSize || 10;

    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const companies = await this.find(
      { ...FilterQueryBuilder.RefineFilterParser(filters, { $and: [{ _id: { $in: companyIds } }] }) },
      {},
      { skip: (current - 1) * 10, limit: pageSize }
    )
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

companySchema.static('getCompanyByUser', async function (userId: string, companyId: string): Promise<ICompany | null> {
  try {
    const companyUser = await CompanyUser.findOne({ userId, companyId }).select('companyId');
    const company = await this.findById(companyUser?.companyId).populate('addresses.city').exec();

    return company;
  } catch (error) {
    return null;
  }
});

companySchema.set('toObject', { virtuals: true });
companySchema.set('toJSON', { virtuals: true });

export default model<ICompany, CompanyModel>('companies', companySchema);
