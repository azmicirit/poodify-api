import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';

export interface IOperationCenter {
  code: string;
  description: string;
  companyId:PopulatedDoc<ICompany>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IOperationCenterModel = Model<IOperationCenter, {}>;

const operationCenterSchema = new Schema<IOperationCenter, IOperationCenterModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 },
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IOperationCenter, IOperationCenterModel>('operation_centers', operationCenterSchema);