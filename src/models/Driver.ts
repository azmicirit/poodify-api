import * as bcryptjs from 'bcryptjs';
import mongoose, { Schema, model, PopulatedDoc, Model, Query } from 'mongoose';
import Converter from '../utils/Converter';
import { ICity } from './City';
import { ITown } from './Town';
import CompanyDriver from './CompanyDriver';
import { FilterQueryBuilder } from '../helpers/FilterQueryBuilder';
import CompanyUser from './CompanyUser';

export interface IDriverAddress {
  country: string;
  city: PopulatedDoc<ICity>;
  town?: PopulatedDoc<ITown>;
  addressText: string;
  postCode: string;
  houseNumber: string;
}

export interface IDriver {
  _id: Schema.Types.ObjectId;
  forenames: string;
  lastname: string;
  email: string;
  password: string;
  active: boolean;
  addresses: IDriverAddress[];
  profilePhoto: {
    url: string;
    thumbnail?: string;
  };
  identityNumber?: string;
  dob?: Date;
  mobile?: string;
}

export interface CompanyListResult {
  list: IDriver[];
  size: number;
}

interface DriverModel extends Model<IDriver> {
  getDriversByUser(userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null>;
  getDriverByUser(userId: string, driverId: string): Promise<IDriver | null>;
}

const driverSchema = new Schema<IDriver, DriverModel>(
  {
    forenames: { type: String, required: true, maxlength: 128 },
    lastname: { type: String, required: true, maxlength: 128 },
    email: { type: String, required: true, maxlength: 128, unique: true, index: true },
    active: { type: Boolean, required: true, default: false, index: true },
    addresses: [
      {
        type: {
          country: { type: String, required: true, maxlength: 3 },
          city: { type: Schema.Types.ObjectId, required: true, ref: 'cities' },
          town: { type: Schema.Types.ObjectId, required: false, default: null, ref: 'towns' },
          addressText: { type: String, required: false, maxlength: 512 },
          postCode: { type: String, required: true, maxlength: 16 },
          houseNumber: { type: String, required: true },
        },
        required: false,
        default: { houseNumber: null, description: null, postCode: null, country: null },
      },
    ],
    profilePhoto: {
      type: {
        url: { type: String, required: false },
        thumbnail: { type: String, required: false },
      },
      default: { url: null, thumbnail: null },
    },
    identityNumber: { type: String, required: false, maxlength: 16, default: null },
    dob: { type: Date, required: false },
    mobile: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

driverSchema.pre('save', function (this: IDriver, next: any): void {
  this.forenames = Converter.Capitalize(this.forenames);
  this.lastname = Converter.Capitalize(this.lastname);
  this.email = this.email?.toLowerCase();

  return next();
});

driverSchema.pre('updateOne', function (this: any, next: any): void {
  this.forenames = Converter.Capitalize(this.forenames);
  this.lastname = Converter.Capitalize(this.lastname);
  this.email = this.email?.toLowerCase();

  return next();
});

driverSchema.static('getDriversByUser', async function (userId: string, filters?: any, current?: number, pageSize?: number): Promise<CompanyListResult | null> {
  try {
    current = current || 0;
    pageSize = pageSize || 10;

    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const companyDrivers = await CompanyDriver.find({ companyId: { $in: companyIds } }).select('driverId');
    const driverIds = companyDrivers.map((companyDriver: any) => companyDriver.driverId);
    const drivers = await this.find(
      { ...FilterQueryBuilder.RefineFilterParser(filters, { $and: [{ _id: { $in: driverIds } }] }) },
      {},
      { skip: (current - 1) * 10, limit: pageSize }
    )
      .populate('addresses.city')
      .exec();

    return {
      list: drivers,
      size: driverIds?.length || 0,
    };
  } catch (error) {
    return null;
  }
});

driverSchema.static('getDriverByUser', async function (userId: string, driverId: string): Promise<IDriver | null> {
  try {
    const companyUsers = await CompanyUser.find({ userId }).select('companyId');
    const companyIds = companyUsers.map((companyUser: any) => companyUser.companyId);
    const companyDriver = await CompanyDriver.findOne({ companyId: { $in: companyIds }, driverId }).exec();
    const driver = await this.findById(companyDriver?.driverId).populate('addresses.city').exec();

    return driver;
  } catch (error) {
    return null;
  }
});

driverSchema.set('toObject', { virtuals: true });
driverSchema.set('toJSON', { virtuals: true });

export default model<IDriver, DriverModel>('drivers', driverSchema);
