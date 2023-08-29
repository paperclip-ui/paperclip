import { memoize } from "@paperclip-ui/common";

type Token = {
  kind: string;
  value: string;
  pos: number;
};

export const tokenizer = <Kind extends string>(
  tests: Array<[Kind, ...Array<RegExp | [RegExp, RegExp]>]>
) =>
  memoize((value: string): Token[] => {
    const tokens: Token[] = [];

    let pos = 0;

    while (pos < value.length) {
      let tokenValue = value.charAt(pos);
      let tokenKind = null;

      for (const [kind, ...testers] of tests) {
        const match = scan(testers, value, pos);
        if (match) {
          tokenValue = match;
          tokenKind = kind;
          break;
        }
      }

      tokens.push({ kind: tokenKind, value: tokenValue, pos });
      pos += tokenValue.length;
    }

    console.log("TOKENS", JSON.stringify(tokens, null, 2));

    return tokens;
  });

const scan = (
  tests: Array<RegExp | [RegExp, RegExp]>,
  value: string,
  pos: number
) => {
  let buffer = "";

  for (const test of tests) {
    const chunk = scanPart(test, value, buffer.length + pos);
    if (!chunk) {
      return null;
    }
    buffer += chunk;
  }

  return buffer;
};

const scanPart = (
  test: RegExp | [RegExp, RegExp],
  value: string,
  pos: number
): string => {
  if (Array.isArray(test)) {
    const [start, end] = test;
    start.lastIndex = 0;
    let buffer = "";
    const startMatch = scanPart(start, value, pos);
    if (startMatch) {
      buffer += startMatch;

      while (true) {
        const newPos = pos + buffer.length;

        if (newPos >= value.length) {
          return null;
        }

        // beginning found?
        if (scanPart(start, value, newPos)) {
          const ret = scanPart(test, value, newPos);
          if (!ret) {
            return null;
          }
          buffer += ret;
        }

        const endPart = scanPart(test, value, newPos);

        // end found? Return it!
        if (endPart) {
          return buffer + endPart;
        }

        // otherwise just append next char
        buffer += value.charAt(newPos);
      }
    }
  } else {
    test.lastIndex = 0;
    const match = test.exec(value.substring(pos));
    if (match) {
      return match[0];
    }
  }
};
