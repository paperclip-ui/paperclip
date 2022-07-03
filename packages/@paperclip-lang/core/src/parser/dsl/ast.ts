import { AST } from "eslint";
import { createTreeUtils, memoize } from "tandem-common";
import { DocComment } from "../docco/ast";
import * as path from "path";
import * as URL from "url";

export type ASTDependencyGraph = Record<string, Document>;
export const VARIANT_ENABLED_PARAM_NAME = "enabled";

export enum ExpressionKind {
  Document = "Document",

  Import = "Import",
  Token = "Token",
  Array = "Array",

  /*

  component Test {
    test: 1
  }
  */
  Component = "Component",
  Override = "Override",
  Insert = "Insert",
  Slot = "Slot",

  // (a:b, c:d)
  Parameter = "Parameter",
  String = "String",
  Reference = "Reference",

  // 1px 1em
  Measurement = "Measurement",

  // 1, 100, -100
  Number = "Number",
  Boolean = "Boolean",

  /*
  style {
    background: red
    
  }
  */
  Style = "Style",
  StyleCondition = "StyleCondition",
  StyleDeclaration = "StyleDeclaration",
  StyleInclude = "StyleInclude",

  Text = "Text",
  Variant = "Variant",
  Render = "Render",
  Element = "Element",
  Fragment = "Fragment",
  SingleLineComment = "SingleLineComment",
  MultiLineComment = "MultiLineComment",
}

export type Raws = {
  before?: string;
  after?: string;
};

export type BaseExpression<TKind extends ExpressionKind> = {
  id: string;
  raws: Raws;
  kind: TKind;
};

export type Document = {
  expressions: DocumentExpression[];
} & BaseExpression<ExpressionKind.Document>;

export type Import = {
  path: string;
  namespace: string;
} & BaseExpression<ExpressionKind.Import>;

export type ValueToken = {
  isPublic?: boolean;
  name: string;
  value: string;
} & BaseExpression<ExpressionKind.Token>;

export type Component = {
  name: string;
  body: ComponentBodyExpression[];
  docComment?: DocComment;
  isPublic?: boolean;
} & BaseExpression<ExpressionKind.Component>;

export type ComponentBodyExpression = Render | Variant;

export type Parameter = {
  raws: Raws;
  name: string;
  value: ValueExpression;
} & BaseExpression<ExpressionKind.Parameter>;

export type StringExpression = {
  value: string;
} & BaseExpression<ExpressionKind.String>;

export type NumberExpression = {
  value: number;
} & BaseExpression<ExpressionKind.Number>;

export type BooleanExpression = {
  value: boolean;
} & BaseExpression<ExpressionKind.Boolean>;

export type Reference = {
  path: string[];
} & BaseExpression<ExpressionKind.Reference>;

export type ArrayExpression = {
  items: ValueExpression[];
} & BaseExpression<ExpressionKind.Array>;

export type ValueExpression =
  | StringExpression
  | NumberExpression
  | BooleanExpression
  | Reference
  | ArrayExpression;

export type ElementChild = Style | Node | Override | Insert | Slot;

export type Style = {
  name?: string;
  conditionNames: string[];
  body: StyleBodyExpression[];
  isPublic?: boolean;
} & BaseExpression<ExpressionKind.Style>;

export type StyleBodyExpression = StyleDeclaration | StyleInclude;

export type StyleDeclaration = {
  name: string;
  value: string;
} & BaseExpression<ExpressionKind.StyleDeclaration>;

export type StyleInclude = {
  ref: Reference;
} & BaseExpression<ExpressionKind.StyleInclude>;

export type Override = {
  target?: string[];
  constructorValue?: OverrideConstructorValue;
  body?: OverrideBodyExpression[];
} & BaseExpression<ExpressionKind.Override>;

export type Insert = {
  name: string;
  body: Node[];
} & BaseExpression<ExpressionKind.Insert>;

export type Slot = {
  name: string;
  body?: SlotChild[];
} & BaseExpression<ExpressionKind.Slot>;

export type SlotChild = Slot | Node;

export type OverrideConstructorValue = Parameter[] | string;

export type OverrideBodyExpression = Style | Variant;

export type Element = {
  children: ElementChild[];
  tagName: ElementName;
  name?: string;
  docComment: DocComment;
  parameters: Parameter[];
} & BaseExpression<ExpressionKind.Element>;

export type ElementName = {
  name: string;
  namespace?: string;
};

export type Fragment = {
  children: Node[];
} & BaseExpression<ExpressionKind.Fragment>;

export type Text = {
  name?: string;
  value: string;
  docComment: DocComment;
  children: TextChild[];
} & BaseExpression<ExpressionKind.Text>;

export type TextChild = Style;

export type Variant = {
  name: string;
  parameters: Parameter[];
} & BaseExpression<ExpressionKind.Variant>;

export type Render = {
  node: VisibleNode;
} & BaseExpression<ExpressionKind.Render>;

export type MultiLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.MultiLineComment>;

export type SingleLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.SingleLineComment>;

export type Comment = MultiLineComment | SingleLineComment;

export type VisibleNode = Text | Element | Fragment;
export type Node = VisibleNode | Comment;
export type DocumentExpression = Node | Component | Style | Import | ValueToken;
export type BodyExpression = Component | Node;
export type Expression =
  | MultiLineComment
  | SingleLineComment
  | Render
  | Variant
  | Text
  | Fragment
  | Element
  | Override
  | StyleInclude
  | StyleDeclaration
  | Style
  | ArrayExpression
  | Insert
  | Slot
  | Reference
  | StringExpression
  | BooleanExpression
  | NumberExpression
  | Parameter
  | Component
  | ValueToken
  | Import
  | Document
  | DocComment;

const flattenShallow = memoize((tree: Expression) => {
  switch (tree.kind) {
    case ExpressionKind.Document: {
      return [...tree.expressions];
    }
    case ExpressionKind.Array: {
      return [...tree.items];
    }
    case ExpressionKind.Component: {
      return [...tree.body, tree.docComment].filter(Boolean);
    }
    case ExpressionKind.Element: {
      return [...tree.children, ...tree.parameters];
    }
    case ExpressionKind.Override: {
      return tree.body ? [...tree.body] : [];
    }
    case ExpressionKind.Style: {
      return [...tree.body];
    }
    case ExpressionKind.Render: {
      return [tree.node];
    }
    case ExpressionKind.Insert: {
      return tree.body;
    }
    case ExpressionKind.Slot: {
      return tree.body || [];
    }
  }
  return [];
});

const {
  getIdMap,
  flatten,
  getAncestors,
  getById,
  getChildParentMap,
  getParent,
} = createTreeUtils<Expression>({
  flattenShallow,
});

export const isStyleable = (node: Element | Text | Override) =>
  node.kind === ExpressionKind.Element || node.kind === ExpressionKind.Text;
export const isComponent = (node: Expression): node is Component =>
  node.kind === ExpressionKind.Component;
export const isVisibleNode = (node: Expression): node is Element | Text =>
  node.kind === ExpressionKind.Element || node.kind === ExpressionKind.Text;
export const isInstance = (node: Expression, graph: ASTDependencyGraph) =>
  node.kind == ExpressionKind.Element &&
  getInstanceComponent(node, graph) != null;
export const getExprByName = (name: string, ctx: Expression) =>
  flatten(ctx).find((node) => {
    if (
      node.kind === ExpressionKind.Element ||
      node.kind === ExpressionKind.Text ||
      node.kind === ExpressionKind.Variant ||
      node.kind === ExpressionKind.Slot ||
      node.kind === ExpressionKind.Style
    ) {
      return node.name === name;
    }
    if (node.kind === ExpressionKind.Import) {
      return node.namespace === name;
    }
  }) as Text | Element;

export const getInstanceComponent = memoize(
  (element: Element, graph: ASTDependencyGraph) => {
    const instanceUrl = getExprDocUri(element, graph);
    const originUrl = element.tagName.namespace
      ? getNSUrl(element.tagName.namespace, instanceUrl, graph)
      : instanceUrl;
    const originDoc = graph[originUrl];
    return flatten(originDoc).find((el) => {
      return (
        el.kind === ExpressionKind.Component && el.name === element.tagName.name
      );
    }) as Component;
  }
);

export const getImportByNS = (ns: string, doc: Document) =>
  flatten(doc).find(
    (imp) => imp.kind === ExpressionKind.Import && imp.namespace === ns
  ) as Import;
const getNSUrl = (
  ns: string,
  documentUri: string,
  graph: ASTDependencyGraph
) => {
  const instancePath = fileURLToPath(documentUri);

  const filePath = path.resolve(
    path.dirname(instancePath),
    getImportByNS(ns, graph[documentUri]).path
  );

  return "file://" + filePath;
};

const fileURLToPath = (url) => url.replace("file://", "");

export const getOwnerInstance = (
  node: Expression,
  graph: ASTDependencyGraph
) => {
  const doc = getExprDocument(node, graph);
  const ancestors = getAncestors(node.id, doc);

  // TODO - check for insert parent, then skip next if present
  for (let i = 0, { length } = ancestors; i < length; i++) {
    const ancestor = ancestors[i];
    if (isComponent(ancestor)) {
      return getComponentRenderNode(ancestor);
    }
    if (isInstance(ancestor, graph)) {
      return ancestor;
    }
  }
};

export const isArrayExpression = (node: Expression): node is ArrayExpression =>
  node.kind === ExpressionKind.Array;

export const getExprDocUri = (node: Expression, graph: ASTDependencyGraph) => {
  return Object.keys(graph).find((uri) => {
    return getById(node.id, graph[uri]);
  });
};

export const getComponentRenderNode = (component: Component) =>
  (component.body.find((item) => item.kind === ExpressionKind.Render) as Render)
    ?.node;

export const getExprDocument = (
  node: Expression,
  graph: ASTDependencyGraph
) => {
  for (const uri in graph) {
    if (getById(node.id, graph[uri])) {
      return graph[uri];
    }
  }
};

export const getExpContentNode = (
  node: Expression,
  graph: ASTDependencyGraph
) => {
  const doc = getExprDocument(node, graph);
  return doc.expressions.find((contentNode) => getById(node.id, contentNode));
};

export {
  getIdMap,
  flatten,
  getAncestors,
  getById,
  getChildParentMap,
  getParent,
};
