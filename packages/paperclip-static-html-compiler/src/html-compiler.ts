// TODOS:
// - variants for props
// - variants for classes
// - tests**
import { PCModule, isVoidTagName } from "paperclip";
import {
  ContentNode,
  getPublicComponentClassName,
  addOpenTag,
  addCloseTag
} from "./utils";
import {
  createPaperclipVirtualDOMtranslator,
  TranslateContext,
  addLine
} from "paperclip-virtual-dom-compiler";
import { KeyValue } from "tandem-common";

const getPublicRenderName = (
  contentNode: ContentNode,
  context: TranslateContext
) => {
  return `render${getPublicComponentClassName(contentNode, context)}`;
};

const getBaseRenderName = (
  contentNode: ContentNode,
  context: TranslateContext
) => {
  return getPublicRenderName(contentNode, context);
};

export const translatePaperclipModuleToHTMLRenderers = createPaperclipVirtualDOMtranslator(
  {
    elementCreator: "createElement",
    classAttributeName: "class"
  },
  {
    getControllerParameters: (firstParam: string) => [
      firstParam,
      "createElement"
    ],
    getBaseRenderName,
    getPublicRenderName,
    translateModule: (
      module: PCModule,
      context: TranslateContext,
      inner: (context: TranslateContext) => TranslateContext
    ) => {
      context = addLine(`var idCount = 0;`, context);
      context = addOpenTag(`function flatten(ary) {\n`, context);
      context = addLine(`if (typeof ary !== "object") return [ary];`, context);
      context = addLine(`var flattened = [];`, context);
      context = addOpenTag(
        `for (var i = 0, n = ary.length; i < n; i++) {\n`,
        context
      );
      context = addLine(`var item = ary[i];`, context);
      context = addOpenTag(`if (Array.isArray(item)) {\n`, context);
      context = addLine(
        `flattened = flattened.concat(flattened, flatten(item));`,
        context
      );
      context = addCloseTag(`}`, context);
      context = addOpenTag(` else {\n`, context);
      context = addLine(`flattened.push(item);`, context);
      context = addCloseTag(`}\n`, context);
      context = addCloseTag(`}\n`, context);
      context = addLine(`return flattened;`, context);
      context = addCloseTag(`}\n`, context);

      context = addOpenTag(
        `function createElement(tag, attributes, children) {\n`,
        context
      );
      context = addLine(
        `if (typeof tag === "function") return tag(Object.assign({}, attributes, { children: children }));`,
        context
      );
      context = addOpenTag(`return {\n`, context);
      context = addLine(`id: "node" + (idCount++),`, context);
      context = addLine(`name: tag,`, context);
      context = addLine(`attributes: attributes || {},`, context);
      context = addLine(`children: flatten(children || []),`, context);
      context = addCloseTag(`};\n`, context);
      context = addCloseTag(`}\n`, context);
      context = inner(context);
      return context;
    },
    translateRenderer: (
      contentNode: ContentNode,
      context: TranslateContext,
      inner: (context: TranslateContext) => TranslateContext
    ) => {
      const baseName = getBaseRenderName(contentNode, context);
      context = addOpenTag(`var ${baseName} = function(props) {\n`, context);
      context = inner(context);
      context = addCloseTag(`};\n`, context);
      return context;
    }
  }
);

export type VirtualElement = {
  id: string;
  children: VirtualNode[];
  attributes: KeyValue<string>;
  name: string;
};

export type VirtualNode = string | VirtualElement;

export type Renderers = {
  [identifier: string]: (props: Object) => VirtualNode;
};

export const stringifyVirtualNode = (
  node: VirtualNode,
  indent: string = " ",
  space = ""
) => {
  if (typeof node === "string") {
    return space + node;
  }

  let buffer = space + `<${node.name}`;

  for (const key in node.attributes) {
    if (/^(children|key|text)$/.test(key)) {
      continue;
    }
    buffer += ` ${key}="${node.attributes[key]}"`;
  }

  buffer += ">";

  if (isVoidTagName(node.name)) {
    return buffer;
  }

  buffer += "\n";

  for (const child of node.children) {
    buffer += stringifyVirtualNode(child, indent, space + indent) + "\n";
  }

  buffer += space + `</${node.name}>`;

  return buffer;
};

isVoidTagName;
