import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IRouteDetailStatus {
  code: string;
  description: string;
}

type IRouteDetailStatusModel = Model<IRouteDetailStatus, {}>;

const RouteDetailStatusSchema = new Schema<IRouteDetailStatus, IRouteDetailStatusModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IRouteDetailStatus, IRouteDetailStatusModel>('route_detail_status', RouteDetailStatusSchema);