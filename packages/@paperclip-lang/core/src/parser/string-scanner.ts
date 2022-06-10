import { EndOfFileError } from "./errors";

export class StringScanner {
  private _pos: number = 0;
  constructor(readonly source: string) {}
  isEOF() {
    return this._pos >= this.source.length;
  }
  currChar() {
    return this.source.charAt(this._pos);
  }
  nextChar() {
    return this.source.charAt(++this._pos);
  }
  skip(count: number = 1) {
    this._pos += count;
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
      this._pos++;
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
