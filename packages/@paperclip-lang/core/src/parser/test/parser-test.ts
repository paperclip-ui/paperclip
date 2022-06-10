import { parseDocument } from "../parser";

describe(__filename + "#", () => {
  [
    [
      `component Test {
        render div {
          
        }
      }`,
    ],
    [
      `component Test {
        variant test
        variant abba (on: true)
      }`,
    ],
  ].forEach(([source]) => {
    it(`Can parse "${source}"`, () => {
      const ast = parseDocument(source);
      console.log(JSON.stringify(ast, null, 2));
    });
  });
});
