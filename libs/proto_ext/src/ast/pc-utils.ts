import { memoize } from "@paperclip-ui/common";
import {
  DeclarationValue,
  StyleDeclaration,
} from "@paperclip-ui/proto/lib/generated/ast/css";
import { Dependency, Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import {
  Atom,
  Component,
  ComponentBodyItem,
  Document,
  DocumentBodyItem,
  Element,
  Import,
  Insert,
  Node,
  Override,
  Reference,
  Render,
  Slot,
  Style,
  TextNode,
  Trigger,
  TriggerBodyItem,
  TriggerBodyItemCombo,
  Variant,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { Bool, Str } from "@paperclip-ui/proto/lib/generated/ast/base";
import { ComputedStyleMap, serializeDeclaration } from "./serialize";

const EMPTY_ARRAY = [];
export namespace ast {
  export type InnerNode = Element | Insert | Slot | TextNode;
  export type InnerExpression = Document | InnerNode | Style;

  export type OuterExpression = DocumentBodyItem | Node | DeclarationValue;

  export enum ExprKind {
    Atom,
    Component,
    DocComment,
    Reference,
    Element,
    Variant,
    Document,
    Render,
    Import,
    TextNode,
    Trigger,
    TriggerCombo,
    Slot,
    Insert,
    Override,
    Str,
    Bool,
    Style,
    Declaration,
    Arithmetic,
    FunctionCall,
  }

  export type BaseExprInfo<Expr, Kind extends ExprKind> = {
    expr: Expr;
    kind: Kind;
  };

  export type InnerExpressionInfo =
    | BaseExprInfo<Component, ExprKind.Component>
    | BaseExprInfo<Atom, ExprKind.Atom>
    | BaseExprInfo<Reference, ExprKind.Reference>
    | BaseExprInfo<Trigger, ExprKind.Trigger>
    | BaseExprInfo<Element, ExprKind.Element>
    | BaseExprInfo<Variant, ExprKind.Variant>
    | BaseExprInfo<Document, ExprKind.Document>
    | BaseExprInfo<Render, ExprKind.Render>
    | BaseExprInfo<any, ExprKind.DocComment>
    | BaseExprInfo<Override, ExprKind.Override>
    | BaseExprInfo<Import, ExprKind.Import>
    | BaseExprInfo<TextNode, ExprKind.TextNode>
    | BaseExprInfo<Trigger, ExprKind.Trigger>
    | BaseExprInfo<TriggerBodyItemCombo, ExprKind.TriggerCombo>
    | BaseExprInfo<Slot, ExprKind.Slot>
    | BaseExprInfo<Insert, ExprKind.Insert>
    | BaseExprInfo<Style, ExprKind.Style>
    | BaseExprInfo<Str, ExprKind.Str>
    | BaseExprInfo<Bool, ExprKind.Bool>
    | BaseExprInfo<StyleDeclaration, ExprKind.Declaration>;

  export const getDocumentBodyInner = (item: DocumentBodyItem) => {
    // oneof forces us to do this :(
    return (
      item.atom ||
      item.component ||
      item.docComment ||
      item.element ||
      item.import ||
      item.style ||
      item.text ||
      item.trigger
    );
  };

  export const getNodeInner = (item: Node) => {
    // oneof forces us to do this :(
    return (
      item.element ||
      item.insert ||
      item.override ||
      item.slot ||
      item.style ||
      item.text
    );
  };

  export const getDeclarationValueInner = (item: DeclarationValue) => {
    // oneof forces us to do this :(
    return (
      item.arithmetic ||
      item.commaList ||
      item.functionCall ||
      item.hexColor ||
      item.hexColor ||
      item.measurement ||
      item.number ||
      item.reference ||
      item.spacedList ||
      item.str
    );
  };

  export const getComponentBodyInner = (item: ComponentBodyItem) => {
    // oneof forces us to do this :(
    return item.render || item.script || item.variant;
  };

  export const getInnerExpression = (
    item: DocumentBodyItem | Node | ComponentBodyItem
  ) =>
    getNodeInner(item as DocumentBodyItem) ||
    getDocumentBodyInner(item as Node) ||
    getComponentBodyInner(item as ComponentBodyItem);

  export const getChildren = memoize(
    ({ expr, kind }: InnerExpressionInfo): InnerExpressionInfo[] => {
      switch (kind) {
        case ExprKind.Component:
        case ExprKind.Slot:
        case ExprKind.Insert:
        case ExprKind.Trigger:
        case ExprKind.TextNode:
        case ExprKind.Document:
        case ExprKind.Element:
          return (expr.body || EMPTY_ARRAY).map(getChildExprInner);
        case ExprKind.Render:
          return [getChildExprInner(expr.node)];
        case ExprKind.Variant:
          return (expr.triggers || EMPTY_ARRAY).map((trigger) => ({
            expr: trigger,
            kind: ExprKind.TriggerCombo,
          }));
        case ExprKind.TriggerCombo: {
          return (expr.items || EMPTY_ARRAY).map(getChildExprInner);
        }
      }

      return EMPTY_ARRAY;
    }
  );

  export const getChildExprInner = (
    expr: DocumentBodyItem | Node | ComponentBodyItem | Slot
  ): InnerExpressionInfo => {
    if ((expr as DocumentBodyItem).atom) {
      return { expr: (expr as DocumentBodyItem).atom, kind: ExprKind.Atom };
    }
    if ((expr as DocumentBodyItem).component) {
      return {
        expr: (expr as DocumentBodyItem).component,
        kind: ExprKind.Component,
      };
    }
    if ((expr as DocumentBodyItem).element) {
      return {
        expr: (expr as DocumentBodyItem).element,
        kind: ExprKind.Element,
      };
    }
    if ((expr as DocumentBodyItem).docComment) {
      return {
        expr: (expr as DocumentBodyItem).docComment,
        kind: ExprKind.DocComment,
      };
    }
    if ((expr as DocumentBodyItem).import) {
      return { expr: (expr as DocumentBodyItem).import, kind: ExprKind.Import };
    }
    if ((expr as DocumentBodyItem).text) {
      return { expr: (expr as DocumentBodyItem).text, kind: ExprKind.TextNode };
    }
    if ((expr as DocumentBodyItem).trigger) {
      return {
        expr: (expr as DocumentBodyItem).trigger,
        kind: ExprKind.Trigger,
      };
    }
    if ((expr as ComponentBodyItem).render) {
      return {
        expr: (expr as ComponentBodyItem).render,
        kind: ExprKind.Render,
      };
    }
    if ((expr as ComponentBodyItem).variant) {
      return {
        expr: (expr as ComponentBodyItem).variant,
        kind: ExprKind.Variant,
      };
    }
    if ((expr as Node).insert) {
      return { expr: (expr as Node).insert, kind: ExprKind.Insert };
    }
    if ((expr as Node).override) {
      return { expr: (expr as Node).override, kind: ExprKind.Override };
    }
    if ((expr as Node).slot) {
      return { expr: (expr as Node).slot, kind: ExprKind.Slot };
    }
    if ((expr as Node).style) {
      return { expr: (expr as Node).style, kind: ExprKind.Style };
    }

    if ((expr as TriggerBodyItem).str) {
      return { expr: (expr as TriggerBodyItem).str, kind: ExprKind.Str };
    }
    if ((expr as TriggerBodyItem).bool) {
      return { expr: (expr as TriggerBodyItem).bool, kind: ExprKind.Bool };
    }
    if ((expr as TriggerBodyItemCombo).items) {
      return { expr: (expr as TriggerBodyItem).bool, kind: ExprKind.Bool };
    }

    throw new Error(`Unhandled type`);
  };

  export const getAncestorIds = memoize((id: string, graph: Graph) => {
    const ancestorIds: string[] = [];

    const dep = getOwnerDependency(id, graph);
    if (!dep) {
      console.error(`dependency missing!`);
      return ancestorIds;
    }
    const exprsById = flattenDocument(dep.document);
    const childParentMap = getChildParentMap(exprsById);

    let curr = exprsById[id].expr;

    while (curr) {
      const nextId = childParentMap[curr.id];
      const next = exprsById[nextId]?.expr;

      if (next) {
        ancestorIds.push(next.id);
      }
      curr = next;
    }

    return ancestorIds;
  });

  export const getParent = memoize((id: string, graph: Graph) => {
    return getParentExprInfo(id, graph)?.expr;
  });

  export const getParentExprInfo = memoize((id: string, graph: Graph) => {
    const dep = getOwnerDependency(id, graph);
    const exprsById = flattenDocument(dep.document);
    const childParentMap = getChildParentMap(exprsById);
    const parentId = childParentMap[id];
    return getExprInfoById(parentId, graph);
  });

  export const getAncestorVirtIdsFromShadow = memoize(
    (id: string, graph: Graph) => {
      const instanceIds = id.split(".");
      const ancestorIds = [];

      for (let i = instanceIds.length; i--; ) {
        const targetId = instanceIds[i];
        const targetAncestorIds = [...getAncestorIds(targetId, graph)];

        if (i !== instanceIds.length - 1) {
          targetAncestorIds.unshift(targetId);
        }

        for (const id of targetAncestorIds) {
          ancestorIds.push([...instanceIds.slice(0, i), id].join("."));
        }
      }

      return ancestorIds;
    }
  );

  export const getShadowExprId = (id: string) => id.split(".").pop();

  export const getChildParentMap = memoize(
    (exprs: Record<string, InnerExpressionInfo>) => {
      const map: Record<string, string> = {};

      for (const id in exprs) {
        for (const child of getChildren(exprs[id])) {
          map[child.expr.id] = id;
        }
      }
      return map;
    }
  );

  export const getExprRef = memoize(
    (ref: Reference, graph: Graph): DocumentBodyItem | null => {
      const dep = getOwnerDependency(ref.id, graph);
      if (ref.path.length === 1) {
        return getDocumentBodyExprByName(ref.path[0], dep.document);
      } else {
        // const imp = graph.dependencies[dep.imports[]];
        const imp = getDocumentImport(ref.path[0], dep.document);
        const impDep = imp && graph.dependencies[dep.imports[imp.path]];

        // Broken references will happen all the time
        if (impDep) {
          return getDocumentBodyExprByName(ref.path[1], impDep.document);
        }
      }
      return null;
    }
  );

  export const getDocumentBodyExprByName = (
    name: string,
    document: Document
  ) => {
    return document.body.find(
      (expr) =>
        expr.style?.name === name ||
        expr.atom?.name === name ||
        expr.component?.name === name
    );
  };

  export const getComponentSlots = (
    component: Component,
    graph: Graph
  ): Slot[] => {
    const render = getComponentRenderExpr(component);

    return render
      ? (Object.values(flattenNode(render.node))
          .filter((descendent) => {
            return descendent.kind === ExprKind.Slot;
          })
          .map((info) => info.expr) as Slot[])
      : [];
  };

  export const getComponentPropNames = memoize((component: Component) => {
    const propNames: string[] = [];
    const descendents = Object.values(flattenComponent(component));
    for (const descendent of descendents) {
      if (descendent.kind === ExprKind.Element) {
        for (const param of descendent.expr.parameters) {
          if (param.value.reference) {
            propNames.push(param.value.reference.path[0]);
          }
        }
      }
    }

    return propNames;
  });

  export const getComponentInstances = memoize(
    (componentId: string, graph: Graph) => {
      const instances: Element[] = [];
      for (const path in graph.dependencies) {
        instances.push(
          ...(Object.values(flattenDocument(graph.dependencies[path].document))
            .filter(
              (info) =>
                info.kind === ExprKind.Element &&
                getInstanceComponent(info.expr, graph)?.id === componentId
            )
            .map((info) => info.expr) as Element[])
        );
      }

      return instances;
    }
  );

  export const getComponentVariants = memoize((component: Component) => {
    return component.body
      .filter((expr) => expr.variant)
      .map(getInnerExpression) as Variant[];
  });

  export const computeElementStyle = memoize(
    (exprId: string, graph: Graph, variantIds?: string[]): ComputedStyleMap => {
      const node = getExprById(exprId.split(".").pop(), graph) as Element;
      let computedStyle: ComputedStyleMap = { propertyNames: [], map: {} };
      if (!node || !node.body) {
        return computedStyle;
      }

      for (const item of node.body) {
        const { style } = item;

        if (style) {
          computedStyle = overrideComputedStyles(
            computedStyle,
            computeStyle(style, graph, node.id, variantIds)
          );
        }
      }

      return computedStyle;
    }
  );

  export const computeStyle = memoize(
    (
      style: Style,
      graph: Graph,
      ownerId: string,
      variantIds?: string[]
    ): ComputedStyleMap => {
      let computedStyles: ComputedStyleMap = { propertyNames: [], map: {} };

      if (style.variantCombo && style.variantCombo.length > 0) {
        // TODO: do ehthis
        // if (!style.variantCombo.every(ref => getRef))
        return computedStyles;
      }

      for (const value of style.declarations) {
        computedStyles.propertyNames.push(value.name);
        computedStyles.map[value.name] = {
          ownerId,
          value: value.value,
        };
      }

      if (style.extends) {
        for (const ref of style.extends) {
          const extendsStyle = getExprRef(ref, graph)?.style;
          if (extendsStyle) {
            computedStyles = overrideComputedStyles(
              computeStyle(extendsStyle, graph, extendsStyle.id, variantIds),
              computedStyles
            );
          }
        }
      }
      return computedStyles;
    }
  );

  const overrideComputedStyles = (
    computedStyles: ComputedStyleMap,
    overrides: ComputedStyleMap
  ): ComputedStyleMap => {
    const computed: ComputedStyleMap = { propertyNames: [], map: {} };

    for (const name of computedStyles.propertyNames) {
      computed.propertyNames.push(name);

      const override = overrides.map[name];

      if (override) {
        computed.map[name] = {
          value: override.value,
          ownerId: override.ownerId,
          prevValue: computedStyles.map[name],
        };
      } else {
        computed.map[name] = computedStyles.map[name];
      }
    }

    for (const name of overrides.propertyNames) {
      if (!computedStyles.propertyNames.includes(name)) {
        computed.propertyNames.push(name);
        computed.map[name] = overrides.map[name];
      }
    }

    return computed;
  };

  export type GraphAtomInfo = {
    dependency: Dependency;
    atom: Atom;
    value: string;
    cssValue: string;
  };

  export const getGraphAtoms = memoize((graph: Graph): GraphAtomInfo[] => {
    const atoms: GraphAtomInfo[] = [];
    for (const path in graph.dependencies) {
      const dependency = graph.dependencies[path];
      for (const expr of dependency.document.body) {
        if (expr.atom) {
          atoms.push({
            dependency,
            atom: expr.atom,
            value: serializeDeclaration(expr.atom.value),
            cssValue: getAtomValue(expr.atom, graph),
          });
        }
      }
    }
    return atoms;
  });

  export type GraphStyleMixinInfo = {
    dependency: Dependency;
    style: Style;
  };

  export const getGraphStyleMixins = memoize(
    (graph: Graph): GraphStyleMixinInfo[] => {
      const styles: GraphStyleMixinInfo[] = [];
      for (const path in graph.dependencies) {
        const dependency = graph.dependencies[path];
        for (const expr of dependency.document.body) {
          if (expr.style) {
            styles.push({
              dependency,
              style: expr.style,
            });
          }
        }
      }
      return styles;
    }
  );

  const getAtomValue = (atom: Atom, graph: Graph) => {
    const dep = getOwnerDependency(atom.id, graph);
    if (atom.value.functionCall) {
      if (atom.value.functionCall.arguments.reference) {
        const ref = getExprRef(
          atom.value.functionCall.arguments.reference,
          graph
        )?.atom;
        if (ref) {
          return getAtomValue(ref, graph);
        }
      }
    }
    return serializeDeclaration(atom.value);
  };

  export const getComponentRenderExpr = (component: Component) =>
    component.body.find((body) => body.render)?.render;

  export const getComponentRenderNode = (
    component: Component
  ): InnerExpressionInfo | undefined => {
    const render = getComponentRenderExpr(component);
    return render && getChildExprInner(render.node);
  };

  export const isInstance = (element: Element, graph: Graph) => {
    return getInstanceComponent(element, graph) != null;
  };

  export const isVariant = (
    expr: InnerExpression,
    graph: Graph
  ): expr is Variant => {
    const parent = getParent(expr.id, graph);
    return (parent as Component).body?.some(
      (child) => child.variant?.id === expr.id
    );
  };

  export const isVariantEnabled = (variant: Variant) =>
    variant.triggers?.some((trigger) =>
      trigger.items.some((item) => item.bool?.value === true)
    );

  export const getExprOwnerComponent = (
    expr: InnerExpression,
    graph: Graph
  ) => {
    const ancestorId = getAncestorIds(expr.id, graph).find((ancestorId) => {
      return getExprInfoById(ancestorId, graph).kind === ExprKind.Component;
    });

    return ancestorId && (getExprById(ancestorId, graph) as Component);
  };

  export const getInstanceComponent = (element: Element, graph: Graph) => {
    return getDocumentComponent(
      element.tagName,
      getInstanceDefinitionDependency(element, graph).document
    );
  };

  export const isInstanceVariantEnabled = memoize(
    (
      instanceId: string,
      variantId: string,
      selectedVariantIds: string[],
      graph: Graph
    ) => {
      const selectedVariants = selectedVariantIds.map(
        (id) => getExprById(id, graph) as Variant
      );
      const instance = getExprById(instanceId, graph) as Element;
      const primaryOverride = instance.body.find(
        (body) => body.override?.path.length === 0
      )?.override;
      if (!primaryOverride) {
        return false;
      }

      const variant = ast.getExprById(variantId, graph) as Variant;
      const variantOverride = primaryOverride.body.find(
        (body) => body.variant.name === variant.name
      )?.variant;

      return variantOverride?.triggers.some((combo) => {
        if (selectedVariants.length === 0) {
          return (
            combo.items.length === 1 && combo.items[0].bool?.value === true
          );
        }

        if (combo.items.length !== selectedVariants.length) {
          return false;
        }

        return selectedVariants.every((selectedVariant) => {
          for (const item of combo.items) {
            if (
              item.reference?.path.length === 1 ||
              ast.getExprRef(item.reference!, graph).trigger?.id ===
                selectedVariant.id
            ) {
              return true;
            }
          }
        });
      });
    }
  );

  export const getInstanceDefinitionDependency = (
    element: Element,
    graph: Graph
  ) => {
    const instanceDependency = getOwnerDependency(element.id, graph);
    const documentImport =
      element.namespace &&
      getDocumentImport(element.namespace, instanceDependency.document);
    if (documentImport) {
      return graph.dependencies[
        instanceDependency.imports[documentImport.path]
      ];
    } else {
      return instanceDependency;
    }
  };

  export const getDocumentComponents = memoize(
    (document: Document): Component[] =>
      document.body
        .filter((body) => body.component != null)
        .map(getDocumentBodyInner) as Component[]
  );
  export const getDocumentComponent = (
    name: string,
    document: Document
  ): Component =>
    getDocumentComponents(document).find(
      (component) => component.name === name
    );

  export const getDocumentImports = memoize(
    (document: Document): Import[] =>
      document.body
        .filter((body) => body.import != null)
        .map(getDocumentBodyInner) as Import[]
  );
  export const getDocumentImport = (
    namespace: string,
    document: Document
  ): Import =>
    getDocumentImports(document).find((imp) => imp.namespace === namespace);

  export const getOwnerDependencyPath = memoize(
    (exprId: string, graph: Graph) => {
      for (const path in graph.dependencies) {
        const dep = graph.dependencies[path];

        if (flattenDocument(dep.document)[exprId] != null) {
          return path;
        }
      }
      return null;
    }
  );

  export const getOwnerDependency = (exprId: string, graph: Graph) => {
    return graph.dependencies[getOwnerDependencyPath(exprId, graph)];
  };

  export const getExprByVirtId = (id: string, graph: Graph) =>
    getExprInfoById(id.split(".").pop(), graph);
  export const getExprStyles = (
    parent: Element | TextNode | Document
  ): Style[] =>
    (parent as Element).body
      .filter((expr) => expr.style)
      .map(getInnerExpression);

  export const getInstanceSlots = (instance: Element, graph: Graph) => {
    // const component = getInstanceComponent(instance, graph);
    // const render = getComponentRenderExpr(component);
    // const renderNode = render && getChildExprInner(render.node);
    // return renderNode && getExprSlots(renderNode, graph);
  };

  export const getExprById = (id: string, graph: Graph) => {
    return getExprInfoById(id, graph)?.expr;
  };

  export const getExprInfoById = (id: string, graph: Graph) => {
    const dep = getOwnerDependency(id, graph);
    return dep && flattenDocument(dep.document)[id];
  };

  export const flattenExpressionInfo = memoize(
    ({
      expr,
      kind,
    }: InnerExpressionInfo): Record<string, InnerExpressionInfo> => {
      switch (kind) {
        case ExprKind.Atom:
          return flattenAtom(expr);
        case ExprKind.Component:
          return flattenComponent(expr);
        case ExprKind.Declaration:
          return flattenDeclaration(expr);
        case ExprKind.Document:
          return flattenDocument(expr);
        case ExprKind.Element:
          return flattenElement(expr);
        case ExprKind.Insert:
          return flattenInsert(expr);
        case ExprKind.Reference:
          return flattenReference(expr);
        case ExprKind.Render:
          return flattenRender(expr);
        case ExprKind.Slot:
          return flattenSlot(expr);
        case ExprKind.Style:
          return flattenStyle(expr);
        case ExprKind.TextNode:
          return flattenTextNode(expr);
        case ExprKind.Variant:
          return flattenVariant(expr);
      }

      return {};
    }
  );

  export const flattenDocument = memoize(
    (expr: Document): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Document },
        },
        ...expr.body.map(flattenDocumentBodyItem)
      );
    }
  );

  export const flattenDocumentBodyItem = (
    expr: DocumentBodyItem
  ): Record<string, InnerExpressionInfo> => {
    if (expr.element) {
      return flattenElement(expr.element);
    }
    if (expr.text) {
      return flattenTextNode(expr.text);
    }
    if (expr.component) {
      return flattenComponent(expr.component);
    }
    if (expr.atom) {
      return flattenAtom(expr.atom);
    }
    if (expr.style) {
      return flattenStyle(expr.style);
    }
    if (expr.trigger) {
      return flattenTrigger(expr.trigger);
    }
    return {};
  };

  export const flattenElement = memoize(
    (expr: Element): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Element },
        },
        ...expr.body.map(flattenNode)
      );
    }
  );

  export const flattenComponent = memoize(
    (expr: Component): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Component },
        },
        ...expr.body.map(flattenComponentBodyItem)
      );
    }
  );

  export const flattenAtom = memoize(
    (expr: Atom): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Atom },
        },
        flattenDeclarationValue(expr.value)
      );
    }
  );

  export const flattenComponentBodyItem = memoize(
    (expr: ComponentBodyItem): Record<string, InnerExpressionInfo> => {
      if (expr.render) {
        return flattenRender(expr.render);
      }
      if (expr.variant) {
        return flattenVariant(expr.variant);
      }
      return {};
    }
  );

  export const flattenRender = memoize(
    (expr: Render): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Render },
        },
        flattenNode(expr.node)
      );
    }
  );

  export const flattenVariant = memoize(
    (expr: Variant): Record<string, InnerExpressionInfo> => {
      return Object.assign({
        [expr.id]: { expr, kind: ExprKind.Variant },
      });
    }
  );

  export const flattenTextNode = memoize(
    (expr: TextNode): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.TextNode },
        },
        ...expr.body.map(flattenNode)
      );
    }
  );

  export const flattenSlot = memoize(
    (expr: Slot): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Slot },
        },
        ...expr.body.map(flattenNode)
      );
    }
  );

  export const flattenInsert = memoize(
    (expr: Insert): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Insert },
        },
        ...expr.body.map(flattenNode)
      );
    }
  );

  export const flattenStyle = memoize(
    (expr: Style): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Style },
        },
        ...expr.declarations.map(flattenDeclaration),
        ...(expr.extends || []).map(flattenReference)
      );
    }
  );

  export const flattenTrigger = memoize(
    (expr: Trigger): Record<string, InnerExpressionInfo> => {
      return Object.assign({
        [expr.id]: { expr, kind: ExprKind.Trigger },
      });
    }
  );

  export const flattenDeclaration = memoize(
    (expr: StyleDeclaration): Record<string, InnerExpressionInfo> => {
      return Object.assign(
        {
          [expr.id]: { expr, kind: ExprKind.Declaration },
        },
        flattenDeclarationValue(expr.value!)
      );
    }
  );

  export const flattenDeclarationValue = memoize(
    (expr: DeclarationValue): Record<string, InnerExpressionInfo> => {
      if (expr.arithmetic) {
        return Object.assign(
          {
            [expr.arithmetic.id]: {
              expr: expr.arithmetic,
              kind: ExprKind.Arithmetic,
            },
          },
          flattenDeclarationValue(expr.arithmetic.left),
          flattenDeclarationValue(expr.arithmetic.right)
        );
      }
      if (expr.functionCall) {
        return Object.assign(
          {
            [expr.functionCall.id]: {
              expr: expr.arithmetic,
              kind: ExprKind.FunctionCall,
            },
          },
          flattenDeclarationValue(expr.functionCall.arguments)
        );
      }
      if (expr.reference) {
        return flattenReference(expr.reference);
      }

      return {};
    }
  );
  export const flattenReference = memoize(
    (expr: Reference): Record<string, InnerExpressionInfo> => ({
      [expr.id]: { expr, kind: ExprKind.Reference },
    })
  );

  export const flattenNode = (
    expr: Node
  ): Record<string, InnerExpressionInfo> => {
    if (expr.element) {
      return flattenElement(expr.element);
    }
    if (expr.style) {
      return flattenStyle(expr.style);
    }

    if (expr.text) {
      return flattenTextNode(expr.text);
    }

    if (expr.slot) {
      return flattenSlot(expr.slot);
    }

    if (expr.insert) {
      return flattenInsert(expr.insert);
    }

    return {};
  };

  export const isDeclarationValue = (
    expr: OuterExpression
  ): expr is DeclarationValue => {
    return getDeclarationValueInner(expr as DeclarationValue) != null;
  };

  export const isExpressionId = (exprId: string) =>
    Boolean(exprId && !exprId.includes("."));

  export const isExpressionInComponent = (exprId: string, graph: Graph) => {
    return getAncestorIds(exprId, graph).some((ancestorId) => {
      return getExprInfoById(ancestorId, graph).kind === ExprKind.Component;
    });
  };
}
