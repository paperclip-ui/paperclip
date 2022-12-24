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
  Reference,
  Render,
  Slot,
  Style,
  TextNode,
  Trigger,
  Variant,
} from "@paperclip-ui/proto/lib/generated/ast/pc";

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
    Slot,
    Insert,
    Style,
    Declaration,
  }

  export type BaseExprInfo<Expr, Kind extends ExprKind> = {
    expr: Expr;
    kind: Kind;
  };

  export type InnerExpressionInfo =
    | BaseExprInfo<Component, ExprKind.Component>
    | BaseExprInfo<Atom, ExprKind.Atom>
    | BaseExprInfo<Reference, ExprKind.Reference>
    | BaseExprInfo<Element, ExprKind.Element>
    | BaseExprInfo<Variant, ExprKind.Variant>
    | BaseExprInfo<Document, ExprKind.Document>
    | BaseExprInfo<Render, ExprKind.Render>
    | BaseExprInfo<Import, ExprKind.Import>
    | BaseExprInfo<TextNode, ExprKind.TextNode>
    | BaseExprInfo<Trigger, ExprKind.Trigger>
    | BaseExprInfo<Slot, ExprKind.Slot>
    | BaseExprInfo<Insert, ExprKind.Insert>
    | BaseExprInfo<Style, ExprKind.Style>
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

  export const getChildren = memoize((expr: InnerExpression) => {
    const body = (expr as Document | InnerNode | Component).body as Array<
      DocumentBodyItem | ComponentBodyItem | Node
    >;

    if (body) {
      return body;
    }

    if ((expr as Render).node) {
      return [(expr as Render).node];
    }

    return EMPTY_ARRAY;
  });

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
      const next = exprsById[nextId].expr;

      if (next) {
        ancestorIds.push(next.id);
      }
      curr = next;
    }

    return ancestorIds;
  });

  export const getParent = memoize((id: string, graph: Graph) => {
    const dep = getOwnerDependency(id, graph);
    const exprsById = flattenDocument(dep.document);
    const childParentMap = getChildParentMap(exprsById);
    const parentId = childParentMap[id];

    return parentId && getExprById(parentId, graph);
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
        for (const child of getChildren(exprs[id].expr)) {
          map[getInnerExpression(child).id] = id;
        }
      }
      return map;
    }
  );

  export const getExprRef = (
    ref: Reference,
    graph: Graph
  ): DocumentBodyItem | null => {
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
  };

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
    const render = getComponentRenderNode(component);

    return render
      ? (Object.values(flattenNode(render))
          .filter((descendent) => {
            return descendent.kind === ExprKind.Slot;
          })
          .map((info) => info.expr) as Slot[])
      : [];
  };

  export const getComponentVariants = memoize((component: Component) => {
    return component.body
      .filter((expr) => expr.variant)
      .map(getInnerExpression) as Variant[];
  });

  export const computeElementStyle = memoize(
    (
      exprId: string,
      graph: Graph,
      variantIds?: string[]
    ): Record<string, DeclarationValue> => {
      // TODO
      const node = getExprById(exprId.split(".").pop(), graph) as Element;
      const map: Record<string, DeclarationValue> = {};
      if (!node || !node.body) {
        return map;
      }
      for (const item of node.body) {
        const { style } = item;

        if (style) {
          Object.assign(map, computeStyle(style, graph, variantIds));
        }
      }

      return map;
    }
  );

  export const computeStyle = memoize(
    (
      style: Style,
      graph: Graph,
      variantIds?: string[]
    ): Record<string, DeclarationValue> => {
      let map: Record<string, DeclarationValue> = {};

      if (style.variantCombo && style.variantCombo.length > 0) {
        // TODO: do ehthis
        // if (!style.variantCombo.every(ref => getRef))
        return map;
      }

      for (const value of style.declarations) {
        map[value.name] = value.value;
      }

      if (style.extends) {
        for (const ref of style.extends) {
          const extendsStyle = getExprRef(ref, graph)?.style;
          if (extendsStyle) {
            map = Object.assign(
              {},
              computeStyle(extendsStyle, graph, variantIds),
              map
            );
          }
        }
      }
      return map;
    }
  );

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

  export const getComponentRenderNode = (component: Component): Node => {
    const render = getComponentRenderExpr(component);
    return render && render.node;
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
    variant.triggers?.some((trigger) => trigger.bool?.value);

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
        if (containsExpression(exprId, dep.document)) {
          return path;
        }
      }
      return null;
    }
  );

  export const getOwnerDependency = (exprId: string, graph: Graph) => {
    return graph.dependencies[getOwnerDependencyPath(exprId, graph)];
  };

  export const containsExpression = (
    exprId: string,
    ancestor: InnerExpression
  ) => {
    return flattenUnknownInnerExpression(ancestor)[exprId] != null;
  };

  export const getExprByVirtId = (id: string, graph: Graph) =>
    getExprById(id.split(".").pop(), graph);
  export const getExprStyles = (
    parent: Element | TextNode | Document
  ): Style[] =>
    (parent as Element).body
      .filter((expr) => expr.style)
      .map(getInnerExpression);

  export const getExprById = (id: string, graph: Graph) => {
    return getExprInfoById(id, graph)?.expr;
  };

  export const getExprInfoById = (id: string, graph: Graph) => {
    const dep = getOwnerDependency(id, graph);
    return dep && flattenDocument(dep.document)[id];
  };

  export const flattenUnknownInnerExpression = memoize(
    (expr: Document | Node): Record<string, InnerExpressionInfo> =>
      Object.assign(
        flattenDocument(expr as Document),
        flattenElement(expr as Element)
      )
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
          [expr.id]: { expr, kind: ExprKind.Element },
        },
        flattenNode(expr.node)
      );
    }
  );

  export const flattenVariant = memoize(
    (expr: Variant): Record<string, InnerExpressionInfo> => {
      return Object.assign({
        [expr.id]: { expr, kind: ExprKind.Element },
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
            [expr.arithmetic.id]: expr.arithmetic,
          },
          flattenDeclarationValue(expr.arithmetic.left),
          flattenDeclarationValue(expr.arithmetic.right)
        );
      }
      if (expr.functionCall) {
        return Object.assign(
          {
            [expr.functionCall.id]: expr.functionCall,
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
    return getAncestorIds(exprId, graph).some(
      (ancestorId) =>
        getExprInfoById(ancestorId, graph).kind === ExprKind.Component
    );
  };

  export const serializeDeclaration = (expr: DeclarationValue) => {
    if (expr.arithmetic) {
      return `${serializeDeclaration(expr.arithmetic.left)} ${
        expr.arithmetic.operator
      } ${serializeDeclaration(expr.arithmetic.right)}`;
    }
    if (expr.commaList) {
      return expr.commaList.items
        .map((expr) => serializeDeclaration(expr))
        .join(", ");
    }
    if (expr.functionCall) {
      return `${expr.functionCall.name}(${serializeDeclaration(
        expr.functionCall.arguments
      )})`;
    }
    if (expr.hexColor) {
      return `#${expr.hexColor.value}`;
    }
    if (expr.measurement) {
      return `${expr.measurement.value}${expr.measurement.unit}`;
    }
    if (expr.number) {
      return `${expr.number.value}`;
    }
    if (expr.reference) {
      return `${expr.reference.path.join(".")}`;
    }
    if (expr.spacedList) {
      return expr.spacedList.items
        .map((expr) => serializeDeclaration(expr))
        .join(" ");
    }
    if (expr.str) {
      return `"${expr.str.value}"`;
    }
  };

  export const serializeComputedStyle = (
    style: Record<string, DeclarationValue>
  ): Record<string, string> => {
    const comp = {};
    for (const key in style) {
      comp[key] = serializeDeclaration(style[key]);
    }
    return comp;
  };
}
