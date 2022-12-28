import { Schema, model, PopulatedDoc, Model } from 'mongoose';
import { ICity } from './City';

export interface ICityMatch {
  description: string;
  cityId: PopulatedDoc<ICity>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type ICityMatchModel = Model<ICityMatch, {}>;

const CityMatchSchema = new Schema<ICityMatch, ICityMatchModel>(
  {
    description: { type: String, required: true, maxlength: 128 },
    cityId: { type: Schema.Types.ObjectId, required: true, ref: 'cities' },
    createdBy: { type: String, required: true, maxlength: 64 },
    updatedBy: { type: String, required: true, maxlength: 64 },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<ICityMatch, ICityMatchModel>('city_matches', CityMatchSchema);