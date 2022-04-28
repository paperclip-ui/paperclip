// import { expect } from "chai";
// import {
//   createPCElement,
//   diffTreeNode,
//   patchTreeNode,
//   evaluatePCModule,
//   createPCModule
// } from "..";
// import { updateNestedNode, cloneTreeNode } from "tandem-common";

// describe(__filename + "#", () => {
//   [
//     [createPCElement("div"), node => ({ ...node, is: "span" })],

//     // insert child
//     [
//       createPCElement("div"),
//       node => ({ ...node, children: [createPCElement("div")] })
//     ]
//   ].forEach(([oldNode, updater]: any) => {
//     xit(`can transform from ${JSON.stringify(oldNode)} to ${JSON.stringify(
//       updater(oldNode)
//     )}`, () => {
//       const module = createPCModule([oldNode]);

//       const updatedModule = updateNestedNode(oldNode, module, updater);

//       const oldDocument = evaluatePCModule(module);
//       const newDocument = evaluatePCModule(updatedModule);

//       const ots = diffTreeNode(oldDocument, newDocument);

//       expect(nodeIdCleaner()(patchTreeNode(ots, oldDocument))).to.eql(
//         nodeIdCleaner()(newDocument)
//       );
//     });
//   });
// });

// const nodeIdCleaner = (i = 0) => {
//   let alreadyReset: any = {};
//   return node => {
//     return cloneTreeNode(node, child => {
//       if (alreadyReset[child.id]) return child.id;
//       const newId = String("00000000" + i++);
//       alreadyReset[newId] = 1;
//       return newId;
//     });
//   };
// };
