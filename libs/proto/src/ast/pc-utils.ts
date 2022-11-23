import { memoize } from "@paperclip-ui/common";
import {
  Document,
  DocumentBodyItem,
  Element,
  Insert,
  Node,
  Slot,
  Style,
  TextNode,
} from "../generated/ast/pc";

const EMPTY_ARRAY = [];
export namespace ast {
  export type InnerNode = Element | Insert | Slot | TextNode;
  export type InnerExpression = InnerNode | Style;

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

  export const getInnerExpression = (item: DocumentBodyItem | Node) =>
    getNodeInner(item) || getDocumentBodyInner(item);
  export const getChildren = (expr: InnerExpression) =>
    ((expr as Document | InnerNode).body as Array<DocumentBodyItem | Node>) ||
    EMPTY_ARRAY;

  export const getAncestors = memoize((id: string, document: Document) => {
    const exprsById = flattenDocument(document);
    const childParentMap = getChildParentMap(exprsById);
    const ancestors: InnerExpression[] = [];

    let curr = exprsById[id];

    while (curr) {
      const nextId = childParentMap[curr.id];
      const next = exprsById[nextId];
      if (next) {
        ancestors.push(next);
      }
      curr = next;
    }

    return ancestors;
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

  export const getExprById = (id: string, document: Document) =>
    flattenDocument(document)[id];

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
