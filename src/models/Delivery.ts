import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICompany } from './Company';
import { IRoute } from './Route';
import { IOrder } from './Order';
import { IDeliveryDelayReason } from './DeliveryDelayReason';
import { IDeliveryReturnReason } from './DeliveryReturnReason';

export interface IDelivery {
  companyId: PopulatedDoc<ICompany>;
  routeId: PopulatedDoc<IRoute>;
  orderId: PopulatedDoc<IOrder>;
  actualArrivalDate:Date;
  actualDeliveryDate:Date;
  receivedBy:string;
  identityNumber:string;
  documentNumber:string;
  address: string;
  postCode: string;
  houseNumber: number;
  latitude: number;
  longitude: number;
  podDocument: string;
  deliveryDelayReasonId: PopulatedDoc<IDeliveryDelayReason>;
  deliveryReturnReasonId: PopulatedDoc<IDeliveryReturnReason>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type IDeliveryModel = Model<IDelivery, {}>;

const IDeliverySchema = new Schema<IDelivery, IDeliveryModel>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: 'companies' },
    routeId: { type: Schema.Types.ObjectId, required: true, ref: 'routes' },
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'orders' },
    actualArrivalDate: { type: Date, required: false },
    actualDeliveryDate: { type: Date, required: true },
    receivedBy: { type: String, required: false, maxlength:128 },
    identityNumber: { type: String, required: false, maxlength:128 },
    documentNumber: { type: String, required: false, maxlength:128 },
    address: { type: String, required: false, maxlength:512 },
    postCode: { type: String, required: false, maxlength:32 },
    houseNumber: { type: Number, required: false},
    latitude: { type: Number, required: false},
    longitude: { type: Number, required: false},
    podDocument: { type: String, required: false, maxlength:512},
    deliveryDelayReasonId: { type: Schema.Types.ObjectId, required: true, ref: 'delivery_delay_reasons' },
    deliveryReturnReasonId: { type: Schema.Types.ObjectId, required: true, ref: 'delivery_return_reasons' },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<IDelivery, IDeliveryModel>('route_details', IDeliverySchema);