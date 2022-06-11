import { negate } from "lodash";
import { UnknownTokenError } from "../base/errors";
import {
  BaseToken,
  BaseTokenizer,
  scanNumberValue,
  scanString,
  scanWhitespace,
  token,
} from "../base/tokenizer";
import { isDigit, isLetter, isWhitespace } from "../base/utils";

export enum DSLTokenKind {
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
  MultiLineComment,
  SingleLineComment,
  Comma,
  At,
  String,
  Whitespace,
}

export type Token = BaseToken<DSLTokenKind>;

const Testers = {
  Whitespace: /[\s\r\n\t]/,
  Keyword: /[a-z]/i,
  Digit: /[0-9]/i,
};

export class DSLTokenizer extends BaseTokenizer<DSLTokenKind> {
  isCurrSuperfluous(): boolean {
    return (
      this._curr.kind === DSLTokenKind.Whitespace ||
      this._curr.kind === DSLTokenKind.MultiLineComment ||
      this._curr.kind === DSLTokenKind.SingleLineComment
    );
  }

  _next(): Token {
    const chr = this._scanner.currChar();
    this._scanner.nextChar();

    if (chr === "(") {
      return token(DSLTokenKind.ParenOpen, chr);
    }

    if (chr === ")") {
      return token(DSLTokenKind.ParenClose, chr);
    }

    if (chr === "{") {
      return token(DSLTokenKind.CurlyOpen, chr);
    }

    if (chr === "}") {
      return token(DSLTokenKind.CurlyClose, chr);
    }

    if (chr === ",") {
      return token(DSLTokenKind.Comma, chr);
    }

    if (chr === ":") {
      return token(DSLTokenKind.Colon, chr);
    }

    if (chr === "[") {
      return token(DSLTokenKind.SquareOpen, chr);
    }

    if (chr === "]") {
      return token(DSLTokenKind.SquareClose, chr);
    }

    if (chr === ".") {
      return token(DSLTokenKind.Dot, chr);
    }

    if (chr === "@") {
      return token(DSLTokenKind.At, chr);
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
        return token(DSLTokenKind.MultiLineComment, buffer);
      } else if (curr === "/") {
        this._scanner.nextChar(); // eat *
        let buffer = "//" + this._scanner.scanUntil((c) => c === "\n");

        // maybe EOF
        if (this._scanner.currChar() === "\n") {
          this._scanner.nextChar(); // eat \n
          buffer += "\n";
        }
        return token(DSLTokenKind.SingleLineComment, buffer);
      }
    }

    if (chr === '"' || chr === "'") {
      return token(DSLTokenKind.String, scanString(this._scanner, chr));
    }

    if (chr === "-") {
      if (this._scanner.currChar().match(Testers.Digit)) {
        return token(DSLTokenKind.Number, chr + scanNumberValue(this._scanner));
      }
    }

    if (isWhitespace(chr)) {
      return token(
        DSLTokenKind.Whitespace,
        chr + scanWhitespace(this._scanner)
      );
    }

    if (isLetter(chr)) {
      const keyword = chr + this._scanner.scanUntil(negate(isLetter));
      return token(DSLTokenKind.Keyword, keyword);
    }

    if (chr.match(Testers.Digit)) {
      return token(DSLTokenKind.Number, chr + scanNumberValue(this._scanner));
    }

    throw new UnknownTokenError(chr);
  }
}
