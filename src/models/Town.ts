import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICity } from './City';

export interface ITown {
  code: string;
  description: string;
  cityId: PopulatedDoc<ICity>;
}

type ITownModel = Model<ITown, {}>;

const TownSchema = new Schema<ITown, ITownModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 },
    cityId: { type: Schema.Types.ObjectId, required: true, ref: 'cities' },
  },
  {
    timestamps: true,
  }
);

export default model<ITown, ITownModel>('towns', TownSchema);