import { Tokenizer } from "./tokenizer";

type Context = {
  tokenizer: Tokenizer;
};

export const parseDocument = (source: string) => {
  const context: Context = { tokenizer: new Tokenizer(source) };
  const documentChildren = parseDocumentChildren(context);
};

const parseDocumentChildren = (context: Context) => {
  while (!context.tokenizer.isEOF()) {}
};

const parseDocumentChild = (context: Context) => {};
