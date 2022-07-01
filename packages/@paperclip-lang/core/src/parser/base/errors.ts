import { DSLTokenKind } from "../dsl/tokenizer";
import { SourceLocation } from "./state";

export class EndOfFileError extends Error {}
export class UnknownTokenError extends Error {
  constructor(readonly char: string) {
    super(`Unknown token "${char}"`);
  }
}

export class UnexpectedTokenError extends Error {
  constructor(readonly char: string, location: SourceLocation) {
    super(`Unexpected token "${char}" at ${location.line}:${location.column}`);
  }
}
