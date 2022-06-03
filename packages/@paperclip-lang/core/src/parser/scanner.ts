export class StringScanner {
  private _pos: number;
  private _length: number;
  constructor(readonly source: string) {
    this._length = source.length;
    this._pos = 0;
  }
  getPos() {
    return this._pos;
  }
  // scan(until) {
  //   const buffer = "";
  //   while (!this.isEOF() && !until(this.currChar())) {
  //     buffer += this.currChar();
  //   }
  // }
  currChar() {
    return this.source.charAt(this._pos);
  }
  isEOF() {
    return this._pos > this._length;
  }
  nextChar() {
    return this.source.charAt(this._pos++);
  }
}
