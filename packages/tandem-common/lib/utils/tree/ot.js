// import { TreeNode, updateNestedNodeFromPath } from "../../state/tree";
// import { EMPTY_OBJECT } from "../object";
// import {
//   diffArray,
//   ArrayOperationalTransformType,
//   ArrayInsertMutation,
//   ArrayUpdateMutation,
//   arraySplice,
//   ArrayDeleteMutation
// } from "../array";
// // to add namespace, import with import * as tree from "utils/tree";
// /**
//  * Operational transforms
//  */
// export enum OperationalTransformType {
//   SET_ATTRIBUTE = "SET_ATTRIBUTE",
//   REMOVE_CHILD = "REMOVE_CHILD",
//   INSERT_CHILD = "INSERT_CHILD",
//   MOVE_CHILD = "MOVE_CHILD"
// }
// export type OperationalTransform = {
//   type: OperationalTransformType;
//   path: number[];
// };
// export type SetAttributeTransform = {
//   name: string;
//   namespace: string;
//   value: any;
// } & OperationalTransform;
// export type InsertChildTransform = {
//   child: TreeNode<any>;
//   index: number;
// } & OperationalTransform;
// export type RemoveChildTransform = {
//   index: number;
// } & OperationalTransform;
// export type MoveChildTransform = {
//   oldIndex: number;
//   newIndex: number;
// } & OperationalTransform;
// export const createSetAttributeTransform = (
//   path: number[],
//   name: string,
//   namespace: string,
//   value: any
// ): SetAttributeTransform => ({
//   type: OperationalTransformType.SET_ATTRIBUTE,
//   path,
//   name,
//   namespace,
//   value
// });
// export const createInsertChildTransform = (
//   path: number[],
//   child: TreeNode<any>,
//   index: number
// ): InsertChildTransform => ({
//   type: OperationalTransformType.INSERT_CHILD,
//   path,
//   index,
//   child
// });
// export const createRemoveChildTransform = (
//   path: number[],
//   index: number
// ): RemoveChildTransform => ({
//   type: OperationalTransformType.REMOVE_CHILD,
//   path,
//   index
// });
// export const createMoveChildTransform = (
//   path: number[],
//   oldIndex: number,
//   newIndex: number
// ): MoveChildTransform => ({
//   type: OperationalTransformType.MOVE_CHILD,
//   path,
//   oldIndex,
//   newIndex
// });
// export const diffNode = (
//   a: TreeNode<any>,
//   b: TreeNode<any>,
//   path: number[] = [],
//   diffs: OperationalTransform[] = []
// ) => {
//   // // delete & update
//   // for (const namespace in a.attributes) {
//   //   const aatts = a.attributes[namespace];
//   //   const batts = b.attributes[namespace] || EMPTY_OBJECT;
//   //   for (const name in aatts) {
//   //     const newValue = batts[name];
//   //     const oldValue = aatts[name];
//   //     if (oldValue !== newValue) {
//   //       diffs.push(
//   //         createSetAttributeTransform(path, name, namespace, newValue)
//   //       );
//   //     }
//   //   }
//   // }
//   // // insert
//   // for (const namespace in b.attributes) {
//   //   const aatts = a.attributes[namespace] || EMPTY_OBJECT;
//   //   const batts = b.attributes[namespace];
//   //   for (const name in batts) {
//   //     const newValue = batts[name];
//   //     const oldValue = aatts[name];
//   //     if (oldValue == null) {
//   //       diffs.push(
//   //         createSetAttributeTransform(path, name, namespace, newValue)
//   //       );
//   //     }
//   //   }
//   // }
//   const cots = diffArray(a.children, b.children, (a, b) => {
//     return a.name === b.name ? 0 : -1;
//   });
//   for (const ot of cots) {
//     switch (ot.type) {
//       case ArrayOperationalTransformType.INSERT: {
//         const { value, index } = ot as ArrayInsertMutation<TreeNode<any>>;
//         diffs.push(createInsertChildTransform(path, value, index));
//         break;
//       }
//       case ArrayOperationalTransformType.UPDATE: {
//         const {
//           patchedOldIndex,
//           originalOldIndex,
//           index,
//           newValue
//         } = ot as ArrayUpdateMutation<TreeNode<any>>;
//         if (patchedOldIndex !== index) {
//           diffs.push(createMoveChildTransform(path, patchedOldIndex, index));
//         }
//         diffNode(
//           a.children[originalOldIndex],
//           newValue,
//           [...path, index],
//           diffs
//         );
//         break;
//       }
//       case ArrayOperationalTransformType.DELETE: {
//         const { index } = ot as ArrayDeleteMutation;
//         diffs.push(createRemoveChildTransform(path, index));
//         break;
//       }
//     }
//   }
//   return diffs;
// };
// export const patchNode = <TNode extends TreeNode<any>>(
//   ots: OperationalTransform[],
//   a: TNode
// ): TNode => {
//   let b = a;
//   for (const ot of ots) {
//     switch (ot.type) {
//       // case OperationalTransformType.SET_ATTRIBUTE: {
//       //   const { path, name, namespace, value } = ot as SetAttributeTransform;
//       //   b = updateNestedNodeFromPath(path, b, parent =>
//       //     mergeNodeAttributes(parent, {
//       //       [namespace]: {
//       //         [name]: value
//       //       }
//       //     })
//       //   );
//       //   break;
//       // }
//       case OperationalTransformType.INSERT_CHILD: {
//         const { path, child, index } = ot as InsertChildTransform;
//         b = updateNestedNodeFromPath(path, b, parent => ({
//           ...parent,
//           children: arraySplice(parent.children, index, 0, child)
//         }));
//         break;
//       }
//       case OperationalTransformType.MOVE_CHILD: {
//         const { path, oldIndex, newIndex } = ot as MoveChildTransform;
//         b = updateNestedNodeFromPath(path, b, parent => {
//           const newChildren = [...parent.children];
//           const child = newChildren[oldIndex];
//           newChildren.splice(oldIndex, 1);
//           newChildren.splice(newIndex, 0, child);
//           return {
//             ...parent,
//             children: newChildren
//           };
//         });
//         break;
//       }
//       case OperationalTransformType.REMOVE_CHILD: {
//         const { path, index } = ot as RemoveChildTransform;
//         b = updateNestedNodeFromPath(path, b, parent => {
//           return {
//             ...parent,
//             children: arraySplice(parent.children, index, 1)
//           };
//         });
//         break;
//       }
//       default: {
//         throw new Error(`OT ${ot.type} not supported yet`);
//       }
//     }
//   }
//   return b;
// };
//# sourceMappingURL=ot.js.map
