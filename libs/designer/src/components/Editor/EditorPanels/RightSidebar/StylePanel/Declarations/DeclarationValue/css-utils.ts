import { ExpressionKind, RawInputValueSuggestionItem } from "./state";
import { valueSuggestion } from "./suggestion";
import { Token } from "./utils";

export type DeclarationSuggestionMap = Record<
  string,
  {
    valueTypes: DeclarationValueType[];
    suggestions: Array<(token: Token) => RawInputValueSuggestionItem>;
  }
>;

export type DeclarationSuggestion = {};

export enum DeclarationValueType {
  Color = "Color",
  Unit = "Unit",
  Number = "Number",
  Variable = "Variable",
  Keyword = "Keyword",
}

export const declValueSuggestions = (
  valueTypes: DeclarationValueType[],
  suggestions: string[] = []
) => ({
  valueTypes: valueTypes,
  suggestions: suggestions.map(valueSuggestion),
});

const colorDeclValueTypes: Array<[DeclarationValueType, RegExp]> = [
  [DeclarationValueType.Color, /^(linear-gradient|rgba?|hsl|lab|lch|#)/],
  [DeclarationValueType.Unit, /^\-?\d+(\.\d+)?\w+/],
  [DeclarationValueType.Number, /^\-?\d+(\.\d+)?/],
  [DeclarationValueType.Variable, /^var\(/],
];

export const inferDeclarationValueType = (value: string) => {
  for (const [type, test] of colorDeclValueTypes) {
    if (test.test(value)) {
      return type;
    }
  }
};
