import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { IRoute } from './Route';
import { IOrder } from './Order';
import { IRouteDetailStatus } from './RouteDetailStatus';

export interface IRouteDetail {
  routeId: PopulatedDoc<IRoute>;
  orderId: PopulatedDoc<IOrder>;
  routeOrder: number;
  routeDetailStatusId: PopulatedDoc<IRouteDetailStatus>;
  expectedDeliveryDate:Date;
  actualDeliveryDate:Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IRouteDetailModel = Model<IRouteDetail, {}>;

const IRouteDetailSchema = new Schema<IRouteDetail, IRouteDetailModel>(
  {
    routeId: { type: Schema.Types.ObjectId, required: true, ref: 'routes' },
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'orders' },
    routeDetailStatusId: { type: Schema.Types.ObjectId, required: true, ref: 'route_detail_status' },
    routeOrder: { type: Number, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date, required: false },
    createdBy: { type: String, required: false, maxlength:32 },
    updatedBy: { type: String, required: false, maxlength:32 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IRouteDetail, IRouteDetailModel>('route_details', IRouteDetailSchema);