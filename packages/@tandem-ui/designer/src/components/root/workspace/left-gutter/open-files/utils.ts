import { InspectorNode } from "@paperclip-lang/core";
import {
  DependencyGraph,
  getPCNode,
  PCSourceTagNames,
} from "@paperclip-lang/core";

// export const getContentNode = (
//   inspectorNode: InspectorNode,
//   contentNode: InspectorNode,
//   graph: DependencyGraph
// ) => {
//   return (
//     contentNode ||
//     (getPCNode(inspectorNode.sourceNodeId, graph).name !==
//     PCSourceTagNames.MODULE
//       ? inspectorNode
//       : null)
//   );
// };
