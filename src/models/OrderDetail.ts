import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { IOrder } from './Order';

export interface IOrderDetail {
  orderId: PopulatedDoc<IOrder>;
  lineNumber: number;
  itemDescription: string;
  itemGroup: string;
  packageType: string;
  quantity:number;
  weight:number;
  volume:number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IOrderDetailModel = Model<IOrderDetail, {}>;

const IOrderDetailSchema = new Schema<IOrderDetail, IOrderDetailModel>(
  {
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'orders' },
    lineNumber: { type: Number, required: true },
    itemDescription: { type: String, required: true, maxlength: 128 },
    itemGroup: { type: String, required: false, maxlength: 128 },
    packageType: { type: String, required: false, maxlength: 128 },
    quantity: { type: Number, required: true },
    weight: { type: Number, required: false },
    volume: { type: Number, required: false },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IOrderDetail, IOrderDetailModel>('order_details', IOrderDetailSchema);