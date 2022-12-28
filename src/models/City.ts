import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface ICity {
  code: string;
  description: string;
  country: string;
}

type ICityModel = Model<ICity, {}>;

const CitySchema = new Schema<ICity, ICityModel>(
  {
    code: { type: String, required: true, maxlength: 128 },
    description: { type: String, required: true, maxlength: 128 },
    country: { type: String, required: true, maxlength: 3 },
  },
  {
    timestamps: true,
  }
);

export default model<ICity, ICityModel>('cities', CitySchema);