import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IRouteStatus {
  code: string;
  description: string;
}

type IRouteStatusModel = Model<IRouteStatus, {}>;

const RouteStatusSchema = new Schema<IRouteStatus, IRouteStatusModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IRouteStatus, IRouteStatusModel>('route_status', RouteStatusSchema);