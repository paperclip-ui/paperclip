import { memoize } from "@paperclip-ui/common";
import { tokenizer } from "./utils";
import { DesignerState } from "@paperclip-ui/designer/src/state";

export enum RawInputValueSuggestionKind {
  Section,
  Item,
}

export type RawInputValueSuggestionItem = {
  kind: RawInputValueSuggestionKind.Item;
  value: string;
  preview?: string;
  source?: string;
  id: string;
};

export type RawInputValueSuggestionSection = {
  kind: RawInputValueSuggestionKind.Section;
  label: string;
};

export type RawInputValueSuggestion =
  | RawInputValueSuggestionItem
  | RawInputValueSuggestionSection;

export type State = {
  value?: string;
  caretPosition: number;
};

export const getInitialState = memoize(
  (value: string): State => ({
    caretPosition: -1,
    value,
  })
);

export const getTokenAtBoundary = memoize((state: State) => {
  const tokens = tokenizeStyleDeclaration(state.value);

  for (let i = tokens.length; i--; ) {
    const token = tokens[i];
    if (
      token.kind &&
      token.pos <= state.caretPosition &&
      token.value.length + token.pos >= state.caretPosition
    ) {
      return token;
    }
  }
});

export const getTokenIndexAtBoundary = (state: State) => {
  const tokens = tokenizeStyleDeclaration(state.value);
};

export enum TokenKind {
  FunctionCall = "functionCall",
  Keyword = "keyword",
  Number = "number",
  Unit = "unit",
  Whitespace = "whitespace",
}

const keywordRegexp = /^[a-zA-Z]+[a-zA-Z0-9\_\-]*/;

export const tokenizeStyleDeclaration = tokenizer([
  [TokenKind.FunctionCall, keywordRegexp, [/\(/, /\)/]],
  [TokenKind.Keyword, keywordRegexp],
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

const declSuggestions = {
  background: ["linear-gradient(%|)", "rgba(%|)"],
};

export const getDeclSuggestionItems = memoize(
  (declName: string, state: DesignerState) => (filter: string) => {
    return [];
  }
);
