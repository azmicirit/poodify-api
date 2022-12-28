import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IOrderStatus {
  code: string;
  description: string;
}

type IOrderStatusModel = Model<IOrderStatus, {}>;

const OrderStatusSchema = new Schema<IOrderStatus, IOrderStatusModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IOrderStatus, IOrderStatusModel>('order_status', OrderStatusSchema);