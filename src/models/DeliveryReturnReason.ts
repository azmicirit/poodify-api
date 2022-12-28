import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IDeliveryReturnReason {
  code: string;
  description: string;
}

type IODeliveryReturnReasonModel = Model<IDeliveryReturnReason, {}>;

const deliveryReturnReasonSchema = new Schema<IDeliveryReturnReason, IODeliveryReturnReasonModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IDeliveryReturnReason, IODeliveryReturnReasonModel>('delivery_return_reasons', deliveryReturnReasonSchema);