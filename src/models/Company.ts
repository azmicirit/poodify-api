import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { FilterQueryBuilder } from '../helpers/FilterQueryBuilder';
import { ICity } from './City';
import CompanyUser from './CompanyUser';
import { ITown } from './Town';

export interface IMailServer {
  mailServerName: string;
  mailServerUserName: string;
  mailServerPassword: string;
  mailServerUserPort: number;
  isMailServerHasVPN: boolean;
}

export interface IAddress {
  country: string;
  cityId: PopulatedDoc<ICity>;
  townId: PopulatedDoc<ICity>;
  city?: ICity;
  town?: ITown;
  addressText: string;
  postCode: string;
  houseNumber: string;
}

enum PhoneType {
  Mobile = 1,
  Home,
  Office,
  Fax,
}

export interface IPhone{
countyCode:Number,
phoneType:PhoneType,
number:string
}

export interface ICompany {
  _id: string;
  name: string;
  companyNumber: string;
  taxOffice: string;
  userCount: number;
  address: [IAddress];
  email: [string];
  phone: [IPhone];
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
  getCompaniesByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
  getCompanyByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
}

const companySchema = new Schema<ICompany, CompanyModel>(
  {
    name: { type: String, required: true, maxlength: 256, index: true },
    companyNumber: { type: String, required: true, maxlength: 128, unique: true, index: true },
    taxOffice: { type: String, required: false, maxlength: 128 },
    userCount: { type: Number, required: true, default: 1 },
    address: [
      {
        type: {
          country: { type: String, required: true, maxlength: 3 },
          cityId: { type: Schema.Types.ObjectId, required: true, ref: 'cities' },
          townId: { type: Schema.Types.ObjectId, required: false, default: null, ref: 'towns' },
          addressText: { type: String, required: false, maxlength: 512 },
          postCode: { type: String, required: true, maxlength: 16 },
          houseNumber: { type: String, required: true },
        },
        required: false,
        default: { houseNumber: null, description: null, postCode: null, country: null },
      },
    ],
    email: [{ type: String, required: true }],
    phone: [{ type: String, required: false, maxlength: 16 }],
    isActive: { type: Boolean, required: true, default: true },
    mailServer: {
      type: {
        mailServerName: { type: String, required: false, maxlength: 32 },
        mailServerUserName: { type: String, required: false, maxlength: 32 },
        mailServerPassword: { type: String, required: false, maxlength: 32 },
        mailServerUserPort: { type: Number, required: false },
        isMailServerHasVPN: { type: Boolean, required: false, default: true },
      },
      default: { mailServerName: null, mailServerUserName: null, mailServerPassword: null, mailServerUserPort: null, isMailServerHasVPN: null },
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

companySchema.static('getCompaniesByUser', async function (userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null> {
  try {
    current = current || 0;
    pageSize = pageSize || 10;

    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const companies = await this.find({ ...FilterQueryBuilder.RefineFilterParser(filters, { _id: { $in: companyIds } }) }, {}, { skip: (current - 1) * 10, limit: pageSize })
      .populate('city')
      .exec();

    return {
      list: companies,
      size: companyIds?.length || 0,
    };
  } catch (error) {
    return null;
  }
});

companySchema.static('getCompanyByUser', async function (userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null> {
  try {
    current = current || 0;
    pageSize = pageSize || 10;

    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const company = await this.findOne({ ...FilterQueryBuilder.RefineFilterParser(filters, { _id: { $in: companyIds } }) }, {}, { skip: (current - 1) * 10, limit: pageSize })
      .populate('city')
      .exec();

    return {
      list: [company],
      size: companyIds?.length || 0,
    };
  } catch (error) {
    return null;
  }
});

companySchema.virtual('city', {
  ref: 'cities',
  localField: 'cityId',
  foreignField: '_id',
  justOne: true,
});

companySchema.set('toObject', { virtuals: true });
companySchema.set('toJSON', { virtuals: true });

export default model<ICompany, CompanyModel>('companies', companySchema);
