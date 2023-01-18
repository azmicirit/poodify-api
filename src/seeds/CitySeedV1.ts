import Database from '../helpers/Database';
import City, { ICity } from '../models/City';

const TIMESTAMP = '2022-11-22T00:00:00Z';

export default class CitySeedV1 extends Database {
  constructor() {
    super();
  }

  public async Up(): Promise<ICity[]> {
    try {
      const london = await new City({
        code: 'London',
        description: 'London',
        country: 'UK',
        createdBy:"seedup",
        createdAt:TIMESTAMP,
      }).save();

      return [london];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async Down(): Promise<any> {
    try {
      await City.deleteMany({ createdAt: TIMESTAMP });

      return null;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
}
