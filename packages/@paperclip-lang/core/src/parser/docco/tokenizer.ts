import { isNumber, negate } from "lodash";
import {
  BaseToken,
  BaseTokenizer,
  scanNumberValue,
  scanWhitespace,
  token,
} from "../base/tokenizer";
import { isDigit, isLetter, isWhitespace } from "../base/utils";

export enum DoccoTokenKind {
  At = 1 << 1,
  Whitespace = 1 << 2,
  Word = 1 << 3,
  Char = 1 << 4,
  ParenOpen = 1 << 5,
  ParenClose = 1 << 6,
  Colon = 1 << 7,
  Comma = 1 << 8,
  Number = 1 << 9,
}

const CHAR_TOKEN_MAP = {
  "@": DoccoTokenKind.At,
  "(": DoccoTokenKind.ParenOpen,
  ")": DoccoTokenKind.ParenClose,
  ":": DoccoTokenKind.Colon,
  ",": DoccoTokenKind.Comma,
};

export const DOCCO_SUPERFLUOUS_TOKEN_KIND = DoccoTokenKind.Whitespace;

export type DoccoToken = BaseToken<DoccoTokenKind>;

export class DoccoTokenizer extends BaseTokenizer<DoccoTokenKind> {
  _next(): DoccoToken {
    const chr = this._scanner.currChar();
    this._scanner.nextChar();

    const charTokenKind = CHAR_TOKEN_MAP[chr];
    if (charTokenKind) {
      return token(charTokenKind, chr);
    }

    if (isLetter(chr)) {
      return token(
        DoccoTokenKind.Word,
        chr + this._scanner.scanUntil(negate(isLetter))
      );
    }

    if (chr === "-") {
      return token(DoccoTokenKind.Number, chr + scanNumberValue(this._scanner));
    }

    if (isDigit(chr)) {
      return token(DoccoTokenKind.Number, chr + scanNumberValue(this._scanner));
    }

    if (isWhitespace(chr)) {
      return token(
        DoccoTokenKind.Whitespace,
        chr + scanWhitespace(this._scanner)
      );
    }

    return token(DoccoTokenKind.Char, chr);
  }
}
