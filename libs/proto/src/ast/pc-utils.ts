import { memoize } from "@paperclip-ui/common";
import { Graph } from "../generated/ast/graph";
import {
  Component,
  ComponentBodyItem,
  Document,
  DocumentBodyItem,
  Element,
  Import,
  Insert,
  Node,
  Render,
  Slot,
  Style,
  TextNode,
} from "../generated/ast/pc";

const EMPTY_ARRAY = [];
export namespace ast {
  export type InnerNode = Element | Insert | Slot | TextNode;
  export type InnerExpression = Document | InnerNode | Style;

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
  export const getChildren = (expr: InnerExpression) =>
    ((expr as Document | InnerNode).body as Array<DocumentBodyItem | Node>) ||
    EMPTY_ARRAY;

  export const getAncestorIds = memoize((id: string, graph: Graph) => {
    const ancestorIds: string[] = [];

    const dep = getOwnerDependency(id, graph);
    const exprsById = flattenDocument(dep.document);
    const childParentMap = getChildParentMap(exprsById);

    let curr = exprsById[id];

    while (curr) {
      const nextId = childParentMap[curr.id];
      const next = exprsById[nextId];

      if (next) {
        ancestorIds.push(next.id);
      }
      curr = next;
    }

    return ancestorIds;
  });

  export const getChildParentMap = memoize(
    (exprs: Record<string, InnerExpression>) => {
      const map: Record<string, string> = {};

      for (const id in exprs) {
        for (const child of getChildren(exprs[id])) {
          map[getInnerExpression(child).id] = id;
        }
      }
      return map;
    }
  );

  export const getComponentRenderNode = (component: Component) =>
    component.body.find((body) => body.render).render;

  export const isInstance = (element: Element, graph: Graph) => {
    return getInstanceComponent(element, graph) != null;
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

  export const getExprById = (id: string, graph: Graph) => {
    return flattenDocument(getOwnerDependency(id, graph).document)[id];
  };

  export const flattenUnknownInnerExpression = memoize(
    (expr: Document | Node): Record<string, InnerExpression> =>
      Object.assign(flattenDocument(expr as Document), flattenElement(expr))
  );

  export const flattenDocument = memoize((expr: Document) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      ...expr.body.map(flattenDocumentBodyItem)
    );
  });

  export const flattenDocumentBodyItem = (expr: DocumentBodyItem) => {
    if (expr.element) {
      return flattenElement(expr.element);
    }
    if (expr.text) {
      return flattenTextNode(expr.text);
    }
    if (expr.component) {
      return flattenComponent(expr.component);
    }
    return {};
  };

  export const flattenElement = memoize((expr: Element) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      ...expr.body.map(flattenNode)
    );
  });

  export const flattenComponent = memoize((expr: Component) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      ...expr.body.map(flattenComponentBodyItem)
    );
  });

  export const flattenComponentBodyItem = memoize((expr: ComponentBodyItem) => {
    if (expr.render) {
      return flattenRender(expr.render);
    }
    return {};
  });

  export const flattenRender = memoize((expr: Render) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      flattenNode(expr.node)
    );
  });

  export const flattenTextNode = memoize((expr: TextNode) => {
    return {
      [expr.id]: expr,
    };
  });

  export const flattenSlot = memoize((expr: Slot) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      ...expr.body.map(flattenNode)
    );
  });

  export const flattenInsert = memoize((expr: Insert) => {
    return Object.assign(
      {
        [expr.id]: expr,
      },
      ...expr.body.map(flattenNode)
    );
  });

  export const flattenNode = (expr: Node) => {
    if (expr.element) {
      return flattenElement(expr.element);
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
}
