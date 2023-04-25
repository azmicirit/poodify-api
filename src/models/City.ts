import { Schema, model, PopulatedDoc, Model } from 'mongoose';

export interface ICity {
  _id: string;
  code: string;
  description: string;
  country: string;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ICityModel = Model<ICity, {}>;

const CitySchema = new Schema<ICity, ICityModel>(
  {
    code: { type: String, required: true, maxlength: 128, index: true },
    description: { type: String, required: true, maxlength: 128 },
    country: { type: String, required: true, maxlength: 3, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default model<ICity, ICityModel>('cities', CitySchema);
