import { DependencyGraph, PCModule } from "@paperclip-lang/core";

export type TranslateContext = {
  graph: DependencyGraph;
  content: string;
  indent: string;
  blockCount: number;
  module: PCModule;
  url: string;
};

export const addBuffer = (
  buffer: string,
  context: TranslateContext
): TranslateContext => ({
  ...context,
  content:
    context.content +
    (context.content.lastIndexOf("\n") === context.content.length - 1
      ? context.indent.repeat(context.blockCount)
      : "") +
    buffer,
});

export const startBlock = (context: TranslateContext) => ({
  ...context,
  blockCount: context.blockCount + 1,
});

export const endBlock = (context: TranslateContext) => ({
  ...context,
  blockCount: context.blockCount - 1,
});
