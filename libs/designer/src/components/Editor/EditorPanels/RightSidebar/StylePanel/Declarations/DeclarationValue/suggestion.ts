import {
  RawInputValueSuggestionItem,
  RawInputValueSuggestionKind,
} from "./state";
import { Token, getTokenValue } from "./utils";

export const valueSuggestion =
  (value: string): ((token: Token) => RawInputValueSuggestionItem) =>
  (expr: Token) => ({
    kind: RawInputValueSuggestionKind.Item,
    label: value.replace("%|%", "").replace("%value%", getTokenValue(expr)),
    value: value.replace("%value", getTokenValue(expr)),
    id: value,
  });
