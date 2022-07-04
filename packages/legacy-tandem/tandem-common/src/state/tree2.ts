import { memoize } from "lodash";

type BasicTree = {
  id: string;
};

export type TreeUtilOptions<TTree extends BasicTree> = {
  flattenShallow: (tree: TTree) => TTree[];
};

export const createTreeUtils = <TTree extends BasicTree>({
  flattenShallow,
}: TreeUtilOptions<TTree>) => {
  const flatten = memoize((current: TTree): TTree[] => {
    const treeNodeMap = getIdMap(current);
    return Object.values(treeNodeMap) as TTree[];
  });

  const getIdMap = memoize((current: TTree): Record<string, TTree> => {
    if (!current.id) {
      throw new Error(`ID missing from node`);
    }

    const map = {
      [current.id]: current,
    };

    Object.assign(map, ...flattenShallow(current).map(getIdMap));
    return map;
  });

  const getById = (id: string, current: TTree) => {
    return getIdMap(current)[id];
  };

  const getChildParentMap = memoize((current: TTree): Record<string, TTree> => {
    const idMap = getIdMap(current);
    const parentChildMap: any = {};

    for (const id in idMap) {
      const parent = idMap[id];
      const children = flattenShallow(parent);
      for (const child of children) {
        parentChildMap[child.id] = parent;
      }
    }
    return parentChildMap;
  });

  const getAncestors = memoize((nodeId: string, root: TTree) => {
    const ancestors: TTree[] = [];
    const childParentMap = getChildParentMap(root);
    let currId = nodeId;
    while (1) {
      const ancestor = childParentMap[currId];
      if (!ancestor) {
        break;
      }
      ancestors.push(ancestor);
      currId = ancestor.id;
    }

    return ancestors;
  });

  const getParent = (nodeId: string, root: TTree) =>
    getAncestors(nodeId, root)[0];

  return {
    getById,
    flatten,
    getIdMap,
    getChildParentMap,
    getAncestors,
    getParent,
  };
};
