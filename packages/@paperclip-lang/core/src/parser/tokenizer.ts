import { negate } from "lodash";
import {
  EndOfFileError,
  UnexpectedTokenError,
  UnknownTokenError,
} from "./errors";
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
  Digit: /[0-9]/i,
};

export class Tokenizer {
  private _scanner: StringScanner;
  private _curr: Token;

  constructor(source: string) {
    this._scanner = new StringScanner(source);
  }
  isEOF() {
    return this._scanner.isEOF();
  }

  eatWhitespace() {
    if (this._curr && this._curr.kind === TokenKind.Whitespace) {
      const curr = this._curr;
      this.next();
      return curr.value;
    }

    return "";

    // if (this.isEOF()) {
    //   return "";
    // }
    // const c = this._scanner.currChar();

    // if (isWhitespace(c)) {
    //   return this.next().value;
    // }

    // return "";
  }

  curr() {
    return this._curr;
  }

  currValue(kind: TokenKind) {
    const token = this._curr;
    if (token.kind !== kind) {
      throw new UnexpectedTokenError(token.value);
    }
    return this._curr.value;
  }

  next() {
    return (this._curr = this._next());
  }

  _next(): Token {
    if (this.isEOF()) {
      throw new EndOfFileError();
    }
    const chr = this._scanner.currChar();
    this._scanner.nextChar();

    if (chr === "(") {
      return token(TokenKind.ParenOpen, chr);
    }

    if (chr === ")") {
      return token(TokenKind.ParenClose, chr);
    }

    if (chr === "{") {
      return token(TokenKind.CurlyOpen, chr);
    }

    if (chr === "}") {
      return token(TokenKind.CurlyClose, chr);
    }

    if (chr === ",") {
      return token(TokenKind.Comma, chr);
    }

    if (chr === "[") {
      return token(TokenKind.SquareOpen, chr);
    }

    if (chr === "]") {
      return token(TokenKind.SquareClose, chr);
    }

    if (chr === "/") {
      const curr = this._scanner.currChar();
      if (curr === "*") {
        this._scanner.nextChar(); // eat *
        let buffer = "/*";
        while (!this._scanner.isEOF()) {
          const curr = this._scanner.currChar();
          if (curr === "*" && this._scanner.peekChar() === "/") {
            buffer += "*/";
            this._scanner.skip(2);
            break;
          }
          buffer += curr;
          this._scanner.nextChar();
        }
        return token(TokenKind.MultiLineComment, buffer);
      } else if (curr === "/") {
        this._scanner.nextChar(); // eat *
        let buffer = "//" + this._scanner.scanUntil((c) => c === "\n");

        // maybe EOF
        if (this._scanner.currChar() === "\n") {
          this._scanner.nextChar(); // eat \n
          buffer += "\n";
        }
        return token(TokenKind.SingleLineComment, buffer);
      }
    }

    if (chr === '"' || chr === "'") {
      let buffer = chr;

      while (!this._scanner.isEOF()) {
        if (this._scanner.currChar() === chr) {
          break;
        }

        // Escape
        if (this._scanner.currChar() === "\\") {
          buffer += "\\" + this._scanner.nextChar();
          this._scanner.nextChar(); // eat escaped
          continue;
        }

        buffer += this._scanner.currChar();
        this._scanner.nextChar();
      }

      buffer += this._scanner.currChar();
      this._scanner.nextChar(); // eat " '

      return token(TokenKind.String, buffer);
    }

    if (chr === "-") {
      if (this._scanner.currChar().match(Testers.Digit)) {
        return token(TokenKind.Number, chr + this._scanNumberValue());
      }
    }

    if (isWhitespace(chr)) {
      return token(TokenKind.Whitespace, chr + this._scanWhitespaceValue());
    }

    if (isLetter(chr)) {
      return token(
        TokenKind.Keyword,
        chr + this._scanner.scanUntil(negate(isLetter))
      );
    }

    if (chr.match(Testers.Digit)) {
      return token(TokenKind.Number, chr + this._scanNumberValue());
    }

    throw new UnknownTokenError(chr);
  }

  private _scanWhitespaceValue() {
    return this._scanner.scanUntil(negate(isWhitespace));
  }

  private _scanNumberValue() {
    let buffer = this._scanDigitValue();
    if (this._scanner.currChar() === ".") {
      this._scanner.nextChar(); // eat .
      buffer += "." + this._scanDigitValue();
    }
    return buffer;
  }

  private _scanDigitValue() {
    return this._scanner.scanUntil(negate(isDigit));
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

const isDigit = (value: string) => {
  const c = value.charCodeAt(0);
  return c > 47 && c < 58;
};

const isLetter = (value: string) => {
  const c = value.charCodeAt(0);
  return (c > 96 && c < 123) || (c > 64 && c < 91);
};

const isWhitespace = (value: string) => {
  const c = value.charCodeAt(0);
  return c === 10 || c === 115 || c === 9 || c === 13 || c === 32;
};
