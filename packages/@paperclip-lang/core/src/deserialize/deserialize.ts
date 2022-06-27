import {
  PAPERCLIP_MODULE_VERSION,
  PCComponent,
  PCComponentChild,
  PCElement,
  PCModule,
  PCModuleChild,
  PCOverridablePropertyName,
  PCOverride,
  PCSourceTagNames,
  PCTextNode,
  PCVariant,
  PCVariantTrigger,
  PCVariantTriggerSource,
  PCVariantTriggerSourceType,
} from "../dsl";
import * as ast from "../parser/dsl/ast";
import * as crypto from "crypto";
import { EMPTY_ARRAY, memoize } from "tandem-common";
import * as path from "path";

type Context = {
  ast: ast.Document;
  fileUrl: string;
  id: string;
  graph: Record<string, ast.Document>;
};

export const deserializeModule = (
  ast: ast.Document,
  fileUrl: string,
  graph: Record<string, ast.Document>
): PCModule => {
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

    const componentTagName = namespace
      ? ast.getInstanceComponent(node, context.graph).id
      : tagName;

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
        ...deserializeOverrides(node, context),
        ...(node.children
          .map(deserializeVisibleNode(context))
          .filter(Boolean) as PCComponentChild[]),
        ,
      ],
      is: componentTagName,
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

// const deserializeStyleOverrides = (
//   node: ast.Element,
//   component: ast.Component
// ): PCOverride[] => {
//   const overrides: PCOverride[] = [];

//   for (const descendent of ast.flatten(node)) {
//     if (descendent.kind === ast.ExpressionKind.Style) {
//       const override = deserializeStyleOverride(descendent, component);
//       if (override) {
//         overrides.push(override);
//       }
//     }
//   }
//   return overrides;
// };

/**
 * Deserializes all nested overrides of this specific instance. Note that this function
 * is only
 */

const deserializeOverrides = (
  instance: ast.Element,
  context: Context
): PCOverride[] => {
  if (
    !ast.isInstance(instance, context.graph) &&
    ast.getParent(instance.id, ast.getExprDocument(instance, context.graph))
      .kind !== ast.ExpressionKind.Render
  ) {
    return EMPTY_ARRAY;
  }
  const overrides: PCOverride[] = [];

  // flatten all nested children of this instance
  for (const descendent of ast.flatten(instance)) {
    if (ast.getOwnerInstance(descendent, context.graph) !== instance) {
      continue;
    }

    // styles to be handled separately since conditional styles are style overrides. Styles
    // may also be defined independently of overrides
    if (
      descendent.kind === ast.ExpressionKind.Style &&
      isStyleOverride(descendent, instance)
    ) {
      overrides.push(
        deserializeStyleOverride(descendent, instance, context.graph)
      );
    } else if (descendent.kind === ast.ExpressionKind.Override) {
      overrides.push(
        ...deserializeOverride(descendent, instance, context.graph)
      );
    }
  }

  return overrides;
};

const isStyleOverride = (node: ast.Style, instance: ast.Element) => {
  const styleParent = ast.getParent(node.id, instance);

  // if no condition name
  if (
    !node.conditionNames.length &&
    styleParent.kind !== ast.ExpressionKind.Override
  ) {
    return null;
  }

  return true;
};

const deserializeOverride = (
  override: ast.Override,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
): PCOverride[] => {
  const overrides: PCOverride[] = [];

  if (typeof override.constructorValue === "string") {
    overrides.push(deserializeTextOverride(override, instance, graph));
  }

  if (override.body) {
    const hasVariantOverride = override.body.some(
      (child) => child.kind === ast.ExpressionKind.Variant
    );
    if (hasVariantOverride) {
      overrides.push(deserializeVariantOverride(override, instance, graph));
    }
  }

  return overrides;
};

const deserializeVariantOverride = (
  override: ast.Override,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
): PCOverride => {
  return {
    id: override.id,
    name: PCSourceTagNames.OVERRIDE,
    propertyName: PCOverridablePropertyName.VARIANT,
    value: getOverrideVariantIds(override, instance, graph),
    targetIdPath: override.target
      ? getInstanceRef(override.target, instance, graph)
      : EMPTY_ARRAY,
    variantId: null,
    metadata: {},
    children: [],
  };
};

const getOverrideVariantIds = (
  override: ast.Override,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
): Record<string, boolean> => {
  const variantOverrides = override.body.filter(
    (child) => child.kind === ast.ExpressionKind.Variant
  ) as ast.Variant[];
  const variantIds: Record<string, boolean> = {};
  for (const variantOverride of variantOverrides) {
    if (isVariantEnabledByDefault(variantOverride)) {
      variantIds[getInstanceRef([variantOverride.name], instance, graph)[0]] =
        true;
    }
  }

  return variantIds;
};

const deserializeTextOverride = (
  override: ast.Override,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
): PCOverride => {
  return {
    id: override.id,
    name: PCSourceTagNames.OVERRIDE,
    propertyName: PCOverridablePropertyName.TEXT,
    value: String(override.constructorValue),
    children: [],
    metadata: {},
    targetIdPath: getInstanceRef(override.target, instance, graph),
    variantId: null,
  };
};

const deserializeStyleOverride = (
  node: ast.Style,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
): PCOverride => {
  const styleParent = ast.getParent(node.id, instance);

  // if no condition name
  if (
    !node.conditionNames.length &&
    styleParent.kind !== ast.ExpressionKind.Override
  ) {
    return null;
  }

  let targetIdPath: string[] =
    styleParent.kind == ast.ExpressionKind.Override && styleParent.target
      ? getInstanceRef(styleParent.target, instance, graph)
      : [];

  const contentNode = ast.getExpContentNode(node, graph) as ast.Component;
  const variant = node.conditionNames.length
    ? getVariantByName(node.conditionNames[0], contentNode)
    : null;

  return {
    id: node.id,
    name: PCSourceTagNames.OVERRIDE,
    propertyName: PCOverridablePropertyName.STYLE,
    value: deserializeStyleDeclarations(node),
    targetIdPath,
    variantId: variant?.id,
    metadata: {},
    children: [],
  };
};

const getInstanceRef = (
  target: string[],
  ctx: ast.Element | ast.Text | ast.Component,
  graph: ast.ASTDependencyGraph
) => {
  return target.map((name) => {
    if (ast.isInstance(ctx, graph)) {
      ctx = ast.getInstanceComponent(
        ctx as ast.Element,
        graph
      ) as ast.Component;
    }

    return (ctx = ast.getExprByName(name, ctx)).id;
  });
};

const getVariantByName = (name: string, component: ast.Component) =>
  component.body.find(
    (child) => child.kind === ast.ExpressionKind.Variant && child.name === name
  );

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
      isDefault: isVariantEnabledByDefault(variant),
      metadata: {},
    };
  };

const isVariantEnabledByDefault = (variant: ast.Variant) => {
  for (const param of variant.parameters) {
    if (param.name === ast.VARIANT_ENABLED_PARAM_NAME) {
      return ast
        .flatten(param.value)
        .some(
          (value) => value.kind === ast.ExpressionKind.Boolean && value.value
        );
    }
  }
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

const deserializeVisibleNode =
  (context: Context) =>
  (node: ast.Node): PCElement | PCTextNode => {
    if (node.kind === ast.ExpressionKind.Element) {
      return deserializeElement(node, context);
    } else if (node.kind === ast.ExpressionKind.Text) {
      return deserializeTextNode(node, context);
    }
  };

const deserializeElement = (node: ast.Element, context: Context): PCElement => {
  return {
    id: getNodeId(node, context),
    name: PCSourceTagNames.ELEMENT,
    attributes: {},
    label: node.name,
    is: node.tagName.name,
    style: {},
    children: [
      ...node.children.map(deserializeVisibleNode(context)).filter(Boolean),
      ...deserializeOverrides(node, context),
    ],
    metadata: {},
  };
};

const deserializeTextNode = (node: ast.Text, context: Context): PCTextNode => {
  const style = node.children.find(
    (child) => child.kind === ast.ExpressionKind.Style
  ) as ast.Style;

  return {
    id: getNodeId(node, context),
    name: PCSourceTagNames.TEXT,
    value: node.value,
    label: node.name,
    style: style ? deserializeStyleDeclarations(style) : {},
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
