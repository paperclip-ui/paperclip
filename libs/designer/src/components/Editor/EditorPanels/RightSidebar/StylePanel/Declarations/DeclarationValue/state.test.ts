import {} from "./reducer";
import { getTokenAtCaret } from "./state";
import { Token, simpleParser } from "./utils";

describe(__filename + "#", () => {
  describe("getTokenAtCaret", () => {
    it("Can return the proper token at the input caret", () => {
      const token = getTokenAtCaret({
        caretPosition: 0,
        value: "test",
        showSuggestionMenu: false,
        active: false,
      });

      expect(token).toEqual({ kind: "keyword", parts: ["test"], pos: 0 });
    });
    it("Can return a function token when the caret position is at the boundary of the function name", () => {
      const token = getTokenAtCaret({
        caretPosition: "linear-gradient".length,
        value: "linear-gradient(red, blue)",
        showSuggestionMenu: false,
        active: false,
      });

      expect(token).toEqual({
        kind: "functionCall",
        parts: ["linear-gradient", "(", "red", ",", " ", "blue", ")"],
        pos: 0,
      });
    });

    it("Returns the first param token ", () => {
      const token = getTokenAtCaret({
        caretPosition: "linear-gradient(".length,
        value: "linear-gradient(red, blue)",
        showSuggestionMenu: false,
        active: false,
      });

      expect(token).toEqual({ kind: "keyword", parts: ["red"], pos: 16 });
    });

    it("Returns the secone param token ", () => {
      const token = getTokenAtCaret({
        caretPosition: "linear-gradient(red, bl".length,
        value: "linear-gradient(red, blue)",
        showSuggestionMenu: false,
        active: false,
      });

      expect(token).toEqual({ kind: "keyword", parts: ["blue"], pos: 21 });
    });
  });
});
