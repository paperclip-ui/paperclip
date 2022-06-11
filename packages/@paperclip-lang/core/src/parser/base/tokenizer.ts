import { UnexpectedTokenError } from "./errors";
import { StringScanner } from "../base/string-scanner";
import { negate } from "lodash";
import { isDigit, isWhitespace } from "./utils";

export type BaseToken<TKind extends number> = {
  kind: TKind;
  value: string;
};

export abstract class BaseTokenizer<TTokenKind extends number> {
  protected _curr: BaseToken<TTokenKind>;

  constructor(protected _scanner: StringScanner) {}

  getScanner() {
    return this._scanner;
  }

  isEOF() {
    return this._scanner.isEOF();
  }

  peekEat(kind: number) {
    const pos = this._scanner.getPos();
    const ws = this.eat(kind);
    this._scanner.setPos(pos);
    return ws;
  }

  eat(kind: number) {
    while (this._curr && kind & this._curr.kind) {
      this.next();
    }
    return this.curr()?.value;
  }

  curr() {
    return this._curr;
  }

  currValue(kind: number) {
    const token = this._curr;
    if (!(kind & token.kind)) {
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
  nextEat(kind: number) {
    this.next();
    this.eat(kind);
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
