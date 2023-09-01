import { memoize } from "@paperclip-ui/common";
import {
  DesignerState,
  getCurrentDependency,
} from "@paperclip-ui/designer/src/state";
import { Token, getTokenAtPosition, simpleParser } from "./utils";
import { declSuggestionMap } from "./css";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { DeclarationValueType, inferDeclarationValueType } from "./css-utils";
import { camelCase } from "lodash";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

export enum RawInputValueSuggestionKind {
  Section,
  Item,
}

export type RawInputValueSuggestionItem = {
  kind: RawInputValueSuggestionKind.Item;
  label?: string;
  value: string;
  previewValue?: string;
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
  // if something like var(mod.something) where mod points to a file
  imports?: Record<string, string>;
  active: boolean;
  value?: string;
  caretPosition: number;
  selectionLength?: number;
  showSuggestionMenu: boolean;
};

export const getInitialState = memoize(
  (value: string): State => ({
    caretPosition: -1,
    value,
    active: false,
    showSuggestionMenu: false,
  })
);

export const getTokenAtCaret = memoize((state: State) =>
  getTokenAtPosition(parseStyleDeclaration)(state.value, state.caretPosition)
);

export const getTokenIndexAtBoundary = (state: State) => {
  const tokens = parseStyleDeclaration(state.value);
};

export enum ExpressionKind {
  FunctionCall = "functionCall",
  Keyword = "keyword",
  Color = "color",
  Number = "number",
  Unit = "unit",
  Whitespace = "whitespace",
}

const keywordRegexp = /^[a-zA-Z]+[a-zA-Z0-9\_\-]*/;

export const parseStyleDeclaration = simpleParser([
  [ExpressionKind.FunctionCall, keywordRegexp, [/^\(/, /^\)/]],
  [ExpressionKind.Color, /^#[\w\d]+/],
  [ExpressionKind.Keyword, keywordRegexp],
  [ExpressionKind.Unit, /^\-?\d+(\.\d+)?[a-z]+/],
  [ExpressionKind.Number, /^\-?\d+(\.\d+)?/],
  [ExpressionKind.Whitespace, /^[\s\t]+/],
]);

export const getDeclSuggestionItems = memoize(
  (declName: string, state: DesignerState) => (token: Token) => {
    const declSuggestionInfo = declSuggestionMap[declName];

    const nativeSuggestions =
      declSuggestionInfo?.suggestions?.map((suggestion) => {
        if (typeof suggestion === "function") {
          return suggestion(token);
        }
        return suggestion;
      }) || [];

    const items = [];

    if (nativeSuggestions.length) {
      items.push(
        { kind: RawInputValueSuggestionKind.Section, label: "Native" },
        ...nativeSuggestions
      );
    }

    const possibleTokens = ast.getGraphAtoms(state.graph).filter((atom) => {
      // default to keyword (could be something like "inter sans-serif")
      const valueType =
        inferDeclarationValueType(atom.cssValue) ??
        DeclarationValueType.Keyword;

      return (
        atom.atom.isPublic &&
        declSuggestionInfo?.valueTypes?.includes(valueType)
      );
    });

    if (possibleTokens.length) {
      items.push({
        kind: RawInputValueSuggestionKind.Section,
        label: "Tokens",
      });
      for (const token of possibleTokens) {
        const namespace = getPathNamespace(token.dependency.path);

        items.push({
          kind: RawInputValueSuggestionKind.Item,
          label: token.atom.name,
          value: `var(${namespace}.${token.atom.name})`,
          previewValue: token.cssValue,
          source: token.dependency.path,
          id: token.atom.id,
        });
      }
    }

    return items;
  }
);

export const getPathNamespace = (path: string) => {
  const parts = path.split("/");
  return camelCase(parts[parts.length - 1].replace(".pc", ""));
};

export const getRenderedCssValue = (value: string, state: DesignerState) => {
  if (!value) {
    return null;
  }

  if (!value.startsWith("var")) {
    return value;
  }

  const dep = getCurrentDependency(state);
  const document = dep.document;

  let varImpSource: string = dep.path;

  const varInfo = value.match(/var\((.*)\)/)?.[1];

  if (!varInfo) {
    return value;
  }

  const [namespace, name] = varInfo.split(".");

  if (varInfo.includes(".")) {
    const imp = ast.getDocumentImport(namespace, document);

    if (!imp) {
      return value;
    }
    varImpSource = dep.imports[imp.path];
  }

  const atoms = ast.getGraphAtoms(state.graph);

  const atom = atoms.find(
    (atom) => atom.atom.name === name && atom.dependency.path === varImpSource
  );

  return atom?.cssValue ?? value;
};
