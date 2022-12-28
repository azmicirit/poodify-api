import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';
import { IOperationCenter } from './OperationCenter';
import { IRouteType } from './RouteType';
import { IRouteStatus } from './RouteStatus';

export interface IRoute{
  companyId: PopulatedDoc<ICompany>;
  user: string;
  routeCode: string;
  operationCenterId: PopulatedDoc<IOperationCenter>;
  routeTypeId: PopulatedDoc<IRouteType>;
  routeStatusId: PopulatedDoc<IRouteStatus>;
  referenceNumber: string;
  documentNumber: string;
  routeDate:Date;
  expectedDepartDate:Date;
  actualDepartDate:Date;
  plateNumber:string;
  lastLocation:string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IRouteModel = Model<IRoute, {}>;

const RouteSchema = new Schema<IRoute, IRouteModel>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    user: { type: String, required: true, ref: 'users' },
    routeCode: { type: String, required: true, maxlength: 32 },
    operationCenterId: { type: Schema.Types.ObjectId, required: true, ref: 'operation_centers' },
    routeTypeId: { type: Schema.Types.ObjectId, required: true, ref: 'route_types' },
    routeStatusId: { type: Schema.Types.ObjectId, required: true, ref: 'route_status' },
    referenceNumber: { type: String, required: true, maxlength: 128 },
    documentNumber: { type: String, required: false, maxlength: 128 },
    routeDate: { type: Date, required: true },
    expectedDepartDate: { type: Date, required: true },
    actualDepartDate: { type: Date, required: false },
    plateNumber: { type: String, required: false, maxlength: 32 },
    lastLocation: { type: String, required: false, maxlength: 256 },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IRoute, IRouteModel>('orders', RouteSchema);