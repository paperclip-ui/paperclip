import { StringScanner } from "./base/scanner";

export enum TokenKind {
  LessThan,
  GreaterThan,
  CurlyOpen,
  CurlyClose,
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
    const curr = this._scanner.nextChar();
    if (curr == "<") {
      return token(curr, TokenKind.LessThan);
    } else if (curr === ">") {
      return token(curr, TokenKind.GreaterThan);
    } else if (curr === "=") {
      return token(curr, TokenKind.Equals);
    } else if (curr === "{") {
      return token(curr, TokenKind.CurlyOpen);
    } else if (curr === "}") {
      return token(curr, TokenKind.CurlyClose);
    } else if (/\w+/.test(curr)) {
      // scan until no whitespace
      return token(curr + this._scanner.scan(/[\s]+/), TokenKind.Keyword);
    }
  }
}

const token = (value: string, kind: TokenKind): Token => ({ value, kind });
