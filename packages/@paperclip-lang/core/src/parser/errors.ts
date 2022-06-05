import { TokenKind } from "./tokenizer";

export class EndOfFileError extends Error {}
export class UnknownTokenError extends Error {
  constructor(readonly char: string) {
    super(`Unknown token "${char}"`);
  }
}

export class UnexpectedTokenError extends Error {
  constructor(readonly char: string, expectedToken?: TokenKind) {
    super(
      expectedToken
        ? `Unexpected token "${char}", expected ${expectedToken}`
        : `Unexpected token "${char}"`
    );
  }
}
