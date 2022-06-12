import {
  PAPERCLIP_MODULE_VERSION,
  PCBaseElementChild,
  PCComponent,
  PCElement,
  PCModule,
  PCModuleChild,
  PCNode,
  PCSourceTagNames,
  PCTextNode,
} from "../dsl";
import * as ast from "../parser/dsl/ast";
import { parseDocument } from "../parser/dsl/parser";
import * as crypto from "crypto";

type Context = {
  ast: ast.Document;
  fileUrl: string;
  id: string;
};

export const deserializeModule = (
  source: string,
  fileUrl: string
): PCModule => {
  const ast = parseDocument(source);
  const id = md5(fileUrl);
  const context = { fileUrl, ast, id };

  return {
    id: `${id}_module`,
    version: PAPERCLIP_MODULE_VERSION,
    name: PCSourceTagNames.MODULE,
    children: deserializeModuleChildren(context),
    metadata: {},
  };
};

const deserializeModuleChildren = (context: Context): PCModuleChild[] => {
  return [
    ...context.ast.expressions
      .filter((expr) => expr.kind === ast.ExpressionKind.Component)
      .map(deserializeComponent(context)),
  ];
};

const deserializeComponent =
  (context: Context) =>
  (component: ast.Component): PCComponent => {
    const variant = {};

    return {
      id: getNodeId(component, context),
      name: PCSourceTagNames.COMPONENT,
      label: component.name,
      variant,
      children: [],
      is: "div",
      attributes: {},
      style: {},
      metadata: {},
    };
  };

const deserializeComponentRender =
  (context: Context) =>
  (render: ast.Render): PCNode => {
    return deserializeNode(render.node, context);
  };

const deserializeNode = (
  node: ast.Node,
  context: Context
): PCElement | PCTextNode => {
  if (node.kind === ast.ExpressionKind.Element) {
    return deserializeElement(node, context);
  } else if (node.kind === ast.ExpressionKind.Text) {
    return deserializeTextNode(node, context);
  }
};

const deserializeElementChild =
  (context: Context) =>
  (node: ast.ElementChild): PCBaseElementChild => {
    if (node.kind === ast.ExpressionKind.Override) {
    } else if (node.kind === ast.ExpressionKind.Style) {
    } else {
      return deserializeNode(node, context);
    }
  };

const deserializeElement = (node: ast.Element, context: Context): PCElement => {
  return {
    id: getNodeId(node, context),
    name: PCSourceTagNames.ELEMENT,
    attributes: {},
    is: node.tagName.name,
    style: {},
    children: node.children.map(deserializeElementChild(context)),
    metadata: {},
  };
};

const deserializeTextNode = (node: ast.Text, context: Context): PCTextNode => {
  return {
    id: getNodeId(node, context),
    name: PCSourceTagNames.TEXT,
    value: node.value,
    style: {},
    children: [],
    metadata: {},
  };
};

const getNodeId = (
  node: ast.Text | ast.Element | ast.Component,
  context: Context
) =>
  node.name
    ? `${context.id}_${node.name}`
    : String(Math.round(Math.random() * 99999999));

const md5 = (value: string) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
