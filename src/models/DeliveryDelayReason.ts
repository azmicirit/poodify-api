import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface IDeliveryDelayReason {
  code: string;
  description: string;
}

type IODeliveryDelayReasonModel = Model<IDeliveryDelayReason, {}>;

const deliveryDelayReasonSchema = new Schema<IDeliveryDelayReason, IODeliveryDelayReasonModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 }
  },
  {
    timestamps: true,
  }
);

export default model<IDeliveryDelayReason, IODeliveryDelayReasonModel>('delivery_delay_reasons', deliveryDelayReasonSchema);