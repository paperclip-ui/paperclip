import { BaseToken, BaseTokenizer, token } from "../base/tokenizer";

export enum DoccoTokenKind {
  At,
  Whitespace,
  Word,
  Char,
  ParenOpen,
  ParenClose,
  Colon,
  Comma,
}

const CHAR_TOKEN_MAP = {
  "@": DoccoTokenKind.At,
  "(": DoccoTokenKind.ParenOpen,
  ")": DoccoTokenKind.ParenClose,
  ":": DoccoTokenKind.Colon,
  ",": DoccoTokenKind.Comma,
};

export type DoccoToken = BaseToken<DoccoTokenKind>;

export class DoccoTokenizer extends BaseTokenizer<DoccoTokenKind> {
  isCurrSuperfluous(): boolean {
    return false;
  }
  _next(): DoccoToken {
    const chr = this._scanner.currChar();
    this._scanner.nextChar();

    const charTokenKind = CHAR_TOKEN_MAP[chr];
    if (charTokenKind) {
      return token(charTokenKind, chr);
    }

    return token(DoccoTokenKind.Char, chr);
  }
}
