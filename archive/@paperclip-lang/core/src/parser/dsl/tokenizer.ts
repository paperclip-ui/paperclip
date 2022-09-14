import { negate } from "lodash";
import { UnknownTokenError } from "../base/errors";
import { BaseToken } from "../base/state";
import {
  BaseTokenizer,
  scanNewLine,
  scanNumberValue,
  scanString,
  scanWhitespace,
  token,
} from "../base/tokenizer";
import {
  isDigit,
  isLetter,
  isLetterOrDigit,
  isNewLine,
  isSpace,
  isWhitespace,
} from "../base/utils";

export enum DSLTokenKind {
  Keyword = 1 << 1,
  Dot = 1 << 2,
  Number = 1 << 3,
  CurlyOpen = 1 << 4,
  CurlyClose = 1 << 5,
  ParenOpen = 1 << 6,
  ParenClose = 1 << 7,
  Colon = 1 << 8,
  SquareOpen = 1 << 9,
  SquareClose = 1 << 10,
  Boolean = 1 << 11,

  // tokenizer handles this since it's much more efficient
  MultiLineComment = 1 << 12,
  SingleLineComment = 1 << 13,
  Comma = 1 << 14,
  At = 1 << 15,
  String = 1 << 16,
  Space = 1 << 17,
  NewLine = 1 << 18,
  Minus = 1 << 19,
  Percent = 1 << 20,
  Pound = 1 << 21,
  Char = 1 << 22,
}

export const DSL_SUPERFLUOUS_TOKENS =
  DSLTokenKind.Space |
  DSLTokenKind.NewLine |
  DSLTokenKind.SingleLineComment |
  DSLTokenKind.MultiLineComment;

export const DSL_WHITESPACE_TOKENS = DSLTokenKind.Space | DSLTokenKind.NewLine;

export type Token = BaseToken<DSLTokenKind>;

export class DSLTokenizer extends BaseTokenizer<DSLTokenKind> {
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

    if (chr === "%") {
      return token(DSLTokenKind.Percent, chr);
    }

    if (chr === "#") {
      return token(DSLTokenKind.Pound, chr);
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
      if (isDigit(this._scanner.currChar())) {
        return token(DSLTokenKind.Number, chr + scanNumberValue(this._scanner));
      }
      return token(DSLTokenKind.Minus, chr);
    }

    if (isNewLine(chr)) {
      return token(DSLTokenKind.NewLine, chr);
    }

    if (isSpace(chr)) {
      return token(DSLTokenKind.Space, chr);
    }

    if (isLetter(chr)) {
      const keyword =
        chr +
        this._scanner.scanUntil(
          negate((c) => isLetter(c) || isDigit(c) || c === "-" || c === "_")
        );

      if (keyword === "true" || keyword === "false") {
        return token(DSLTokenKind.Boolean, keyword);
      }

      return token(DSLTokenKind.Keyword, keyword);
    }

    if (isDigit(chr)) {
      return token(DSLTokenKind.Number, chr + scanNumberValue(this._scanner));
    }

    return token(DSLTokenKind.Char, chr);
  }
}
