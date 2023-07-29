import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';

export interface ICompanyDriver {
  companyId: PopulatedDoc<ICompany>;
  driverId: Schema.Types.ObjectId;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyUserMethods {}

type CompanyDriverModel = Model<ICompanyDriver, {}, ICompanyDriver>;

const companyUserSchema = new Schema<ICompanyDriver, ICompanyUserMethods, CompanyDriverModel>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    driverId: { type: Schema.Types.ObjectId, required: true, ref: 'drivers' },
    isActive: { type: Boolean, required: true, default: true },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<ICompanyDriver, CompanyDriverModel>('company_drivers', companyUserSchema);
