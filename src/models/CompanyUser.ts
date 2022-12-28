import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';

export interface ICompanyUser {
  companyId:PopulatedDoc<ICompany>;
  userId: Schema.Types.ObjectId;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyUserMethods {
}

type CompanyUserModel = Model<ICompanyUser, {}, ICompanyUser>;

const companyUserSchema = new Schema<ICompanyUser, ICompanyUserMethods, CompanyUserModel>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    active: { type: Boolean, required: true, default: true },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<ICompanyUser, CompanyUserModel>('company_users', companyUserSchema);