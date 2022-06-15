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
  PCOverridablePropertyName,
  PCOverride,
  PCSourceTagNames,
  PCStyleOverride,
  PCTextNode,
  PCVariant,
  PCVariantTrigger,
  PCVariantTriggerSource,
  PCVariantTriggerSourceType,
} from "../dsl";
import * as ast from "../parser/dsl/ast";
import { parseDocument } from "../parser/dsl/parser";
import * as crypto from "crypto";
import { memoize } from "tandem-common";
import * as path from "path";

type Context = {
  ast: ast.Document;
  fileUrl: string;
  id: string;
  graph: Record<string, ast.Document>;
};

export const deserializeModule = (
  source: string,
  fileUrl: string,
  graph: Record<string, ast.Document>
): PCModule => {
  const ast = parseDocument(source);
  const id = md5(fileUrl);
  const context = { fileUrl, ast, id, graph };

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
    const variants = getComponentVariants(component);

    const variantTriggers: Array<[ast.Reference, ast.Variant]> = [];

    for (const variant of variants) {
      const trigger = variant.parameters.find(
        (param) => param.value.kind === ast.ExpressionKind.Array
      )?.value as ast.ArrayExpression;
      if (trigger?.items[0]?.kind === ast.ExpressionKind.Reference) {
        variantTriggers.push([trigger?.items[0], variant]);
      }
    }

    const ret = {
      id: getNodeId(component, context),
      name: PCSourceTagNames.COMPONENT,
      label: component.name,
      variant,
      children: [
        ...variants.map(deserializeVariant(context)),
        ...variantTriggers.map(deserializeVariantTrigger(context)),
        ...deserializeVariantOverrides(node, component),
        ...(node.children
          .filter(isComponentChild)
          .map(deserializeElementChild(context))
          .filter(Boolean) as PCComponentChild[]),
        ,
      ],
      is: tagName,
      attributes: deserializeAttributes(node),
      style: style ? deserializeStyleDeclarations(style) : {},
      metadata: {},
    } as PCComponent;

    return ret;
  };

const isComponentChild = (child: ast.ElementChild) => {
  return child.kind === ast.ExpressionKind.Element || ast.ExpressionKind.Text;
};

const getComponentVariants = memoize((component: ast.Component) => {
  const variants = component.body.filter(
    (item) => item.kind === ast.ExpressionKind.Variant
  ) as ast.Variant[];
  return variants;
});

const deserializeVariantOverrides = (
  node: ast.Element,
  component: ast.Component
): PCOverride[] => {
  const overrides: PCOverride[] = [];

  for (const descendent of ast.flatten(node)) {
    if (descendent.kind === ast.ExpressionKind.Style) {
      const override = deserializeStyleOverride(descendent, component);
      if (override) {
        overrides.push(override);
      }
    }
  }
  return overrides;
};

const getVariantByName = (name: string, component: ast.Component) =>
  component.body.find(
    (child) => child.kind === ast.ExpressionKind.Variant && child.name === name
  );

const deserializeStyleOverride = (
  style: ast.Style,
  component: ast.Component
) => {
  const parent = ast.getParent(style.id, component);

  if (parent.kind !== ast.ExpressionKind.Override && !style.conditionName) {
    return null;
  }

  // covers syntax: `render B { style { color red }}`, `render B { override nested { }}
  // let styleTarget = ast.getAncestors(style.id, component).find(el => {
  //   if (el.kind === ast.ExpressionKind.Element) {
  //     return true;
  //   }
  // }) as ast.Element | ast.Component;

  const targetIdPath =
    parent.kind === ast.ExpressionKind.Override ? parent.target : [];

  // if (ast.getParent(styleTarget.id, component).kind === ast.ExpressionKind.Render) {
  //   styleTarget = component;
  // }

  const variant = style.conditionName
    ? getVariantByName(style.conditionName, component)
    : null;

  return {
    id: style.id,
    name: PCSourceTagNames.OVERRIDE,
    targetIdPath,
    variantId: variant?.id,
    children: [],
    propertyName: PCOverridablePropertyName.STYLE,
    value: deserializeStyleDeclarations(style),
  } as PCStyleOverride;
};

const getOverrideRef = (
  targetNamePath: string[],
  scope: ast.Element,
  context: Context
) => {
  const idPath: string[];

  let currentScope: ast.Expression = scope;

  for (const name of targetNamePath) {
    const ref = getRef([name], scope, context);
    scope = ref;
  }

  return idPath;
};

type ExpressionInfo = { uri: string; expr: ast.Expression };

const getRef = (
  refPath: string[],
  scope: ast.Expression,
  context: Context
): ExpressionInfo => {
  let currFileUri = context.fileUrl;

  return refPath.reduce(
    ({ uri, expr }, name) => {
      if (expr.kind === ast.ExpressionKind.Element) {
        const info = getRef(
          expr.tagName.namespace
            ? [expr.tagName.namespace, expr.tagName.name]
            : [expr.tagName.name],
          context.ast,
          context
        ) || { uri, expr: scope };
        uri = info.uri;
        expr = info.expr;
      }

      if (expr.kind === ast.ExpressionKind.Import) {
        uri = path.relative(currFileUri, expr.path);
        scope = context.graph[uri];
        return { uri, expr: scope };
      }

      return {
        expr: ast.flatten(scope).find((expr) => {
          if (expr.kind === ast.ExpressionKind.Import) {
            return expr.namespace === name;
          } else if (
            expr.kind === ast.ExpressionKind.Component ||
            expr.kind === ast.ExpressionKind.Style ||
            expr.kind === ast.ExpressionKind.Token
          ) {
            return expr.name === name;
          }
        }),
        uri,
      };
    },
    { uri: context.fileUrl, expr: scope }
  );
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
      id: variant.id,
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

const deserializeStyleDeclarations = (style: ast.Style) => {
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

const getNodeId = memoize(
  (
    node: ast.Text | ast.Element | ast.Component | ast.Variant,
    context: Context
  ) => node.id
);

const md5 = (value: string) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
