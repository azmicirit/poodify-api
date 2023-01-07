import City from "../models/City";
import CitySeedV1 from "./CitySeedV1";

export const Up = async (): Promise<any> => {
  try {
    // ---- ADD NEW SEEDS HERE -- START ----

    const cities = await new CitySeedV1().Up();

    // ---- ADD NEW SEEDS HERE ---- END ----
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

export const Down = async (): Promise<any> => {
  try {
    // ---- ADD NEW SEEDS HERE -- START ----


    // ---- ADD NEW SEEDS HERE ---- END ----
    return null;
  } catch (error) {
    throw new Error(error);
  }
};
