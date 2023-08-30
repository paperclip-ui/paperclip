import { memoize } from "@paperclip-ui/common";
// import { Token, tokenizer } from "./utils";
import { DesignerState } from "@paperclip-ui/designer/src/state";
import { Expression, simpleParser } from "./utils";

export enum RawInputValueSuggestionKind {
  Section,
  Item,
}

export type RawInputValueSuggestionItem = {
  kind: RawInputValueSuggestionKind.Item;
  label?: string;
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
  showSuggestionMenu: boolean;
};

export const getInitialState = memoize(
  (value: string): State => ({
    caretPosition: -1,
    value,
    showSuggestionMenu: false,
  })
);

export const getTokenAtCaret = memoize((state: State) => {
  const valueAfterCaret = state.value.substring(state.caretPosition);

  // FIRST we we need to fetch all tokens
  const tokens = parseStyleDeclaration(state.value);

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
  const tokens = parseStyleDeclaration(state.value);
};

export enum ExpressionKind {
  FunctionCall = "functionCall",
  Keyword = "keyword",
  Number = "number",
  Unit = "unit",
  Whitespace = "whitespace",
}

const keywordRegexp = /^[a-zA-Z]+[a-zA-Z0-9\_\-]*/;

export const parseStyleDeclaration = simpleParser([
  [ExpressionKind.FunctionCall, keywordRegexp, [/^\(/, /^\)/]],
  [ExpressionKind.Keyword, keywordRegexp],
  [ExpressionKind.Unit, /^\-?\d+(\.\d+)?[a-z]+/],
  [ExpressionKind.Number, /^\-?\d+(\.\d+)?/],
  [ExpressionKind.Whitespace, /^[\s\t]+/],
]);

const valueSuggestion =
  (value: string): ((token: Expression) => RawInputValueSuggestionItem) =>
  (expr: Expression) => ({
    kind: RawInputValueSuggestionKind.Item,
    label: value.replace("%|%", "").replace("%value%", expr.value),
    value: value.replace("%value", expr.value),
    id: value,
  });

const declSuggestions: Record<
  string,
  Partial<
    Record<
      ExpressionKind,
      Array<
        | RawInputValueSuggestionItem
        | ((value: Expression) => RawInputValueSuggestionItem)
      >
    >
  >
> = {
  background: {
    [ExpressionKind.FunctionCall]: [valueSuggestion("linear-gradient(%|%)")],
    [ExpressionKind.Unit]: [],
    [ExpressionKind.Keyword]: [
      valueSuggestion("repeat"),
      valueSuggestion("no-repeat"),
    ],
    [ExpressionKind.Whitespace]: [],
    [ExpressionKind.Number]: [
      valueSuggestion("%value%px"),
      valueSuggestion("%value%em"),
      valueSuggestion("%value%rem"),
    ],
  },
  color: {
    [ExpressionKind.FunctionCall]: [valueSuggestion("linear-gradient(%|%)")],
    [ExpressionKind.Keyword]: [valueSuggestion("linear-gradient(%|%)")],
    [ExpressionKind.Whitespace]: [valueSuggestion("linear-gradient(%|%)")],
  },
};

export const getDeclSuggestionItems = memoize(
  (declName: string, state: DesignerState) => (token: Expression) => {
    const nativeSuggestions =
      declSuggestions[declName]?.[token.kind]?.map((suggestion) => {
        if (typeof suggestion === "function") {
          return suggestion(token);
        }
        return suggestion;
      }) || [];

    const items = [];

    if (nativeSuggestions) {
      items.push(
        { kind: RawInputValueSuggestionKind.Section, label: "Native" },
        ...nativeSuggestions
      );
    }

    return items;
  }
);
