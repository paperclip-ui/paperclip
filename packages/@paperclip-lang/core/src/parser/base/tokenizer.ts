import { UnexpectedTokenError } from "./errors";
import { StringScanner } from "../base/string-scanner";

export type Token<TKind> = {
  kind: TKind;
  value: string;
};

export abstract class BaseTokenizer<TTokenKind> {
  protected _scanner: StringScanner;
  protected _curr: Token<TTokenKind>;

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

  abstract _next(): Token<any>;
}

export const token = (kind: any, value: string): Token<any> => ({
  kind,
  value,
});
