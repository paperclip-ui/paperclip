import { memoize } from "@paperclip-ui/common";

type Token = {
  kind: string;
  value: string;
  pos: number;
};

export const tokenizer = <Kind extends string>(tests: Array<[Kind, RegExp]>) =>
  memoize((value: string): Token[] => {
    const tokens: Token[] = [];

    let pos = 0;

    while (pos < value.length) {
      let tokenValue = value.charAt(pos);
      let tokenKind = null;

      for (const [kind, test] of tests) {
        test.lastIndex = 0;
        const match = test.exec(value.substring(pos));
        if (match) {
          tokenValue = match[0];
          tokenKind = kind;
          break;
        }
      }

      tokens.push({ kind: tokenKind, value: tokenValue, pos });
      pos += tokenValue.length;
    }

    return tokens;
  });
