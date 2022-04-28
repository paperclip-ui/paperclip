import { memoize } from "../utils/memoization";
const crc32 = require("crc32");
import { arraySplice } from "../utils/array";
import { createUIDGenerator } from "../utils/uid";
import { generateUID } from "../utils/uid";
import { EMPTY_ARRAY } from "../utils/object";

export enum TreeMoveOffset {
  PREPEND = 0,
  APPEND = Number.MAX_SAFE_INTEGER,
  BEFORE = -1,
  AFTER = 1
}

export type NamespacedAttributes = {
  name: string;
  value: any;
};

export type TreeNodeUpdater<TTree extends TreeNode<any>> = (
  node: TTree,
  index?: number,
  path?: number[]
) => TTree;

export type TreeNode<TName extends string> = {
  id: string;
  children: TreeNode<any>[];
  name: TName;
};

export type NodeFilter<TTree extends TreeNode<any>> = (node: TTree) => boolean;

export const findNestedNode = memoize(
  <TTree extends TreeNode<any>>(current: TTree, filter: NodeFilter<TTree>) => {
    if (filter(current)) {
      return current;
    }
    const { children } = current;
    for (let i = 0, { length } = children; i < length; i++) {
      const foundChild = findNestedNode(children[i], filter);
      if (foundChild) {
        return foundChild;
      }
    }
  }
);

export const createTreeNode = (
  name: string,
  children: TreeNode<any>[] = []
): TreeNode<any> => ({
  id: generateUID(),
  name,
  children
});

export const createNodeNameMatcher = memoize((name: string) => node =>
  node.name === name
);

export const filterNestedNodes = memoize(
  <TTree extends TreeNode<any>>(
    current: TTree,
    filter: NodeFilter<TTree>,
    found: TTree[] = []
  ) => {
    if (filter(current)) {
      found.push(current);
    }
    const { children } = current;
    for (let i = 0, { length } = children; i < length; i++) {
      filterNestedNodes(current.children[i], filter, found);
    }
    return found;
  }
);

export const getChildParentMap = memoize(
  (
    current: TreeNode<any>
  ): {
    [identifier: string]: TreeNode<any>;
  } => {
    const idMap = getTreeNodeIdMap(current);
    const parentChildMap: any = {};

    for (const id in idMap) {
      const parent = idMap[id];
      for (const child of parent.children) {
        parentChildMap[child.id] = parent;
      }
    }
    return parentChildMap;
  }
);

export type TreeNodeNameMap = {
  [identifier: string]: TreeNode<any>[];
};

export const getNodeNameMap = memoize((node: TreeNode<any>) => {
  const map = { [node.name]: [node] };

  for (let i = 0, { length } = node.children; i < length; i++) {
    const childMap = getNodeNameMap(node.children[i]);
    for (const name in childMap) {
      map[name] = map[name] ? map[name].concat(childMap[name]) : childMap[name];
    }
  }

  return map;
});

export const getTreeNodesByName = (name: string, node: TreeNode<any>) => {
  return getNodeNameMap(node)[name] || EMPTY_ARRAY;
};

export type TreeNodeIdMap = {
  [identifier: string]: TreeNode<any>;
};

export const getTreeNodeIdMap = memoize(
  (current: TreeNode<any>): TreeNodeIdMap => {
    if (!current.id) {
      throw new Error(`ID missing from node`);
    }

    const map = {
      [current.id]: current
    };
    Object.assign(map, ...current.children.map(getTreeNodeIdMap));
    return map;
  }
);

export const flattenTreeNode = memoize(
  <TTree extends TreeNode<any>>(current: TTree): TTree[] => {
    const treeNodeMap = getTreeNodeIdMap(current);
    return Object.values(treeNodeMap) as TTree[];
  }
);

export const getTreeNodePath = memoize(
  (nodeId: string, root: TreeNode<any>) => {
    const childParentMap = getChildParentMap(root);
    const idMap = getTreeNodeIdMap(root);
    let current = idMap[nodeId];
    const path: number[] = [];
    while (1) {
      const parent = childParentMap[current.id];
      if (!parent) break;
      const i = parent.children.indexOf(current);
      if (i === -1) {
        throw new Error(`parent child mismatch. Likely id collision`);
      }
      path.unshift(i);
      current = parent;
    }

    return path;
  }
);

export const findTreeNodeParent = (
  nodeId: string,
  root: TreeNode<any>,
  filter: (node: TreeNode<any>) => boolean
) => {
  const path = getTreeNodePath(nodeId, root);
  if (!path.length) return null;
  for (let i = path.length; i--; ) {
    const parent = getTreeNodeFromPath(path.slice(0, i), root);
    if (filter(parent)) {
      return parent;
    }
  }
};

export const getTreeNodeAncestors = (nodeId: string, root: TreeNode<any>) => {
  return filterTreeNodeParents(nodeId, root, () => true);
};

export const filterTreeNodeParents = (
  nodeId: string,
  root: TreeNode<any>,
  filter: (node: TreeNode<any>) => boolean
) => {
  const parents: TreeNode<any>[] = [];
  const path = getTreeNodePath(nodeId, root);
  if (!path.length) return null;
  for (let i = path.length; i--; ) {
    const parent = getTreeNodeFromPath(path.slice(0, i), root);
    if (filter(parent)) {
      parents.push(parent);
    }
  }
  return parents;
};

export const findNodeByTagName = memoize(
  (root: TreeNode<any>, name: string, namespace?: string) => {
    return findNestedNode(
      root,
      child => child.name === name && child.namespace == namespace
    );
  }
);

export const getTreeNodeFromPath = memoize(
  <TNode extends TreeNode<any>>(path: number[], root: TNode) => {
    let current: TreeNode<any> = root;
    for (let i = 0, { length } = path; i < length; i++) {
      current = current.children[path[i]];
    }
    return current as TNode;
  }
);

export const getNestedTreeNodeById = <TNode extends TreeNode<any>>(
  id: string,
  root: TNode
): TNode => {
  return getTreeNodeIdMap(root)[id] as TNode;
};

export const containsNestedTreeNodeById = <TNode extends TreeNode<any>>(
  id: string,
  root: TNode
) => {
  return Boolean(getTreeNodeIdMap(root)[id]);
};

export const getTreeNodeHeight = <TNode extends TreeNode<any>>(
  id: string,
  root: TNode
) => getTreeNodePath(id, root).length;

export const generateTreeChecksum = memoize((root: TreeNode<any>) =>
  crc32(JSON.stringify(root))
);
export const getTreeNodeUidGenerator = memoize((root: TreeNode<any>) => {
  const rightMostTreeNode = getRightMostTreeNode(root);
  return createUIDGenerator(crc32(rightMostTreeNode.id));
});

export const getRightMostTreeNode = (current: TreeNode<any>) => {
  return current.children.length
    ? getRightMostTreeNode(current.children[current.children.length - 1])
    : current;
};

export const removeNestedTreeNode = (
  nestedChild: TreeNode<any>,
  current: TreeNode<any>
) =>
  removeNestedTreeNodeFromPath(
    getTreeNodePath(nestedChild.id, current),
    current
  );

export const removeNestedTreeNodeFromPath = (
  path: number[],
  current: TreeNode<any>
) => updateNestedNodeFromPath(path, current, child => null);

export const updateNestedNode = <
  TTree extends TreeNode<any>,
  TParent extends TreeNode<any>
>(
  nestedChild: TTree,
  current: TParent,
  updater: TreeNodeUpdater<TTree>
) =>
  updateNestedNodeFromPath(
    getTreeNodePath(nestedChild.id, current),
    current,
    updater
  ) as TParent;
export const replaceNestedNode = (
  newChild: TreeNode<any>,
  oldChildId: string,
  root: TreeNode<any>
) =>
  newChild
    ? updateNestedNodeFromPath(
        getTreeNodePath(oldChildId, root),
        root,
        () => newChild
      )
    : removeNestedTreeNode(getNestedTreeNodeById(oldChildId, root), root);

export const updateNestedNodeFromPath = (
  path: number[],
  current: TreeNode<any>,
  updater: TreeNodeUpdater<any>,
  depth: number = 0
) => {
  if (depth === path.length) {
    return updater(current);
  }

  const updatedChild = updateNestedNodeFromPath(
    path,
    current.children[path[depth]],
    updater,
    depth + 1
  );

  return {
    ...current,
    children: updatedChild
      ? arraySplice(current.children, path[depth], 1, updatedChild)
      : arraySplice(current.children, path[depth], 1)
  };
};

export const updateNestedNodeTrail = (
  path: number[],
  current: TreeNode<any>,
  updater: TreeNodeUpdater<any>,
  depth: number = 0
) => {
  if (depth !== path.length) {
    const updatedChild = updateNestedNodeTrail(
      path,
      current.children[path[depth]],
      updater,
      depth + 1
    );
    current = {
      ...current,
      children: updatedChild
        ? arraySplice(current.children, path[depth], 1, updatedChild)
        : arraySplice(current.children, path[depth], 1)
    };
  }
  return updater(current, depth, path);
};

export const appendChildNode = <TTree extends TreeNode<any>>(
  child: TreeNode<any>,
  parent: TTree
): TTree => insertChildNode(child, parent.children.length, parent);

export const insertChildNode = <TTree extends TreeNode<any>>(
  child: TreeNode<any>,
  index: number,
  parent: TTree
): TTree => ({
  ...(parent as any),
  children: arraySplice(parent.children, index, 0, child)
});
export const dropChildNode = <TTree extends TreeNode<any>>(
  child: TTree,
  offset: TreeMoveOffset,
  relative: TTree,
  root: TTree
): TTree => {
  if (offset === TreeMoveOffset.APPEND) {
    return updateNestedNode(relative, root, relative => {
      return appendChildNode(child, relative);
    });
  } else {
    const parent = getParentTreeNode(relative.id, root);
    const index =
      parent.children.findIndex(child => child.id === relative.id) +
      (offset === TreeMoveOffset.BEFORE ? 0 : 1);
    return updateNestedNode(parent, root, () =>
      insertChildNode(child, index, parent)
    );
  }
};

export const reduceTree = <TTree extends TreeNode<any>, TArg>(
  node: TTree,
  reducer: (value: TArg, node: TTree) => TArg,
  initial?: TArg
) => {
  let value = reducer(initial, node);
  for (let i = 0, { length } = node.children; i < length; i++) {
    value = reduceTree(node.children[i], reducer, value);
  }
  return value;
};

export const cloneTreeNode = <TTree extends TreeNode<any>>(
  node: TTree,
  generateID = node => generateUID()
) => ({
  ...(node as any),
  id: generateID(node),
  children: node.children.map(child => cloneTreeNode(child, generateID))
});

export const getParentTreeNode = <TTree extends TreeNode<any>>(
  nodeId: string,
  root: TTree
) => getChildParentMap(root)[nodeId] as any;

export const addTreeNodeIds = <TTree extends TreeNode<any>>(
  node: TTree,
  seed: string = ""
): TTree => {
  return node.id ? node : cloneTreeNode(node);
};
