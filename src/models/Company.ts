import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICity } from './City';
import { ITown } from './Town';

export interface ICompany {
  name: string;
  companyNumber: string;
  taxOffice: string;
  userCount: number;
  country:  string;
  cityId: PopulatedDoc<ICity>;
  townId: PopulatedDoc<ITown>;
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
  reporterEmail:string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type ICompanyModel = Model<ICompany, {}>;

const CompanySchema = new Schema<ICompany, ICompanyModel>(
  {
    name: { type: String, required: true, maxlength: 256 },
    companyNumber: { type: String, required: true, maxlength: 128 },
    taxOffice: { type: String, required: false, maxlength: 128 },
    userCount: { type: Number, required: true,default:1 },    
    country: { type: String, required: true, maxlength: 3 },
    cityId: { type: Schema.Types.ObjectId, required: false, ref: 'cities' },
    townId: { type: Schema.Types.ObjectId, required: false, ref: 'towns' },
    addressText: { type: String, required: false, maxlength: 512 },
    postCode: { type: String, required: true, maxlength: 16 },
    houseNumber: { type: Number, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true,maxlength:16 },
    phone: { type: String, required: true,maxlength:16 },
    webSite: { type: String, required: true,maxlength:32 },
    isActive: { type: Boolean, required: true,default:true},
    mailServer: { type: String, required: false,maxlength:32 },
    mailServerUserName: { type: String, required: false,maxlength:32 },
    mailServerPassword: { type: String, required: false,maxlength:32 },
    mailServerUserPort: { type: Number, required: false},
    isMailServerHasVPN: { type: Boolean, required: false,default:true},
    reporterEmail: { type: String, required: false,maxlength:32 },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<ICompany, ICompanyModel>('companies', CompanySchema);