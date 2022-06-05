import { EndOfFileError, UnknownTokenError } from "./errors";
import { StringScanner } from "./string-scanner";

export enum TokenKind {
  Keyword,
  Number,
  CurlyOpen,
  CurlyClose,
  ParenOpen,
  ParenClose,
  Colon,
  SquareOpen,
  SquareClose,

  // tokenizer handles this since it's much more efficient
  MultiLineComment,
  SingleLineComment,
  Comma,
  At,
  String,
  Whitespace,
}

export type Token = {
  kind: TokenKind;
  value: string;
};

const Testers = {
  Whitespace: /[\s\r\n\t]/,
  Keyword: /[a-z]/i,
};

export class Tokenizer {
  private _scanner: StringScanner;

  constructor(readonly source: string) {
    this._scanner = new StringScanner(source);
  }
  isEOF() {
    return this._scanner.isEOF();
  }

  eatWhitespace() {
    if (this.isEOF()) {
      return "";
    }
    const next = this.peek();
  }

  next(): Token {
    if (this.isEOF()) {
      throw new EndOfFileError();
    }
    const curr = this._scanner.currChar();
    this._scanner.nextChar();

    if (curr === "(") {
      return token(TokenKind.ParenOpen, curr);
    }

    if (curr === ")") {
      return token(TokenKind.ParenClose, curr);
    }

    if (curr === "{") {
      return token(TokenKind.CurlyOpen, curr);
    }

    if (curr === "}") {
      return token(TokenKind.CurlyClose, curr);
    }

    if (curr === ",") {
      return token(TokenKind.Comma, curr);
    }

    if (curr === "/") {
      if (this._scanner.currChar() === "*") {
      }
      return token(TokenKind.Comma, curr);
    }

    if (curr.match(Testers.Whitespace)) {
      return token(
        TokenKind.Whitespace,
        curr + this._scanner.scanUntil((c) => !c.match(Testers.Whitespace))
      );
    }

    if (curr.match(Testers.Keyword)) {
      return token(
        TokenKind.Keyword,
        curr + this._scanner.scanUntil((c) => !c.match(Testers.Keyword))
      );
    }

    throw new UnknownTokenError(curr);
  }

  peek(count: number = 1) {
    const pos = this._scanner.getPos();
    let last: Token;
    for (let i = 0; i < count; i++) {
      last = this.next();
    }
    this._scanner.setPos(pos);
  }
}

export const token = (kind: TokenKind, value: string): Token => ({
  kind,
  value,
});
