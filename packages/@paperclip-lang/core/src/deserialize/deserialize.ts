import {
  PAPERCLIP_MODULE_VERSION,
  PCComponent,
  PCComponentChild,
  PCComponentInstanceElement,
  PCElement,
  PCElementStyleMixin,
  PCModule,
  PCModuleChild,
  PCOverridablePropertyName,
  PCOverride,
  PCPlug,
  PCSlot,
  PCSourceTagNames,
  PCTextNode,
  PCVariable,
  PCVariableType,
  PCVariant,
  PCVariantTrigger,
  PCVariantTriggerSource,
  PCVariantTriggerSourceType,
  StyleMixins,
} from "../dsl";
import * as ast from "../parser/dsl/ast";
import * as crypto from "crypto";
import { EMPTY_ARRAY, memoize } from "tandem-common";
import * as path from "path";
import {
  DocCommentExpressionKind,
  DocCommentParameterValue,
  DocCommentPropertyValue,
} from "../parser/docco/ast";
import { last } from "lodash";
import { DependencyGraph } from "..";

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
      .map((child) => deserializeModuleChild(child, context))
      .filter(Boolean),
  ];
};

const deserializeModuleChild = (
  child: ast.Expression,
  context: Context
): PCModuleChild => {
  if (child.kind === ast.ExpressionKind.Component) {
    return deserializeComponent(child, context);
  } else if (child.kind === ast.ExpressionKind.Style) {
    return deserializeStyleMixin(child, context);
  } else if (child.kind === ast.ExpressionKind.Element) {
    return deserializeElement(child, context);
  } else if (child.kind === ast.ExpressionKind.Text) {
    return deserializeTextNode(child, context);
  } else if (child.kind === ast.ExpressionKind.Token) {
    return deserializeToken(child, context);
  }
};

const deserializeToken = (
  child: ast.ValueToken,
  context: Context
): PCVariable => {
  return {
    id: child.id,
    name: PCSourceTagNames.VARIABLE,
    type: PCVariableType.COLOR,
    label: child.name,
    value: child.value,
    metadata: {},
    children: [],
  };
};

const deserializeStyleMixin = (
  style: ast.Style,
  context: Context
): PCElementStyleMixin => {
  return {
    id: style.id,
    name: PCSourceTagNames.STYLE_MIXIN,
    targetType: PCSourceTagNames.ELEMENT,
    label: style.name,
    metadata: {
      bounds: { left: 0, top: 0, right: 100, bottom: 100 },
    },
    children: [],
    styleMixins: deserializeAppliedStyleMixins(style, style, context),
    style: deserializeStyleDeclarations(style, context),
  };
};

const deserializeComponent = (
  component: ast.Component,
  context: Context
): PCComponent => {
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

  const metadata = deserializeMetadata(component);

  const ret = {
    id: getNodeId(component, context),
    name: PCSourceTagNames.COMPONENT,
    label: component.name,
    children: [
      ...variants.map(deserializeVariant(context)),
      ...variantTriggers.map(deserializeVariantTrigger(context)),
      ...deserializeOverrides(node, context),
      ...node.children.map((child) =>
        deserializeVisibleNode(child as ast.Node, node, context)
      ),
    ].filter(Boolean),
    is: componentTagName,
    controllers: deserializeControllers(component),
    attributes: deserializeAttributes(node),
    styleMixins: style
      ? deserializeAppliedStyleMixins(style, node, context)
      : {},
    style: style ? deserializeStyleDeclarations(style, context) : {},
    metadata,
    variant: deserializeInstanceVariants(node, context),
  } as PCComponent;

  return ret;
};

const deserializeControllers = (component: ast.Component) => {
  return (
    component.body.filter(
      (child) =>
        child.kind === ast.ExpressionKind.Script &&
        child.parameters.some((param) => param.name === "src")
    ) as ast.Script[]
  ).map((script) => {
    return (
      script.parameters.find((param) => param.name === "src")
        .value as ast.StringExpression
    ).value;
  });
};

const deserializeMetadata = (node: ast.Component | ast.Element | ast.Text) => {
  if (!node.docComment) {
    return {};
  }
  const metadata = {};

  for (const prop of node.docComment.properties) {
    metadata[prop.name] = deserializeMetadataProp(prop.value);
  }

  return metadata;
};

const deserializeMetadataProp = (prop: DocCommentPropertyValue) => {
  if (prop.kind === DocCommentExpressionKind.CommentParameters) {
    const params = {};
    for (const param of prop.values) {
      params[param.name] = deserializeParamValue(param.value);
    }
    return params;
  } else if (prop.kind === DocCommentExpressionKind.Text) {
    return prop.value;
  }
};

const deserializeParamValue = (prop: DocCommentParameterValue) => {
  if (prop.kind === DocCommentExpressionKind.Text) {
    return prop.value;
  } else if (prop.kind === DocCommentExpressionKind.Number) {
    return Number(prop.value);
  }
};

const getComponentVariants = memoize((component: ast.Component) => {
  const variants = component.body.filter(
    (item) => item.kind === ast.ExpressionKind.Variant
  ) as ast.Variant[];
  return variants;
});

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
      overrides.push(deserializeStyleOverride(descendent, instance, context));
    } else if (descendent.kind === ast.ExpressionKind.Override) {
      overrides.push(...deserializeOverride(descendent, instance, context));
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
  context: Context
): PCOverride[] => {
  const overrides: PCOverride[] = [];

  if (typeof override.constructorValue === "string") {
    overrides.push(deserializeTextOverride(override, instance, context.graph));
  }

  const variantOverridesByTrigger: Record<string, ast.Variant[]> = {};

  const variantOverrides =
    (override.body?.filter(
      (child) => child.kind === ast.ExpressionKind.Variant
    ) as ast.Variant[]) || EMPTY_ARRAY;

  for (const variant of variantOverrides) {
    const enabledParam = variant.parameters.find(
      (param) => param.name === "enabled"
    );
    const values = enabledParam && ast.flatten(enabledParam.value);
    const ref = values.find(
      (value) => value.kind === ast.ExpressionKind.Reference
    ) as ast.Reference;
    if (ref) {
      if (!variantOverridesByTrigger[ref.path[0]]) {
        variantOverridesByTrigger[ref.path[0]] = [];
      }
      variantOverridesByTrigger[ref.path[0]].push(variant);
    }
  }

  if (override.body && override.target && variantOverrides.length) {
    overrides.push(
      deserializeVariantOverride(override, instance, context.graph)
    );
  }

  if (Object.keys(variantOverridesByTrigger).length) {
    const component = ast.getExpContentNode(
      instance,
      context.graph
    ) as ast.Component;

    for (const name in variantOverridesByTrigger) {
      const triggerExpr = getComponentVariant(name, component);

      const value = variantOverridesByTrigger[name].reduce((map, variant) => {
        const refId = getVariantOverrideTargetId(
          override,
          variant,
          instance,
          context.graph
        );
        map[refId] = true;
        return map;
      }, {});

      overrides.push({
        id: `${Object.keys(value).join("_")}_override`,
        name: PCSourceTagNames.OVERRIDE,
        variantId: triggerExpr.id,
        propertyName: PCOverridablePropertyName.VARIANT,
        value,
        targetIdPath: [],
        metadata: {},
        children: [],
      });
    }
  }

  return overrides;
};

const getVariantOverrideTargetId = (
  override: ast.Override,
  variant: ast.Variant,
  instance: ast.Element,
  graph: ast.ASTDependencyGraph
) =>
  last(
    getInstanceRef(
      [...(override.target || EMPTY_ARRAY), variant.name],
      instance,
      graph
    )
  );

const getComponentVariant = (name: string, component: ast.Component) =>
  component.body?.find(
    (child) => child.kind === ast.ExpressionKind.Variant && child.name === name
  ) as ast.Variant;

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
      const ref = getVariantOverrideTargetId(
        override,
        variantOverride,
        instance,
        graph
      );
      variantIds[ref] = true;
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
  context: Context
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
      ? getInstanceRef(styleParent.target, instance, context.graph)
      : [];

  const contentNode = ast.getExpContentNode(node, context.graph);

  const variant =
    node.conditionNames.length &&
    contentNode.kind === ast.ExpressionKind.Component
      ? getVariantByName(node.conditionNames[0], contentNode)
      : null;

  return {
    id: node.id,
    name: PCSourceTagNames.OVERRIDE,
    propertyName: PCOverridablePropertyName.STYLE,
    value: deserializeStyleDeclarations(node, context),
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

    let ctx2 = ast.getExprByName(name, ctx);

    // TEMPORARY! See https://github.com/tandem-ui/tandem/issues/60
    while (!ctx2 && ctx.kind === ast.ExpressionKind.Component) {
      const render = ctx.body.find(
        (child) => child.kind === ast.ExpressionKind.Render
      ) as ast.Render;
      if (render && ast.isInstance(render?.node, graph)) {
        ctx = ast.getInstanceComponent(render.node as ast.Element, graph);
        ctx2 = ast.getExprByName(name, ctx);
      } else {
        break;
      }
    }

    ctx = ctx2;

    return ctx.id;
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
      if (
        expr.kind === ast.ExpressionKind.StyleInclude ||
        expr.kind === ast.ExpressionKind.StyleDeclaration
      ) {
        const doc = context.ast;
        expr = ast.getExprByName(name, doc);

        // const info = getRef(
        //   expr.ref.path,
        //   context.ast,
        //   context
        // );

        // uri = info.uri;
        // expr = info.expr;
        // return { uri, expr };
      }

      // if (expr.kind === ast.ExpressionKind.Element) {
      //   const doc = context.ast;
      //   expr = ast.getExprByName(name, doc);

      //   // const info = getRef(
      //   //   expr.tagName.namespace
      //   //     ? [expr.tagName.namespace, expr.tagName.name]
      //   //     : [expr.tagName.name],
      //   //   context.ast,
      //   //   context
      //   // ) || { uri, expr: scope };
      //   // uri = info.uri;
      //   // expr = info.expr;
      // }

      if (expr.kind === ast.ExpressionKind.Import) {
        const dir = path.dirname(currFileUri.replace("file://", ""));

        uri = "file://" + path.join(dir, expr.path);
        scope = context.graph[uri];
        return { uri, expr: scope };
      }

      return {
        expr: ast.flatten(expr).find((expr) => {
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

const deserializeStyleDeclarations = (style: ast.Style, context: Context) => {
  const style2 = {};
  for (const item of style.body) {
    if (item.kind === ast.ExpressionKind.StyleDeclaration) {
      let value = item.value;

      // naughty!
      while (value.includes("#{")) {
        const ref = value.match(/\#{(.*?)\}/)[1].split(".");
        const token = getRef(ref, item, context);
        value = value.replace(/#\{.*?\}/, `var(--${token.expr.id})`);
      }

      style2[item.name] = value;
    }
  }
  return style2;
};

const deserializeAppliedStyleMixins = (
  style: ast.Style,
  node: ast.Expression,
  context: Context
) => {
  const mixins: StyleMixins = {};
  const variantId = style.conditionNames.length
    ? getRef([style.conditionNames[0]], node, context).expr.id
    : null;

  let i = 0;

  for (const item of style.body) {
    if (item.kind === ast.ExpressionKind.StyleInclude) {
      mixins[getRef(item.ref.path, item, context).expr.id] = {
        priority: i,
        variantId,
      };
      i++;
    }
  }

  return mixins;
};

const deserializeAttributes = (node: ast.Element) => {
  const attributes: any = {};
  for (const param of node.parameters) {
    attributes[param.name] = deserializeValue(param.value);
  }
  if (node.tagName.name === "svg") {
    attributes.xmlns = "http://www.w3.org/2000/svg";
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

const deserializeVisibleNode = (
  node: ast.Node | ast.Slot | ast.Insert,
  parent: ast.Node | ast.Slot | ast.Insert,
  context: Context
): PCElement | PCTextNode | PCSlot | PCPlug | PCComponentInstanceElement => {
  if (node.kind === ast.ExpressionKind.Element) {
    return deserializeElement(node, context);
  } else if (node.kind === ast.ExpressionKind.Text) {
    return deserializeTextNode(node, context);
  } else if (node.kind === ast.ExpressionKind.Insert) {
    return deserializeInsert(node, parent as ast.Element, context);
  } else if (node.kind === ast.ExpressionKind.Slot) {
    return deserializeSlot(node, context);
  }
};

const deserializeElement = (
  node: ast.Element,
  context: Context
): PCElement | PCComponentInstanceElement => {
  const style = node.children.find(
    (child) => child.kind === ast.ExpressionKind.Style
  ) as ast.Style;

  const isInstance = ast.isInstance(node, context.graph);

  if (isInstance) {
    return deserializeInstanceElement(node, context);
  } else {
    return deserializeNativeElement(node, context);
  }
};

const deserializeBaseElementProps = (node: ast.Element, context: Context) => {
  const style = node.children.find(
    (child) => child.kind === ast.ExpressionKind.Style
  ) as ast.Style;

  return {
    id: node.id,
    attributes: deserializeAttributes(node),
    label: node.name,
    styleMixins: style
      ? deserializeAppliedStyleMixins(style, style, context)
      : {},
    style: deserializeStyleDeclarations2(node, context),
    metadata: deserializeMetadata(node),
    children: [
      ...node.children.map((child) =>
        deserializeVisibleNode(child as ast.Node, node, context)
      ),
      ...deserializeOverrides(node, context),
    ].filter(Boolean),
  };
};

const deserializeStyleDeclarations2 = (node: ast.Element, context: Context) => {
  const entireStyle = {};

  const style = node.children.find(
    (child) => child.kind === ast.ExpressionKind.Style
  ) as ast.Style;

  const styleOverrides = node.children.filter((child) => {
    return (
      child.kind === ast.ExpressionKind.Override &&
      !child.target &&
      child.body?.find((nested) => {
        return (
          nested.kind === ast.ExpressionKind.Style &&
          nested.conditionNames.length === 0
        );
      })
    );
  }) as ast.Override[];

  if (style) {
    Object.assign(entireStyle, deserializeStyleDeclarations(style, context));
  }

  // for (const override of styleOverrides) {
  //   const style = override.body.find(child => child.kind === ast.ExpressionKind.Style) as ast.Style;
  //   Object.assign(entireStyle, deserializeStyleDeclarations(style, context));
  // }

  return entireStyle;
};

const deserializeInstanceElement = (
  node: ast.Element,
  context: Context
): PCComponentInstanceElement => {
  const component = ast.getInstanceComponent(node, context.graph);

  return {
    ...deserializeBaseElementProps(node, context),
    name: PCSourceTagNames.COMPONENT_INSTANCE,
    variant: deserializeInstanceVariants(node, context),
    is: component.id,
  };
};

const deserializeInstanceVariants = (node: ast.Element, context: Context) => {
  const variantOverrides = node.children.filter(
    (child) =>
      child.kind === ast.ExpressionKind.Override &&
      !child.target &&
      child.body?.some((child) => {
        return child.kind === ast.ExpressionKind.Variant;
      })
  ) as ast.Override[];

  const retVariant: Record<string, boolean> = {};

  for (const variantOverride of variantOverrides) {
    for (const expr of variantOverride.body) {
      if (expr.kind === ast.ExpressionKind.Variant) {
        const [refId] = getInstanceRef([expr.name], node, context.graph);
        if (isVariantEnabledByDefault(expr)) {
          retVariant[refId] = true;
        }
      }
    }
  }

  return retVariant;
};

const deserializeNativeElement = (
  node: ast.Element,
  context: Context
): PCElement => {
  return {
    ...deserializeBaseElementProps(node, context),
    name: PCSourceTagNames.ELEMENT,
    is: node.tagName.name,
  };
};

const deserializeSlot = (node: ast.Slot, context: Context): PCSlot => {
  return {
    id: node.id,
    name: PCSourceTagNames.SLOT,
    label: node.name,
    metadata: {},
    children: (node.body || EMPTY_ARRAY).map((child) =>
      deserializeVisibleNode(child, node, context)
    ),
  };
};

const deserializeInsert = (
  node: ast.Insert,
  parent: ast.Element,
  context: Context
): PCPlug => {
  return {
    id: node.id,
    name: PCSourceTagNames.PLUG,
    slotId: getInstanceRef([node.name], parent, context.graph)[0],
    metadata: {},
    children: (node.body || EMPTY_ARRAY).map((child) =>
      deserializeVisibleNode(child, node, context)
    ),
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
    styleMixins: style
      ? deserializeAppliedStyleMixins(style, node, context)
      : {},
    label: node.name,
    style: style ? deserializeStyleDeclarations(style, context) : {},
    children: [],
    metadata: deserializeMetadata(node),
  };
};

const getNodeId = memoize(
  (
    node:
      | ast.Text
      | ast.Element
      | ast.Component
      | ast.Variant
      | ast.Slot
      | ast.Insert,
    context: Context
  ) => node.id
);

const md5 = (value: string) => {
  return crypto.createHash("md5").update(value).digest("hex");
};
