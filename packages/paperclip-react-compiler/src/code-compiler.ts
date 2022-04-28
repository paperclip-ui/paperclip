// TODOS:
// - variants for props
// - variants for classes
// - tests**
import { PCModule, PCDependency, DependencyGraph } from "paperclip";
import {
  ContentNode,
  getPublicComponentClassName,
  TranslateContext,
  addOpenTag,
  addCloseTag,
  addLine
} from "./utils";
import { createPaperclipVirtualDOMtranslator } from "paperclip-virtual-dom-compiler";
export const compilePaperclipModuleToReact = (
  entry: PCDependency,
  graph: DependencyGraph,
  rootDirectory: string
) => {
  const context = { exports: {} };
  new Function(
    "exports",
    translatePaperclipModuleToReact(entry, graph, rootDirectory).buffer
  )(context);
  return context.exports;
};

const getBaseRenderName = (
  contentNode: ContentNode,
  context: TranslateContext
) => {
  return `Base${getPublicComponentClassName(contentNode, context)}`;
};

const getPublicRenderName = (
  contentNode: ContentNode,
  context: TranslateContext
) => {
  return `${getPublicComponentClassName(contentNode, context)}`;
};

export const translatePaperclipModuleToReact = createPaperclipVirtualDOMtranslator(
  {
    elementCreator: "React.createElement",
    classAttributeName: "className"
  },
  {
    getControllerParameters: (firstParam: string) => [firstParam],
    getBaseRenderName,
    getPublicRenderName,
    translateModule: (
      module: PCModule,
      context: TranslateContext,
      inner: (context: TranslateContext) => TranslateContext
    ) => {
      context = addLine("var React = require('react');", context);
      context = inner(context);
      return context;
    },
    translateRenderer: (
      contentNode: ContentNode,
      context: TranslateContext,
      inner: (context: TranslateContext) => TranslateContext
    ) => {
      const publicClassName = getBaseRenderName(contentNode, context);

      context = addOpenTag(
        `var ${publicClassName} = class extends React.PureComponent {\n`,
        context
      );

      context = addOpenTag(`render() {\n`, context);

      context = addLine(`var props = this.props;\n`, context);

      context = inner(context);

      context = addCloseTag(`}\n`, context);
      context = addCloseTag(`}\n\n`, context);

      return context;
    }
  }
);
