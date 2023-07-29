export default class Converter {
  public static Capitalize(text: string): string {
    return (
      text
        ?.split(' ')
        .map((word: string) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(' ') || text
    );
  }
}
