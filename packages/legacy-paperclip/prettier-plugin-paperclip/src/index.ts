import { Parser, Printer, SupportLanguage } from "prettier";
import { print } from "./print";
import { createEngineDelegate } from "@paperclip-ui/core";

export const languages: Partial<SupportLanguage>[] = [
  {
    name: "@paperclip-lang/core",
    parsers: ["@paperclip-lang/core"],
    extensions: [".pc"],
    vscodeLanguageIds: ["@paperclip-lang/core"],
  },
];

export const parsers: Record<string, Parser> = {
  paperclip: {
    parse(text) {
      const engine = createEngineDelegate();
      return engine.parseContent(text, "<virt>");
    },
    preprocess(text) {
      return text;
    },
    locStart(node) {
      return node.start;
    },
    locEnd(node) {
      return node.end;
    },
    astFormat: "paperclip-ast",
  },
};

export const printers: Record<string, Printer> = {
  "paperclip-ast": {
    print,
  },
};

export { options } from "./options";
