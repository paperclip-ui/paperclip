import { UnexpectedTokenError } from "./errors";
import { StringScanner } from "../base/string-scanner";
import { negate } from "lodash";
import { isDigit, isWhitespace } from "./utils";

export type BaseToken<TKind> = {
  kind: TKind;
  value: string;
};

export abstract class BaseTokenizer<TTokenKind> {
  protected _scanner: StringScanner;
  protected _curr: BaseToken<TTokenKind>;

  constructor(source: string) {
    this._scanner = new StringScanner(source);
  }
  isEOF() {
    return this._scanner.isEOF();
  }

  peekEatSuperfluous() {
    const pos = this._scanner.getPos();
    const ws = this.eatSuperfluous();
    this._scanner.setPos(pos);
    return ws;
  }

  eatSuperfluous() {
    if (this._curr) {
      while (this.isCurrSuperfluous()) {
        this.next();
      }
      return this.curr().value;
    }

    return "";
  }

  curr() {
    return this._curr;
  }

  abstract isCurrSuperfluous(): boolean;

  currValue(...kinds: TTokenKind[]) {
    const token = this._curr;
    if (!kinds.includes(token.kind)) {
      throw new UnexpectedTokenError(token.value);
    }
    return this._curr.value;
  }

  next() {
    if (this.isEOF()) {
      return (this._curr = null);
    }
    return (this._curr = this._next());
  }
  nextEatSuperfluous() {
    this.next();
    this.eatSuperfluous();
    return this.curr();
  }

  abstract _next(): BaseToken<any>;
}

export const token = (kind: any, value: string): BaseToken<any> => ({
  kind,
  value,
});

export const scanString = (scanner: StringScanner, chr: string) => {
  let buffer = chr;

  while (!scanner.isEOF()) {
    if (scanner.currChar() === chr) {
      break;
    }

    // Escape
    if (scanner.currChar() === "\\") {
      buffer += "\\" + scanner.nextChar();
      scanner.nextChar(); // eat escaped
      continue;
    }

    buffer += scanner.currChar();
    scanner.nextChar();
  }

  buffer += scanner.currChar();
  scanner.nextChar(); // eat " '

  return buffer;
};

export const scanWhitespace = (scanner: StringScanner) => {
  return scanner.scanUntil(negate(isWhitespace));
};

export const scanNumberValue = (scanner: StringScanner) => {
  let buffer = scanDigitValue(scanner);
  if (scanner.currChar() === ".") {
    scanner.nextChar(); // eat .
    buffer += "." + scanDigitValue(scanner);
  }
  return buffer;
};

export const scanDigitValue = (scanner: StringScanner) => {
  return scanner.scanUntil(negate(isDigit));
};
