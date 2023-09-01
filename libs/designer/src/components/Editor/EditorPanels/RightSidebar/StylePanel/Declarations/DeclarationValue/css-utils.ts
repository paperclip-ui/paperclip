import Color from "color";
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

const colorDeclValueTypes: Array<
  [DeclarationValueType, (value: string) => boolean]
> = [
  [
    DeclarationValueType.Color,
    (value) => {
      try {
        return Color(value) != null;
      } catch (e) {
        return false;
      }
    },
  ],
  [DeclarationValueType.Unit, (value) => /^\-?\d+(\.\d+)?\w+/.test(value)],
  [DeclarationValueType.Number, (value) => /^\-?\d+(\.\d+)?/.test(value)],
  [DeclarationValueType.Variable, (value) => /^var\(/.test(value)],
];

export const inferDeclarationValueType = (value: string) => {
  if (value == null) {
    return null;
  }

  for (const [type, test] of colorDeclValueTypes) {
    if (test(value)) {
      return type;
    }
  }
};
