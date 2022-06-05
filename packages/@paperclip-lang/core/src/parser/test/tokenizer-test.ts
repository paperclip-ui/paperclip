import { expect } from "chai";
import { Token, token, Tokenizer, TokenKind } from "../tokenizer";

describe(__dirname + "#", () => {
  [
    [`{`, [token(TokenKind.CurlyOpen, "{")]],
    [`component`, [token(TokenKind.Keyword, "component")]],
    [
      `component Test`,
      [
        token(TokenKind.Keyword, "component"),
        token(TokenKind.Whitespace, " "),
        token(TokenKind.Keyword, "Test"),
      ],
    ],
    ["}", [token(TokenKind.CurlyClose, "}")]],
    ["(", [token(TokenKind.ParenOpen, "(")]],
    [")", [token(TokenKind.ParenClose, ")")]],
    [",", [token(TokenKind.Comma, ",")]],
    ["/* abba \n */", [token(TokenKind.MultiLineComment, "/* abba \n */")]],
    ["// a bba \n", [token(TokenKind.SingleLineComment, "// a bba \n")]],
    ["10", [token(TokenKind.Number, "10")]],
    ["-10", [token(TokenKind.Number, "-10")]],
    ["-10.444", [token(TokenKind.Number, "-10.555")]],
    ["[", [token(TokenKind.SquareOpen, "[")]],
    ["]", [token(TokenKind.SquareClose, "]")]],
    [`"abba"`, [token(TokenKind.String, `"abba"`)]],
    [`"abba\\""`, [token(TokenKind.String, `"abba\\""`)]],
    [`"abba\\""`, [token(TokenKind.String, `"abba\\""`)]],
  ].forEach(([source, expectedTokens]: [string, Token[]]) => {
    it(`Can tokenize "${source}"`, () => {
      const tokenizer = new Tokenizer(source);
      const tokens: Token[] = [];
      while (!tokenizer.isEOF()) {
        tokens.push(tokenizer.next());
      }
      expect(tokens).to.eql(expectedTokens);
    });
  });
});
