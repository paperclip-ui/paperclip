export class EndOfFileError extends Error {}
export class UnknownTokenError extends Error {
  constructor(readonly char: string) {
    super(`Unknown token "${char}"`);
  }
}
