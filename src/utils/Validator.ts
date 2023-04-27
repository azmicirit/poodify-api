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
}
