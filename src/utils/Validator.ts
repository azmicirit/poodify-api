export default class Validator {
  static IsHTTPURL(data: string): boolean {
    try {
      if (data.startsWith('data:') || !data.startsWith('http')) return false;

      new URL(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  static CheckIsPasswordValid(password: string): boolean {
    // One Uppercase, One Special Character, One Lowercase, Min 8 Length
    return /^(?=.*[A-Z])(?=.*[!@#$&*.])(?=.*[0-9])(?=.*[a-z]).{8,}$/.test(password);
  }
}
