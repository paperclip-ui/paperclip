import { expect } from "chai";
import { StringScanner } from "../../base/string-scanner";
import { token } from "../../base/tokenizer";
import { Token, DSLTokenizer, DSLTokenKind } from "../tokenizer";

describe(__dirname + "#", () => {
  [
    [`{`, [token(DSLTokenKind.CurlyOpen, "{")]],
    [`component`, [token(DSLTokenKind.Keyword, "component")]],
    [
      `component Test`,
      [
        token(DSLTokenKind.Keyword, "component"),
        token(DSLTokenKind.Space, " "),
        token(DSLTokenKind.Keyword, "Test"),
      ],
    ],
    ["}", [token(DSLTokenKind.CurlyClose, "}")]],
    ["(", [token(DSLTokenKind.ParenOpen, "(")]],
    [")", [token(DSLTokenKind.ParenClose, ")")]],
    [",", [token(DSLTokenKind.Comma, ",")]],
    ["/* abba \n */", [token(DSLTokenKind.MultiLineComment, "/* abba \n */")]],
    ["// a bba \n", [token(DSLTokenKind.SingleLineComment, "// a bba \n")]],
    ["10", [token(DSLTokenKind.Number, "10")]],
    ["-10", [token(DSLTokenKind.Number, "-10")]],
    ["-10.444", [token(DSLTokenKind.Number, "-10.444")]],
    ["[", [token(DSLTokenKind.SquareOpen, "[")]],
    ["]", [token(DSLTokenKind.SquareClose, "]")]],
    [`"abba"`, [token(DSLTokenKind.String, `"abba"`)]],
    [`"abba\\""`, [token(DSLTokenKind.String, `"abba\\""`)]],
    [`"abba\\""`, [token(DSLTokenKind.String, `"abba\\""`)]],
    [`'abba'`, [token(DSLTokenKind.String, `'abba'`)]],
  ].forEach(([source, expectedTokens]: [string, Token[]]) => {
    it(`Can tokenize "${source}"`, () => {
      const tokenizer = new DSLTokenizer(new StringScanner(source));
      const tokens: Token[] = [];
      while (!tokenizer.isEOF()) {
        tokens.push(tokenizer.next());
      }
      expect(tokens).to.eql(expectedTokens);
    });
  });
});
