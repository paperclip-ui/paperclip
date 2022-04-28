import { SyntheticVisibleNode } from "./synthetic";
import {
  updateNestedNodeFromPath,
  arraySplice,
  memoize,
  diffArray,
  ArrayOperationalTransformType,
  ArrayDeleteMutation,
  ArrayUpdateMutation,
  ArrayInsertMutation,
  TreeNode
} from "tandem-common";
import { PCNode } from "./dsl";
import { InspectorNode } from "./inspector";

export enum TreeNodeOperationalTransformType {
  SET_PROPERTY,
  MOVE_CHILD,
  REMOVE_CHILD,
  INSERT_CHILD
}

export type BaseTreeNodeOperationalTransform<
  TType extends TreeNodeOperationalTransformType
> = {
  nodePath: number[];
  type: TType;
};

export type InsertChildNodeOperationalTransform = {
  nodePath: number[];
  index: number;
  child: SyntheticVisibleNode | PCNode | InspectorNode;
} & BaseTreeNodeOperationalTransform<
  TreeNodeOperationalTransformType.INSERT_CHILD
>;

export type RemoveChildNodeOperationalTransform = {
  nodePath: number[];
  index: number;
} & BaseTreeNodeOperationalTransform<
  TreeNodeOperationalTransformType.REMOVE_CHILD
>;

export type MoveChildNodeOperationalTransform = {
  nodePath: number[];
  oldIndex: number;
  newIndex: number;
} & BaseTreeNodeOperationalTransform<
  TreeNodeOperationalTransformType.MOVE_CHILD
>;

export type SetNodePropertyOperationalTransform = {
  nodePath: number[];
  name: string;
  value: any;
} & BaseTreeNodeOperationalTransform<
  TreeNodeOperationalTransformType.SET_PROPERTY
>;

export type TreeNodeOperationalTransform =
  | InsertChildNodeOperationalTransform
  | RemoveChildNodeOperationalTransform
  | MoveChildNodeOperationalTransform
  | SetNodePropertyOperationalTransform;

const createInsertChildNodeOperationalTransform = (
  nodePath: number[],
  child: SyntheticVisibleNode | PCNode | InspectorNode,
  index: number
): InsertChildNodeOperationalTransform => ({
  type: TreeNodeOperationalTransformType.INSERT_CHILD,
  nodePath,
  child,
  index
});

const createRemoveChildNodeOperationalTransform = (
  nodePath: number[],
  index: number
): RemoveChildNodeOperationalTransform => ({
  type: TreeNodeOperationalTransformType.REMOVE_CHILD,
  nodePath,
  index
});

const createMoveChildNodeOperationalTransform = (
  nodePath: number[],
  oldIndex: number,
  newIndex: number
): MoveChildNodeOperationalTransform => ({
  type: TreeNodeOperationalTransformType.MOVE_CHILD,
  nodePath,
  oldIndex,
  newIndex
});

export const createSetNodePropertyOperationalTransform = (
  nodePath: number[],
  name: string,
  value: any
): SetNodePropertyOperationalTransform => ({
  type: TreeNodeOperationalTransformType.SET_PROPERTY,
  nodePath,
  name,
  value
});

const defaultComparator = (a, b) =>
  (a.sourceNodeId ? a.sourceNodeId === b.sourceNodeId : a.id === b.id) ? 0 : -1;
type NodeComparator = (a: TreeNode<any>, b: TreeNode<any>) => number;

export const diffTreeNode = memoize(
  (
    oldNode: TreeNode<any>,
    newNode: TreeNode<any>,
    ignoreDiffKeys = IGNORE_DIFF_KEYS,
    compareTreeNodes: NodeComparator = defaultComparator
  ) => {
    const ots = _diffTreeNode(
      oldNode,
      newNode,
      [],
      [],
      ignoreDiffKeys,
      compareTreeNodes
    );
    return ots;
  }
);

const IGNORE_DIFF_KEYS = {};

const PROHIBITED_DIFF_KEYS = {
  children: true,
  id: true
};

const _diffTreeNode = (
  oldNode: TreeNode<any>,
  newNode: TreeNode<any>,
  nodePath: number[],
  ots: TreeNodeOperationalTransform[] = [],
  ignoreDiffKeys: any,
  compareTreeNodes: NodeComparator
): TreeNodeOperationalTransform[] => {
  if (oldNode === newNode) {
    return ots;
  }

  for (const key in newNode) {
    if (ignoreDiffKeys[key] || PROHIBITED_DIFF_KEYS[key]) {
      continue;
    }
    const oldValue = oldNode[key];
    const newValue = newNode[key];

    if (
      oldValue !== newValue &&
      !(
        typeof newValue === "object" &&
        JSON.stringify(oldValue) === JSON.stringify(newValue)
      )
    ) {
      ots.push(
        createSetNodePropertyOperationalTransform(nodePath, key, newValue)
      );
    }
  }

  const childOts = diffArray(
    oldNode.children as SyntheticVisibleNode[],
    newNode.children as SyntheticVisibleNode[],
    compareTreeNodes
  );

  for (const ot of childOts) {
    if (ot.type === ArrayOperationalTransformType.DELETE) {
      ots.push(
        createRemoveChildNodeOperationalTransform(
          nodePath,
          (ot as ArrayDeleteMutation).index
        )
      );
    } else if (ot.type === ArrayOperationalTransformType.UPDATE) {
      const uot = ot as ArrayUpdateMutation<any>;
      const oldChild = oldNode.children[
        uot.originalOldIndex
      ] as SyntheticVisibleNode;

      _diffTreeNode(
        oldChild,
        uot.newValue,
        [...nodePath, uot.patchedOldIndex],
        ots,
        ignoreDiffKeys,
        compareTreeNodes
      );

      if (uot.index !== uot.patchedOldIndex) {
        ots.push(
          createMoveChildNodeOperationalTransform(
            nodePath,
            uot.originalOldIndex,
            uot.index
          )
        );
      }
    } else if (ot.type === ArrayOperationalTransformType.INSERT) {
      const iot = ot as ArrayInsertMutation<any>;
      ots.push(
        createInsertChildNodeOperationalTransform(
          nodePath,
          iot.value,
          iot.index
        )
      );
    }
  }

  return ots;
};

export const patchTreeNode = (
  ots: TreeNodeOperationalTransform[],
  oldNode: TreeNode<any>
) => {
  return ots.reduce((node, ot) => {
    return updateNestedNodeFromPath(
      ot.nodePath,
      node,
      (target: SyntheticVisibleNode) => {
        switch (ot.type) {
          case TreeNodeOperationalTransformType.SET_PROPERTY: {
            return {
              ...target,
              [ot.name]: ot.value
            };
          }
          case TreeNodeOperationalTransformType.INSERT_CHILD: {
            return {
              ...target,
              children: arraySplice(target.children, ot.index, 0, ot.child)
            };
          }
          case TreeNodeOperationalTransformType.REMOVE_CHILD: {
            return {
              ...target,
              children: arraySplice(target.children, ot.index, 1)
            };
          }
          case TreeNodeOperationalTransformType.MOVE_CHILD: {
            return {
              ...target,
              children: arraySplice(
                arraySplice(target.children, ot.oldIndex, 1),
                ot.newIndex,
                0,
                target.children[ot.oldIndex]
              )
            };
          }
        }
      }
    );
  }, oldNode);
};
