// core tree utils

import { memoize } from "@paperclip-ui/common";
import * as virt from "../generated/virt/html";

export namespace virtHTML {
  export type InnerVirtNode = {
    id?: string;
    children?: OuterNode[];
  };

  export type OuterNode = {
    element?: virt.Element | undefined;
    textNode?: virt.TextNode | undefined;
  };

  export const getInnerNode = (node: OuterNode) => {
    let ret = node.element || node.textNode;
    if (!ret) {
      console.warn(node);
      throw new Error(
        `Inner node value doesn't exist - protobufs were probably updated.`
      );
    }
    return ret;
  };

  // eslint-disable-next-line
  export type BaseTreeNode = {} & InnerVirtNode;

  export type BaseParentNode = {
    children: OuterNode[];
  } & BaseTreeNode;

  export const isNodeParent = (node: BaseTreeNode): node is BaseParentNode =>
    (node as any).children != null;

  export const flattenTreeNode = memoize(
    <TNode extends BaseTreeNode>(current: TNode): TNode[] => {
      const treeNodeMap = getTreeNodeMap(current);
      return Object.values(treeNodeMap);
    }
  );

  export const getNodePath = memoize(
    <TNode extends BaseTreeNode>(node: TNode, root: TNode) => {
      const map = getTreeNodeMap(root);
      for (const path in map) {
        const c = map[path];
        if (c === node) return path;
      }
    }
  );

  export const getNodeByPath = memoize(
    <TNode extends BaseTreeNode>(nodePath: string, root: TNode) => {
      return getTreeNodeMap(root)[nodePath];
    }
  );
  export const getNodeById = memoize(
    <TNode extends BaseTreeNode>(id: string, root: TNode) => {
      const map = getTreeNodeMap(root);
      for (const path in map) {
        if (map[path].id === id) {
          return map[path];
        }
      }
    }
  );
  export const getNodeParent = memoize(
    <TNode extends BaseTreeNode>(node: TNode, root: TNode) => {
      const path = getNodePath(node, root).split(".");
      path.pop();
      return getNodeByPath(path.join("."), root);
    }
  );

  export const getNodeAncestors = memoize(
    <TNode extends BaseTreeNode>(nodePath: string, root: TNode) => {
      const pathAry = nodePathToAry(nodePath);
      const map = getTreeNodeMap(root);
      const ancestors = [];
      for (let i = pathAry.length; i--; ) {
        ancestors.push(getNodeByPath(pathAry.slice(0, i).join("."), root));
      }
      return ancestors;
    }
  );

  export const containsNode = <TNode extends BaseTreeNode>(
    node: TNode,
    root: TNode
  ) => getNodePath(node, root) != null;

  export const getTreeNodeMap = memoize(
    <TNode extends BaseTreeNode>(
      current: TNode,
      path = ""
    ): Record<string, TNode> => {
      const map: Record<string, TNode> = {
        [path]: current,
      };
      if (isNodeParent(current)) {
        Object.assign(
          map,
          ...current.children.map((child, i) =>
            getTreeNodeMap(
              getInnerNode(child),
              path ? path + "." + i : String(i)
            )
          )
        );
      }
      return map;
    }
  );

  export const nodePathToAry = memoize((path: string) =>
    path.split(".").map(Number)
  );

  export const getInstanceAncestor = (
    node: InnerVirtNode,
    root: InnerVirtNode
  ) => getNodeAncestors(getNodePath(node, root), root).find(isInstance);

  export const isInstance = (_node: InnerVirtNode) => false;
  export const isTextNode = (node: any): node is virt.TextNode =>
    (node as any).value != null;
}
