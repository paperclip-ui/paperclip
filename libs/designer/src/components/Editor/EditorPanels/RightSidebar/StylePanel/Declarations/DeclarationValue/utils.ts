import { memoize } from "@paperclip-ui/common";

export type Expression = {
  kind: string;
  parts: Array<string>;
  pos: number;
};

type ExprPatternParts = Array<RegExp | [RegExp, RegExp]>;
type Patterns = Array<[string, ...ExprPatternParts]>;

type Context = {
  patterns: Patterns;
  expressions: Expression[];
  source: string;
  pos: number;
};

const ended = (context: Context) => context.pos >= context.source.length;

const childContext = (context: Context) => ({
  ...context,
  expressions: [],
});

const getContextParts = (context: Context): string[] => {
  const parts = [];
  for (const expr of context.expressions) {
    parts.push(...expr.parts);
  }
  return parts;
};

const addExpression = (kind: string, parts: string[], context: Context) => ({
  ...context,
  expressions: [...context.expressions, { kind, parts, pos: context.pos }],

  pos: context.pos + parts.join("").length,
});

const movePos = (context: Context, amount: number) => ({
  ...context,
  pos: context.pos + amount,
});

const currChar = (context: Context) => context.source.charAt(context.pos);

export const simpleParser = (patterns: Patterns) =>
  memoize((source: string): Expression[] => {
    return parseRoot(
      {
        patterns,
        source,
        pos: 0,
        expressions: [],
      },
      ended
    ).expressions;
  });

const parseRoot = (
  context: Context,
  until: (context: Context) => boolean
): Context => {
  while (!until(context)) {
    let parts: string[] = null;
    let exprKind = null;

    for (const [kind, ...testers] of context.patterns) {
      parts = parseExprParts(testers, context);
      if (parts) {
        exprKind = kind;
        break;
      }
    }

    if (!parts) {
      parts = [currChar(context)];
    }

    context = addExpression(exprKind, parts, context);
  }

  return context;
};

const parseExprParts = (tests: ExprPatternParts, context: Context) => {
  const parts = [];

  for (const test of tests) {
    const nextParts = parseExprPart(test, movePos(context, partsLength(parts)));
    if (!nextParts) {
      return null;
    }
    parts.push(...nextParts);
  }

  return parts;
};

const parseExprPart = (
  test: RegExp | [RegExp, RegExp],
  context: Context
): string[] => {
  if (Array.isArray(test)) {
    const [start, end] = test;
    start.lastIndex = 0;
    const parts = [];
    const startParts = parseExprPart(start, context);

    if (startParts) {
      parts.push(...startParts);

      const innerContext = parseRoot(
        childContext(movePos(context, partsLength(parts))),
        (context) => {
          return parseExprPart(end, context) != null;
        }
      );

      parts.push(...getContextParts(innerContext));

      const endPart = parseExprPart(end, movePos(context, partsLength(parts)));
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
