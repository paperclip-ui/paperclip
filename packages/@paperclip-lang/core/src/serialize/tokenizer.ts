import { StringScanner } from "./scanner";

export enum TokenKind {
  LessThan,
  GreaterThan,
  Equals,
  Keyword,
}

export type Token = {
  kind: TokenKind;
  value: string;
};

export class Tokenizer {
  private _scanner: StringScanner;
  constructor(readonly source: string) {
    this._scanner = new StringScanner(source);
  }
  isEOF() {
    return this._scanner.isEOF();
  }
  next(): Token {
    const curr = this._scanner.currChar();
    switch (curr) {
      case "<":
        return token(curr, TokenKind.LessThan);
      case ">":
        return token(curr, TokenKind.GreaterThan);
      case "=":
        return token(curr, TokenKind.Equals);
    }
  }
}

const token = (value: string, kind: TokenKind): Token => ({ value, kind });
