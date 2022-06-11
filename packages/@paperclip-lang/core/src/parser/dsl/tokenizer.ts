import { negate } from "lodash";
import { buffer } from "stream/consumers";
import { UnexpectedTokenError, UnknownTokenError } from "../base/errors";
import { StringScanner } from "../base/string-scanner";
import * as base from "../base/tokenizer";
import { isDigit, isLetter, isWhitespace } from "../base/utils";

const { token } = base;

export enum TokenKind {
  Keyword,
  Dot,
  Number,
  CurlyOpen,
  CurlyClose,
  ParenOpen,
  ParenClose,
  Colon,
  SquareOpen,
  SquareClose,
  Boolean,

  // tokenizer handles this since it's much more efficient
  MultiLineOpen,
  MultiLineClose,
  SingleLineComment,
  Comma,
  At,
  String,
  Whitespace,
}

export type Token = base.Token<TokenKind>;

const Testers = {
  Whitespace: /[\s\r\n\t]/,
  Keyword: /[a-z]/i,
  Digit: /[0-9]/i,
};

export class Tokenizer extends base.BaseTokenizer<TokenKind> {
  isEOF() {
    return this._scanner.isEOF();
  }

  isCurrSuperfluous(): boolean {
    return (
      this._curr.kind === TokenKind.Whitespace ||
      this._curr.kind === TokenKind.MultiLineComment ||
      this._curr.kind === TokenKind.SingleLineComment
    );
  }

  _next(): Token {
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

    if (chr === ":") {
      return token(TokenKind.Colon, chr);
    }

    if (chr === "[") {
      return token(TokenKind.SquareOpen, chr);
    }

    if (chr === "]") {
      return token(TokenKind.SquareClose, chr);
    }

    if (chr === ".") {
      return token(TokenKind.Dot, chr);
    }

    if (chr === "@") {
      return token(TokenKind.At, chr);
    }

    if (chr === "*") {
      const curr = this._scanner.currChar();
      if (curr === "/") {
        this._scanner.nextChar();
        return token(TokenKind.MultiLineClose, "*/");
      }
    }

    if (chr === "/") {
      const curr = this._scanner.currChar();
      if (curr === "*") {
        this._scanner.nextChar(); // eat *
        let buffer = "/*";
        return token(TokenKind.MultiLineOpen, "/*");
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
      const keyword = chr + this._scanner.scanUntil(negate(isLetter));

      return token(TokenKind.Keyword, keyword);
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
