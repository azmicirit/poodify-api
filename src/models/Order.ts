import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';
import { IOperationCenter } from './OperationCenter';
import { IOrderType } from './OrderType';
import { IOrderStatus } from './OrderStatus';
import { ICity } from './City';
import { ITown } from './Town';

export interface IOrder {
  companyId: PopulatedDoc<ICompany>;
  customerOrderNumber: string;
  referenceNumber: string;
  batchNumber: string;
  operationCenterId: PopulatedDoc<IOperationCenter>;
  orderTypeId: PopulatedDoc<IOrderType>;
  orderStatusId: PopulatedDoc<IOrderStatus>;
  orderDate:Date;
  expectedDeliveryDate:Date;
  expectedShipmentDate:Date;
  actualShipmentDate:Date;
  actualDeliveryDate:Date;
  sender:string;
  fromCountry: string;
  fromCityId: PopulatedDoc<ICity>;
  fromTownId: PopulatedDoc<ITown>;
  fromAddress: string;
  fromPostCode: string;
  fromHouseNumber: number;
  customer:string;
  toCountry: string;
  toCityId: PopulatedDoc<ICity>;
  toTownId: PopulatedDoc<ITown>;
  toAddress: string;
  toPostCode: string;
  toHouseNumber: number;
  latitude: number;
  longitude: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IOrderModel = Model<IOrder, {}>;

const OrderSchema = new Schema<IOrder, IOrderModel>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    customerOrderNumber: { type: String, required: true, maxlength: 256 },
    referenceNumber: { type: String, required: true, maxlength: 128 },
    batchNumber: { type: String, required: false, maxlength: 128 },
    operationCenterId: { type: Schema.Types.ObjectId, required: true, ref: 'operation_centers' },
    orderTypeId: { type: Schema.Types.ObjectId, required: true, ref: 'order_types' },
    orderStatusId: { type: Schema.Types.ObjectId, required: true, ref: 'order_status' },
    orderDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    expectedShipmentDate: { type: Date, required: false },
    actualShipmentDate: { type: Date, required: false },
    actualDeliveryDate: { type: Date, required: false },
    sender: { type: String, required: false, maxlength: 512 },
    fromCountry: { type: String, required: true, maxlength:3 },
    fromCityId: { type: Schema.Types.ObjectId, required: false, ref: 'cities' },
    fromTownId: { type: Schema.Types.ObjectId, required: false, ref: 'towns' },
    fromAddress: { type: String, required: false, maxlength: 512 },
    fromPostCode: { type: String, required: true, maxlength: 16 },
    fromHouseNumber: { type: Number, required: true },
    customer: { type: String, required: false, maxlength: 512 },
    toCountry: { type: String, required: true, maxlength:3 },
    toCityId: { type: Schema.Types.ObjectId, required: false, ref: 'cities' },
    toTownId: { type: Schema.Types.ObjectId, required: false, ref: 'towns' },
    toAddress: { type: String, required: false, maxlength: 512 },
    toPostCode: { type: String, required: true, maxlength: 16 },
    toHouseNumber: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IOrder, IOrderModel>('orders', OrderSchema);