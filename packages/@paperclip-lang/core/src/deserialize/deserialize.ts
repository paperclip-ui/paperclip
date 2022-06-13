import {
  PAPERCLIP_MODULE_VERSION,
  PCBaseElementChild,
  PCComponent,
  PCComponentChild,
  PCElement,
  PCElementState,
  PCModule,
  PCModuleChild,
  PCNode,
  PCSourceTagNames,
  PCTextNode,
  PCVariant,
  PCVariantTrigger,
  PCVariantTriggerSource,
  PCVariantTriggerSourceType,
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

    const render = component.body.find(
      (expr) => expr.kind === ast.ExpressionKind.Render
    ) as ast.Render;
    const node = render?.node as ast.Element;
    const { name: tagName, namespace } = node.tagName || {};

    const style = node.children.find(
      (child) => child.kind === ast.ExpressionKind.Style
    ) as ast.Style;
    const variants = component.body.filter(
      (item) => item.kind === ast.ExpressionKind.Variant
    ) as ast.Variant[];

    const variantTriggers: Array<[ast.Reference, ast.Variant]> = [];

    for (const variant of variants) {
      const trigger = variant.parameters.find(
        (param) => param.value.kind === ast.ExpressionKind.Array
      )?.value as ast.ArrayExpression;
      if (trigger?.items[0]?.kind === ast.ExpressionKind.Reference) {
        variantTriggers.push([trigger?.items[0], variant]);
      }
    }

    return {
      id: getNodeId(component, context),
      name: PCSourceTagNames.COMPONENT,
      label: component.name,
      variant,
      children: [
        ...variants.map(deserializeVariant(context)),
        ...variantTriggers.map(deserializeVariantTrigger(context)),
        ...(node.children
          .filter(isComponentChild)
          .map(deserializeElementChild(context))
          .filter(Boolean) as PCComponentChild[]),
      ],
      is: tagName,
      attributes: deserializeAttributes(node),
      style: style ? deserializeBaseStyle(style) : {},
      metadata: {},
    } as PCComponent;
  };

const isComponentChild = (child: ast.ElementChild) => {
  return child.kind === ast.ExpressionKind.Element || ast.ExpressionKind.Text;
};

const deserializeVariantTrigger =
  (context: Context) =>
  (
    [ref, variant]: [ast.Reference, ast.Variant],
    index: number
  ): PCVariantTrigger => {
    return {
      id: getNodeId(variant, context) + "_trigger" + index,
      name: PCSourceTagNames.VARIANT_TRIGGER,
      children: [],
      source: {
        type: PCVariantTriggerSourceType.STATE,
        state: ref.path[1].toLowerCase(),
      } as PCVariantTriggerSource,
      targetVariantId: getNodeId(variant, context),
      metadata: {},
    };
  };

const deserializeVariant =
  (context: Context) =>
  (variant: ast.Variant): PCVariant => {
    return {
      id: getNodeId(variant, context),
      name: PCSourceTagNames.VARIANT,
      label: variant.name,
      children: [],
      isDefault: variant.parameters.some(
        (param) =>
          param.name === "on" &&
          (param.value as ast.BooleanExpression).value === true
      ),
      metadata: {},
    };
  };

const deserializeBaseStyle = (style: ast.Style) => {
  const style2 = {};
  for (const item of style.body) {
    if (item.kind === ast.ExpressionKind.StyleDeclaration) {
      style2[item.name] = item.value;
    }
  }
  return style2;
};

const deserializeAttributes = (node: ast.Element) => {
  const attributes = {};
  for (const param of node.parameters) {
    attributes[param.name] = deserializeValue(param.value);
  }
  return attributes;
};

const deserializeValue = (node: ast.ValueExpression) => {
  if (
    node.kind === ast.ExpressionKind.Number ||
    node.kind === ast.ExpressionKind.String
  ) {
    return node.value;
  } else if (node.kind === ast.ExpressionKind.Reference) {
    return node.path.join(".");
  }
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
    children: node.children
      .map(deserializeElementChild(context))
      .filter(Boolean),
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
  node: ast.Text | ast.Element | ast.Component | ast.Variant,
  context: Context
) =>
  node.name
    ? `${context.id}_${node.name}`
    : String(Math.round(Math.random() * 99999999));

const md5 = (value: string) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
