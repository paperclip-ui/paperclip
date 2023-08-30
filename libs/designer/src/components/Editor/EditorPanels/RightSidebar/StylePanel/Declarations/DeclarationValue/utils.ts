import { memoize } from "@paperclip-ui/common";
import { parseStyleDeclaration } from "./state";

export type Token = {
  kind: string;
  parts: Array<string>;
  pos: number;
};

type ExprPatternParts = Array<RegExp | [RegExp, RegExp]>;
type Patterns = Array<[string, ...ExprPatternParts]>;

type Context = {
  patterns: Patterns;
  tokens: Token[];
  source: string;
  pos: number;
};

const ended = (context: Context) => context.pos >= context.source.length;

const childContext = (context: Context) => ({
  ...context,
  tokens: [],
});

const getContextParts = (context: Context): string[] => {
  const parts = [];
  for (const token of context.tokens) {
    parts.push(...token.parts);
  }
  return parts;
};

const addToken = (kind: string, parts: string[], context: Context) => ({
  ...context,
  tokens: [...context.tokens, { kind, parts, pos: context.pos }],

  pos: context.pos + parts.join("").length,
});

const movePos = (context: Context, amount: number) => ({
  ...context,
  pos: context.pos + amount,
});

const currChar = (context: Context) => context.source.charAt(context.pos);

export const simpleParser = (patterns: Patterns) =>
  memoize((source: string): Token[] => {
    return parseRoot(
      {
        patterns,
        source,
        pos: 0,
        tokens: [],
      },
      ended
    ).tokens;
  });

const parseRoot = (
  context: Context,
  until: (context: Context) => boolean
): Context => {
  while (!until(context)) {
    let parts: string[] = null;
    let tokenKind = null;

    for (const [kind, ...testers] of context.patterns) {
      parts = parseTokenParts(testers, context);
      if (parts) {
        tokenKind = kind;
        break;
      }
    }

    if (!parts) {
      parts = [currChar(context)];
    }

    context = addToken(tokenKind, parts, context);
  }

  return context;
};

const parseTokenParts = (tests: ExprPatternParts, context: Context) => {
  const parts = [];

  for (const test of tests) {
    const nextParts = parseTokenPart(
      test,
      movePos(context, partsLength(parts))
    );
    if (!nextParts) {
      return null;
    }
    parts.push(...nextParts);
  }

  return parts;
};

const parseTokenPart = (
  test: RegExp | [RegExp, RegExp],
  context: Context
): string[] => {
  if (Array.isArray(test)) {
    const [start, end] = test;
    start.lastIndex = 0;
    const parts = [];
    const startParts = parseTokenPart(start, context);

    if (startParts) {
      parts.push(...startParts);

      const innerContext = parseRoot(
        childContext(movePos(context, partsLength(parts))),
        (context) => {
          return parseTokenPart(end, context) != null;
        }
      );

      parts.push(...getContextParts(innerContext));

      const endPart = parseTokenPart(end, movePos(context, partsLength(parts)));
      if (endPart) {
        return [...parts, ...endPart];
      } else {
        return null;
      }
    }
  } else {
    const part = parsePart(test, context);
    return part ? [part] : null;
  }
};

const parsePart = (test: RegExp, context: Context): string => {
  test.lastIndex = 0;
  const match = test.exec(context.source.substring(context.pos));
  return match ? match[0] : null;
};

const partsLength = (buffer: string[]) => buffer.join("").length;
export const getTokenValue = memoize((value: Token) => value.parts.join(""));

export const getTokenAtPosition = memoize(
  (parse: (source: string) => Token[]) =>
    memoize((value: string, pos: number) => {
      const tokens = parse(value);

      for (let i = tokens.length; i--; ) {
        const token = tokens[i];

        if (!token.kind || token.pos > pos) {
          continue;
        }

        let cpos = token.pos;
        let j = 0;

        for (; j < token.parts.length; j++) {
          const part = token.parts[j];
          const npos = cpos + part.length;
          if (npos > pos) {
            break;
          }
          cpos = npos;
        }

        if (j > 0) {
          return getTokenAtPosition(parse)(value.substring(cpos), 0) ?? token;
        } else {
          return token;
        }
      }
    })
);
