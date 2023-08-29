import { memoize } from "@paperclip-ui/common";
import { serializeDeclaration } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { tokenizer } from "./utils";

export type State = {
  value?: string;
  caretPosition: number;
};

export const getInitialState = memoize(
  (expression): State => ({
    caretPosition: -1,
    value: expression ?? serializeDeclaration(expression.expr),
  })
);

export const getTokenAtBoundary = memoize((state: State) => {
  const tokens = tokenizeStyleDeclaration(state.value);
  for (let i = tokens.length; i--; ) {
    const token = tokens[i];
    if (
      token.kind &&
      token.pos >= state.caretPosition &&
      token.value.length + token.pos <= state.caretPosition
    ) {
      return token;
    }
  }
});

export const getTokenIndexAtBoundary = (state: State) => {
  const tokens = tokenizeStyleDeclaration(state.value);
};

export enum TokenKind {
  Keyword = "keyword",
  Number = "number",
  Unit = "unit",
  Whitespace = "whitespace",
}

export const tokenizeStyleDeclaration = tokenizer([
  [TokenKind.Keyword, /^[a-zA-Z]+[a-zA-Z0-9\_\-]*/],
  [TokenKind.Unit, /^\-?\d+(\.\d+)?[a-z]+/],
  [TokenKind.Number, /^\-?\d+(\.\d+)?/],
  [TokenKind.Whitespace, /^[\s\t]+/],
]);

const isCaretInBoundary = (value: string, position: number) => {
  const before = value.slice(0, position);
  const after = value.slice(position);

  return (
    isBoundary(before.charAt(before.length - 1)) && isBoundary(after.charAt(0))
  );
};

const isBoundary = (char?: string) => {
  return !char || /[\(\)\[\],\s]/.test(char);
};
