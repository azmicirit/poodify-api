import parsePhoneNumberFromString from 'libphonenumber-js';
import { IPhone } from '../models/Company';

export default class Formatter {
  static RemoveSpecialCharactersFromString(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '');
  }

  static FormatPhones(phones: IPhone[]): IPhone[] {
    return (
      phones?.map((phone: IPhone) => {
        const phoneNumber = parsePhoneNumberFromString(`${phone.countryCode}${phone.number}`);
        return {
          countryCode: phone.countryCode,
          number: Formatter.RemoveSpecialCharactersFromString(phoneNumber.formatNational()),
          phoneType: phone.phoneType,
        };
      }) || []
    );
  }
}
