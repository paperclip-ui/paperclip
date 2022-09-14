import { EndOfFileError } from "./errors";
import { SourceLocation } from "./state";
import { isNewLine, isWhitespace } from "./utils";

export class StringScanner {
  private _pos: number = 0;
  private _column: number = 0;
  private _line: number = 0;
  constructor(readonly source: string) {}
  isEOF() {
    return this._pos >= this.source.length;
  }
  currChar() {
    return this.source.charAt(this._pos);
  }
  nextChar() {
    const c = this.source.charAt(++this._pos);
    if (isNewLine(c)) {
      this._line++;
      this._column = 0;
    } else {
      this._column++;
    }
    return c;
  }
  getLocation(): SourceLocation {
    return {
      line: this._line,
      column: this._column,
      pos: this._pos,
    };
  }
  skip(count: number = 1) {
    let i = 0;
    while (i++ < count) this.nextChar();
  }
  peekChar(step: number = 1) {
    return this.source.charAt(this._pos + step);
  }
  scanUntil(test: (c: string) => boolean) {
    let buffer = "";
    while (!this.isEOF()) {
      const curr = this.currChar();
      if (test(curr)) {
        break;
      }
      buffer += curr;
      this.nextChar();
    }
    return buffer;
  }
  getPos() {
    return this._pos;
  }
  getLength() {
    return this.source.length;
  }
  setPos(value: number) {
    this._pos = value;
  }
}
