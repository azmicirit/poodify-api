import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { FilterQueryBuilder } from '../helpers/FilterQueryBuilder';
import { ICity } from './City';
import CompanyUser from './CompanyUser';
import { ITown } from './Town';

export interface ICompany {
  _id: string;
  name: string;
  companyNumber: string;
  taxOffice: string;
  userCount: number;
  country: string;
  cityId: PopulatedDoc<ICity>;
  townId: PopulatedDoc<ICity>;
  city?: ICity;
  town?: ITown;
  addressText: string;
  postCode: string;
  houseNumber: number;
  email: string;
  mobile: string;
  phone: string;
  webSite: string;
  isActive: boolean;
  mailServer: string;
  mailServerUserName: string;
  mailServerPassword: string;
  mailServerUserPort: number;
  isMailServerHasVPN: boolean;
  reporterEmail: string;
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
}

const companySchema = new Schema<ICompany, CompanyModel>(
  {
    name: { type: String, required: true, maxlength: 256, index: true },
    companyNumber: { type: String, required: true, maxlength: 128, unique: true, index: true },
    taxOffice: { type: String, required: false, maxlength: 128 },
    userCount: { type: Number, required: true, default: 1 },
    country: { type: String, required: true, maxlength: 3 },
    cityId: { type: Schema.Types.ObjectId, required: false, ref: 'cities' },
    townId: { type: Schema.Types.ObjectId, required: false, ref: 'towns' },
    addressText: { type: String, required: false, maxlength: 512 },
    postCode: { type: String, required: true, maxlength: 16 },
    houseNumber: { type: Number, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true, maxlength: 16 },
    phone: { type: String, required: true, maxlength: 16 },
    webSite: { type: String, required: true, maxlength: 32 },
    isActive: { type: Boolean, required: true, default: true },
    mailServer: { type: String, required: false, maxlength: 32 },
    mailServerUserName: { type: String, required: false, maxlength: 32 },
    mailServerPassword: { type: String, required: false, maxlength: 32 },
    mailServerUserPort: { type: Number, required: false },
    isMailServerHasVPN: { type: Boolean, required: false, default: true },
    reporterEmail: { type: String, required: false, maxlength: 32 },
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

companySchema.virtual('city', {
  ref: 'cities',
  localField: 'cityId',
  foreignField: '_id',
  justOne: true,
});

companySchema.set('toObject', { virtuals: true });
companySchema.set('toJSON', { virtuals: true });

export default model<ICompany, CompanyModel>('companies', companySchema);
