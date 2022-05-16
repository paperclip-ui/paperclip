import {
  PCDependency,
  DependencyGraph,
  PCNode,
  PCVisibleNode,
  PCComponent,
} from "paperclip";
import { repeat, uniq, camelCase } from "lodash";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "tandem-common";

export type TranslateOptions = {
  compileNonComponents?: boolean;
};

export type ContentNode = PCVisibleNode | PCComponent;

export type TranslateContext = {
  options: TranslateOptions;
  buffer: string;
  newLine?: boolean;
  currentScope?: string;
  entry: PCDependency;
  graph: DependencyGraph;
  warnings: Error[];
  definedObjects: {
    // scope id
    [identifier: string]: {
      [identifier: string]: boolean;
    };
  };
  scopedLabelRefs: {
    // scope ID
    [identifier: string]: {
      // var name
      [identifier: string]: string[];
    };
  };
  depth: number;
};

const INDENT = "  ";

export const addBuffer = (buffer: string = "", context: TranslateContext) => ({
  ...context,
  buffer: (context.buffer || "") + buffer,
});

export const addLineItem = (buffer: string = "", context: TranslateContext) =>
  addBuffer((context.newLine ? repeat(INDENT, context.depth) : "") + buffer, {
    ...context,
    newLine: buffer.lastIndexOf("\n") === buffer.length - 1,
  });

export const addLine = (buffer: string = "", context: TranslateContext) =>
  addLineItem(buffer + "\n", context);

export const addOpenTag = (
  buffer: string,
  context: TranslateContext,
  indent: boolean = true
) => ({
  ...addLineItem(buffer, context),
  depth: indent ? context.depth + 1 : context.depth,
});

export const addCloseTag = (
  buffer: string,
  context: TranslateContext,
  indent: boolean = true
) =>
  addLineItem(buffer, {
    ...context,
    depth: indent ? context.depth - 1 : context.depth,
  });

export const setCurrentScope = (
  currentScope: string,
  context: TranslateContext
) => ({
  ...context,
  currentScope,
});

export const addScopedLayerLabel = (
  label: string,
  id: string,
  context: TranslateContext
) => {
  label = String(label).toLowerCase();
  if (context.scopedLabelRefs[id]) {
    return context;
  }

  const scope = context.currentScope;

  if (!context.scopedLabelRefs[scope]) {
    context = {
      ...context,
      scopedLabelRefs: {
        ...context.scopedLabelRefs,
        [context.currentScope]: EMPTY_OBJECT,
      },
    };
  }

  return {
    ...context,
    scopedLabelRefs: {
      ...context.scopedLabelRefs,
      [scope]: {
        ...context.scopedLabelRefs[scope],
        [label]: uniq([
          ...(context.scopedLabelRefs[scope][label] || EMPTY_ARRAY),
          id,
        ]),
      },
    },
  };
};

export const getInternalVarName = (node: PCNode) => "_" + node.id;

export const getScopedLayerLabelIndex = (
  label: string,
  id: string,
  context: TranslateContext
) => {
  return context.scopedLabelRefs[context.currentScope][
    String(label).toLowerCase()
  ].indexOf(id);
};

export const getPublicComponentClassName = (
  component: ContentNode,
  context: TranslateContext
) => {
  const varName = getPublicLayerVarName(component.label, component.id, context);
  return varName.substr(0, 1).toUpperCase() + varName.substr(1);
};

export const getPublicLayerVarName = (
  label: string,
  id: string,
  context: TranslateContext
) => {
  const i = getScopedLayerLabelIndex(label, id, context);
  return makeSafeVarName(camelCase(label || "child") + (i === 0 ? "" : i));
};

export const makeSafeVarName = (varName: string) => {
  if (/^\d/.test(varName)) {
    varName = "$" + varName;
  }
  return varName;
};

export const addWarning = (warning: Error, context: TranslateContext) => ({
  ...context,
  warnings: [...context.warnings, warning],
});
