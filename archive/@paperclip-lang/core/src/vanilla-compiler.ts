import {
  memoize,
  generateUID,
  getTreeNodesByName,
  KeyValue,
  getParentTreeNode,
  EMPTY_OBJECT,
  stripProtocol,
  FILE_PROTOCOL,
  addProtocol,
} from "tandem-common";
import {
  PCNode,
  getOverrideMap,
  PCOverridablePropertyName,
  PCTextNode,
  PCBaseElementChild,
  isVisibleNode,
  PCComputedOverrideVariantMap,
  PCComponentInstanceElement,
  PCBaseElement,
  PCComponent,
  PCQuery,
  PCQueryType,
  PCVisibleNode,
  PCSourceTagNames,
  extendsComponent,
  computePCNodeStyle,
  PCModule,
  PCVariant,
  computeStyleWithVars,
  PCOverride,
  variableQueryPassed,
  PCVariable,
  PCStyleMixin,
  PCVariantTrigger,
  PCVariantTriggerSourceType,
  PCVariantTriggerQuerySource,
  PCMediaQuery,
  PCVariableQuery,
} from "./dsl";
import * as path from "path";
import { uniq } from "lodash";
import { SyntheticElement } from "./synthetic";
import { DependencyGraph } from "./graph";

export type VanillaPCRenderers = KeyValue<VanillaPCRenderer>;

export type WindowInfo = {
  width: number;
  height: number;
};

export type VanillaPCRenderer = (
  instanceSourceNodeId: string,
  instancePath: string,
  attributes: any,
  style: any,
  variant: any,
  overrides: any,
  windowInfo: WindowInfo,
  components: VanillaPCRenderers,
  isRoot?: boolean
) => SyntheticElement;

// Note: we're not using immutability here because this thing needs to be _fast_

const merge = (a, b) => {
  if (b == null) return a;
  if (!a || typeof b !== "object" || Array.isArray(b)) return b;
  const clone = { ...a };
  for (const k in b) {
    clone[k] = merge(a[k], b[k]);
  }
  return clone;
};

export const compileContentNodeAsVanilla = memoize(
  (
    node: PCComponent | PCVisibleNode,
    refMap: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>,
    queryMap: KeyValue<PCQuery>,
    sourceUri: string,
    rootDirectory: string
  ) => {
    return new Function(
      `generateUID`,
      `merge`,
      `return ` +
        translateContentNode(
          node,
          refMap,
          varMap,
          queryMap,
          sourceUri,
          rootDirectory
        )
    )(generateUID, merge);
  }
);

export const translateModuleToVanilla = memoize(
  (
    module: PCModule,
    componentRefMap: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>,
    queryMap: KeyValue<PCQuery>,
    sourceUri: string,
    rootDirectory: string
  ) => {
    const content = module.children
      .filter(
        (child) =>
          child.name !== PCSourceTagNames.VARIABLE &&
          child.name !== PCSourceTagNames.QUERY
      )
      .map(
        (child: PCComponent | PCVisibleNode | PCStyleMixin) =>
          `exports._${child.id} = ${translateContentNode(
            child,
            componentRefMap,
            varMap,
            queryMap,
            sourceUri,
            rootDirectory
          )}`
      )
      .join("\n");

    return content;
  }
);

const translateContentNode = memoize(
  (
    node: PCComponent | PCVisibleNode | PCStyleMixin,
    componentRefMap: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>,
    queryMap: KeyValue<PCQuery>,
    sourceUri: string,
    rootDirectory: string
  ) => {
    let buffer = `(function() {`;

    buffer += `var EMPTY_ARRAY = [];\n`;
    buffer += `var EMPTY_OBJECT = {};\n`;
    buffer += translateStaticNodeProps(
      node,
      componentRefMap,
      varMap,
      sourceUri,
      rootDirectory
    );
    buffer += translateStaticOverrides(
      node as PCComponent,
      varMap,
      sourceUri,
      rootDirectory
    );
    buffer += translateStaticVariants(node, varMap, sourceUri, rootDirectory);

    buffer += `return function(instanceSourceNodeId, instancePath, attributes, style, variant, overrides, windowInfo, components, isRoot) {
      ${translateVariants(node, queryMap, varMap)}
      var childInstancePath = instancePath == null ? "" : (instancePath ? instancePath + "." : "") + instanceSourceNodeId;

      // tiny optimization
      if (style.display === "none" && !isRoot) {
        return null;
      }
      return ${translateVisibleNode(node, true)};
    }`;

    return buffer + `})()`;
  }
);

const isBaseElement = (node: PCNode): node is PCBaseElement<any> =>
  node.name === PCSourceTagNames.ELEMENT ||
  node.name === PCSourceTagNames.COMPONENT ||
  node.name === PCSourceTagNames.COMPONENT_INSTANCE;

const translateVisibleNode = memoize(
  (
    node: PCComponent | PCStyleMixin | PCVisibleNode,
    isContentNode?: boolean
  ) => {
    if (isBaseElement(node)) {
      if (extendsComponent(node)) {
        return `components._${node.is}(${
          isContentNode ? "instanceSourceNodeId" : `"${node.id}"`
        }, ${
          isContentNode ? 'instancePath || ""' : "childInstancePath"
        }, ${translateDynamicAttributes(
          node,
          isContentNode
        )}, ${translateDynamicStyle(
          node,
          isContentNode
        )}, ${translateDynamicVariant(node)}, ${translateDynamicOverrides(
          node as PCComponent
        )}, windowInfo, components, ${isContentNode ? "isRoot" : "false"})`;
      }

      return `{
      id: generateUID(),
      sourceNodeId: ${isContentNode ? "instanceSourceNodeId" : `"${node.id}"`},
      instancePath: ${
        isContentNode ? 'instancePath || ""' : `childInstancePath`
      },
      name: "${node.is}",
      style: ${translateDynamicStyle(node, isContentNode)},
      metadata: EMPTY_OBJECT,
      attributes: ${translateDynamicAttributes(node, isContentNode)},
      children: [${node.children
        .map(translateElementChild)
        .filter(Boolean)
        .join(",")}].filter(Boolean)
    }`;
    } else if (node.name === PCSourceTagNames.TEXT) {
      return `{
      id: generateUID(),
      sourceNodeId: "${node.id}",
      style: ${translateDynamicStyle(node, isContentNode)},
      instancePath: childInstancePath,
      metadata: EMPTY_OBJECT,
      name: "text",
      value: overrides._${node.id}Value || ${JSON.stringify(node.value)},
      children: EMPTY_ARRAY
    }`;
    } else if (node.name === PCSourceTagNames.STYLE_MIXIN) {
      // note that element style mixins have children here since they _may_ be used to style "parts"
      // in the future.
      if (node.targetType === PCSourceTagNames.ELEMENT) {
        return `{
          id: generateUID(),
          sourceNodeId: "${node.id}",
          style: ${translateDynamicStyle(node, isContentNode)},
          instancePath: childInstancePath,
          metadata: EMPTY_OBJECT,
          name: "element",
          attributes: EMPTY_OBJECT,
          children: [${node.children
            .map(translateElementChild)
            .filter(Boolean)
            .join(",")}].filter(Boolean)
        }`;
      } else if (node.targetType === PCSourceTagNames.TEXT) {
        return `{
          id: generateUID(),
          sourceNodeId: "${node.id}",
          style: ${translateDynamicStyle(node, isContentNode)},
          instancePath: childInstancePath,
          metadata: EMPTY_OBJECT,
          name: "text",
          value: ${JSON.stringify(node.value)},
          children: EMPTY_ARRAY
        }`;
      }
    }
  }
);
const translateVariants = (
  contentNode: PCVisibleNode | PCComponent | PCStyleMixin,
  queryMap: KeyValue<PCQuery>,
  varMap: KeyValue<PCVariable>
) => {
  const variants = (
    getTreeNodesByName(PCSourceTagNames.VARIANT, contentNode) as PCVariant[]
  )
    .concat()
    .reverse();

  const mediaTriggers = (
    getTreeNodesByName(
      PCSourceTagNames.VARIANT_TRIGGER,
      contentNode
    ) as PCVariantTrigger[]
  ).filter(
    (trigger) =>
      trigger.source && trigger.source.type === PCVariantTriggerSourceType.QUERY
  );

  let buffer = ``;

  for (const variant of variants) {
    const variantTriggers = mediaTriggers.filter(
      (trigger) => trigger.targetVariantId === variant.id
    );
    const queries = variantTriggers
      .map((trigger) => {
        const query =
          queryMap[(trigger.source as PCVariantTriggerQuerySource).queryId];
        return query;
      })
      .filter(Boolean);

    const mediaQueries = queries.filter(
      (query) => query.type === PCQueryType.MEDIA && query.condition
    ) as PCMediaQuery[];

    const variableQueries = queries.filter(
      (query) => query.type === PCQueryType.VARIABLE
    ) as PCVariableQuery[];

    const useVariant = variableQueriesPassed(variableQueries, varMap);

    if (useVariant) {
      buffer += `if (instancePath != null || variant["${variant.id}"]) {`;
    } else {
      buffer += `if (variant["${variant.id}"] ${
        mediaQueries.length
          ? "|| (instancePath != null && " +
            translateMediaCondition(mediaQueries) +
            ")"
          : ""
      }) {`;
    }
    buffer += `overrides = merge(_${contentNode.id}Variants._${variant.id}, overrides); `;

    buffer += `}\n`;
  }

  return buffer;
};

const translateMediaCondition = (queries: PCMediaQuery[]) => {
  const conditions: string[] = [];

  for (const media of queries) {
    let buffer = [];
    if (media.condition) {
      if (media.condition.minWidth) {
        buffer.push(`windowInfo.width >= ${Number(media.condition.minWidth)}`);
      }

      if (media.condition.maxWidth) {
        buffer.push(`windowInfo.width <= ${Number(media.condition.maxWidth)}`);
      }
    }

    if (!buffer.length) {
      buffer.push("true");
    }

    conditions.push(`(${buffer.join(" && ")})`);
  }

  return "(" + conditions.join(" || ") + ")";
};

const variableQueriesPassed = (
  queries: PCVariableQuery[],
  varMap: KeyValue<PCVariable>
) => {
  return queries.some((query) => {
    return variableQueryPassed(query, varMap);
  });
};

const translateElementChild = memoize((node: PCBaseElementChild) => {
  if (node.name === PCSourceTagNames.SLOT) {
    return `...(overrides._${node.id}Children || [${node.children
      .map(translateElementChild)
      .filter(Boolean)
      .join(",")}])`;
  } else if (isVisibleNode(node)) {
    return translateVisibleNode(node);
  } else {
    // console.warn(`Cannot compile ${node.name}`);
  }
});

const translateDynamicAttributes = (
  node: PCBaseElement<any>,
  isContentNode: boolean
) => {
  if (isContentNode) {
    return `overrides._${node.id}Attributes ? Object.assign({}, _${node.id}Attributes, overrides._${node.id}Attributes, attributes) : Object.assign({}, _${node.id}Attributes, attributes)`;
  }

  return `overrides._${node.id}Attributes ? Object.assign({}, _${node.id}Attributes, overrides._${node.id}Attributes) : _${node.id}Attributes`;
};

const translateDynamicStyle = (
  node: PCBaseElement<any> | PCTextNode | PCStyleMixin,
  isContentNode: boolean
) => {
  if (isContentNode) {
    return `overrides._${node.id}Style ? Object.assign({}, _${node.id}Style, overrides._${node.id}Style, style) : Object.assign({}, _${node.id}Style, style)`;
  }

  return `overrides._${node.id}Style ? Object.assign({},  _${node.id}Style, overrides._${node.id}Style) : _${node.id}Style`;
};

const translateDynamicVariant = (node: PCBaseElement<any>) => {
  return `overrides._${node.id}Variant ? Object.assign({},  _${node.id}Variant, overrides._${node.id}Variant) : _${node.id}Variant`;
};

const translateDynamicOverrides = (
  node: PCComponent | PCComponentInstanceElement
) => {
  let buffer = `merge(_${node.id}Overrides, merge(merge(overrides._${node.id}Overrides, overrides), {`;
  for (const child of node.children as PCNode[]) {
    if (child.name === PCSourceTagNames.PLUG && child.children.length) {
      buffer += `_${child.slotId}Children: [${child.children
        .map(translateElementChild)
        .filter(Boolean)
        .join(",")}].filter(Boolean),\n`;
    }
  }

  return buffer + `}))`;
};

const translateStaticOverrides = (
  contentNode: PCNode,
  varMap: KeyValue<PCVariable>,
  sourceUri: string,
  rootDirectory: string
) => {
  const instances = [
    ...getTreeNodesByName(PCSourceTagNames.COMPONENT_INSTANCE, contentNode),
    ...getTreeNodesByName(PCSourceTagNames.COMPONENT, contentNode),
  ];

  let buffer = ``;

  for (const instance of instances) {
    const overrideMap = getOverrideMap(instance, contentNode);
    buffer += `var _${instance.id}Overrides = { ${translateVariantOverrideMap(
      overrideMap.default,
      varMap,
      sourceUri,
      rootDirectory
    )}};\n`;
  }

  return buffer;
};

const translateStaticVariants = (
  contentNode: PCNode,
  varMap: KeyValue<PCVariable>,
  sourceUri: string,
  rootDirectory: string
) => {
  const variants = getTreeNodesByName(PCSourceTagNames.VARIANT, contentNode);
  const variantNodes: PCNode[] = uniq(
    (getTreeNodesByName(PCSourceTagNames.OVERRIDE, contentNode) as PCOverride[])
      .filter((override) => {
        return (
          override.propertyName === PCOverridablePropertyName.STYLE ||
          override.propertyName ===
            PCOverridablePropertyName.VARIANT_IS_DEFAULT ||
          override.propertyName === PCOverridablePropertyName.VARIANT
        );
      })
      .map((override) => {
        return getParentTreeNode(override.id, contentNode);
      })
  );

  let buffer = `_${contentNode.id}Variants = {`;

  for (const variant of variants) {
    buffer += `_${variant.id}: {`;

    // we want to start with the _last_ items first, then work our way to the front
    // so that we have proper order of operations
    for (let i = variantNodes.length; i--; ) {
      const node = variantNodes[i];
      const overrideMap = getOverrideMap(
        node,
        contentNode,
        node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
          node.name === PCSourceTagNames.COMPONENT
      );
      if (!overrideMap[variant.id]) {
        continue;
      }
      buffer += `${translateVariantOverrideMap(
        overrideMap[variant.id],
        varMap,
        sourceUri,
        rootDirectory
      )}`;
    }
    buffer += `},`;
  }

  return buffer + `};\n`;
};

const mapStyles = (style: any, sourceUri: string, rootDirectory: string) => {
  let newStyle;
  for (const key in style) {
    let value = style[key];
    let newValue = value;
    if (
      typeof value === "string" &&
      (key === "background" || key === "background-image") &&
      /url\(.*?\)/.test(value) &&
      !/:\/\//.test(value)
    ) {
      let uri = value.match(/url\(["']?(.*?)["']?\)/)[1];
      if (uri.charAt(0) === ".") {
        uri = `${path.dirname(sourceUri)}/${uri}`;
      } else {
        uri = `file://${stripProtocol(rootDirectory)}/${uri}`;
      }

      newValue = value.replace(/url\(["']?(.*?)["']?\)/, `url(${uri})`);
    }
    if (newValue !== value) {
      if (!newStyle) newStyle = { ...style };
      newStyle[key] = newValue;
    }
  }
  return newStyle || style;
};

const translateVariantOverrideMap = memoize(
  (
    map: PCComputedOverrideVariantMap,
    varMap: KeyValue<PCVariable>,
    sourceUri: string,
    rootDirectory: string
  ) => {
    let buffer = ``;
    for (const nodeId in map) {
      const { overrides, children: childMap } = map[nodeId];

      for (const override of overrides) {
        if (override.propertyName === PCOverridablePropertyName.STYLE) {
          buffer += `_${nodeId}Style: ${JSON.stringify(
            mapStyles(
              computeStyleWithVars(override.value, varMap),
              sourceUri,
              rootDirectory
            )
          )},`;
        }
        if (override.propertyName === PCOverridablePropertyName.ATTRIBUTES) {
          buffer += `_${nodeId}Attributes: ${JSON.stringify(override.value)},`;
        }
        if (override.propertyName === PCOverridablePropertyName.VARIANT) {
          buffer += `_${nodeId}Variant: ${JSON.stringify(override.value)},`;
        }
        if (override.propertyName === PCOverridablePropertyName.TEXT) {
          buffer += `_${nodeId}Value: ${JSON.stringify(override.value)},`;
        }
      }
      buffer += `_${nodeId}Overrides: {`;

      buffer += translateVariantOverrideMap(
        childMap,
        varMap,
        sourceUri,
        rootDirectory
      );

      buffer += `},`;
    }

    return buffer + ``;
  }
);

const translateStaticNodeProps = memoize(
  (
    node: PCNode,
    componentRefMap: KeyValue<PCComponent>,
    varMap: KeyValue<PCVariable>,
    sourceUri: string,
    rootDirectory: string
  ) => {
    let buffer = "";

    if (isBaseElement(node)) {
      buffer += `var _${node.id}Attributes = {\n`;
      for (const name in node.attributes) {
        let value = node.attributes[name];

        if (node.is === "img" && !/\w+:\/\//.test(value)) {
          value = addProtocol(
            FILE_PROTOCOL,
            path.resolve(path.dirname(stripProtocol(sourceUri)), value)
          );
        }

        buffer += `"${name}": ${JSON.stringify(value)},\n`;
      }
      buffer += `};\n`;
    }

    if (
      isBaseElement(node) ||
      node.name === PCSourceTagNames.TEXT ||
      node.name === PCSourceTagNames.STYLE_MIXIN
    ) {
      buffer += `var _${node.id}Style = ${JSON.stringify(
        mapStyles(
          computePCNodeStyle(node, componentRefMap, varMap),
          sourceUri,
          rootDirectory
        )
      )};`;
    }

    if (
      node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
      node.name === PCSourceTagNames.COMPONENT
    ) {
      buffer += `var _${node.id}Variant = ${JSON.stringify(
        (node as any).variant || EMPTY_OBJECT
      )};`;
    }

    for (const child of node.children) {
      buffer += translateStaticNodeProps(
        child as PCNode,
        componentRefMap,
        varMap,
        sourceUri,
        rootDirectory
      );
    }

    return buffer;
  }
);
