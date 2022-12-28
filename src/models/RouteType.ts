import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IRouteType {
  code: string;
  description: string;
}

type IRouteTypeModel = Model<IRouteType, {}>;

const RouteTypeSchema = new Schema<IRouteType, IRouteTypeModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IRouteType, IRouteTypeModel>('Route_types', RouteTypeSchema);