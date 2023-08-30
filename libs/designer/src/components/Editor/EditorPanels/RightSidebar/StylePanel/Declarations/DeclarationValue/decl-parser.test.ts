import {} from "./reducer";
import { Expression, simpleParser } from "./utils";

describe(__filename + "#", () => {
  Object.entries({
    "Can parse a simple expression": [
      [["something", /^\w+/]],
      "a test",
      [
        {
          kind: "something",
          parts: ["a"],
          pos: 0,
        },
        {
          kind: null,
          parts: [" "],
          pos: 1,
        },
        {
          kind: "something",
          parts: ["test"],
          pos: 2,
        },
      ],
    ],
    "Can parse a function": [
      [
        ["functionCall", /^\w+/, [/^\(/, /^\)/]],
        ["word", /^\w+/],
      ],
      "lineargradient(red, blue) orange",
      [
        {
          kind: "functionCall",
          parts: ["lineargradient", "(", "red", ",", " ", "blue", ")"],
          pos: 0,
        },
        {
          kind: null,
          parts: [" "],
          pos: 25,
        },
        {
          kind: "word",
          parts: ["orange"],
          pos: 26,
        },
      ],
    ],
  }).forEach(([key, inf]) => {
    const [pattern, source, expected] = inf as any;
    it(key, () => {
      const result = simpleParser(pattern)(source);
      expect(result).toEqual(expected);
    });
  });
});
