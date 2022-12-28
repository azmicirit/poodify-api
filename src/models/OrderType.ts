import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IOrderType {
  code: string;
  description: string;
  doBatchDelivery: boolean;
}

type IOrderTypeModel = Model<IOrderType, {}>;

const OrderTypeSchema = new Schema<IOrderType, IOrderTypeModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 },
    doBatchDelivery: {type:Boolean,required:true,default:false}
  },
  {
    timestamps: true,
  }
);

export default model<IOrderType, IOrderTypeModel>('order_types', OrderTypeSchema);