// import { expect } from "chai";
// import { evaluatePCModule } from "../evaluate";
// import { Frame, createSyntheticElement } from "..";
// import {
//   PCModule,
//   createPCComponent,
//   createPCElement,
//   createPCModule,
//   createPCComponentInstance,
//   createPCVariant,
//   createPCDependency,
//   createPCOverride,
//   PCOverridablePropertyName,
//   createPCTextNode,
//   createPCSlot,
//   createPCPlug
// } from "../dsl";
// import { cloneTreeNode } from "tandem-common";
// import { DependencyGraph } from "../graph";

// const clone = v => JSON.parse(JSON.stringify(v));

// describe(__filename + "#", () => {
//   type EvaluateCases = Array<[PCModule, Frame[]]>;

//   const defaultBounds = {
//     left: 0,
//     top: 0,
//     right: 100,
//     bottom: 100
//   };

//   const createFakeGraph = (...modules: PCModule[]) => {
//     const graph: DependencyGraph = {};
//     let i = 0;
//     for (const module of modules) {
//       graph[++i] = createPCDependency(String(i), module);
//     }
//     return graph;
//   };

//   const nodeIdCleaner = (i = 0) => {
//     let alreadyReset: any = {};
//     return node => {
//       return cloneTreeNode(node, child => {
//         if (alreadyReset[child.id]) return child.id;
//         const newId = String("00000000" + i++);
//         alreadyReset[newId] = 1;
//         return newId;
//       });
//     };
//   };

//   it("can evaluate a simple component", () => {
//     const module = nodeIdCleaner()(
//       createPCModule([
//         createPCComponent("Test", "body", { a: "b" }, {}, [
//           createPCElement("div", { a: "b2" }, { c: "d" })
//         ])
//       ])
//     );

//     const document = evaluatePCModule(module, createFakeGraph(module));

//     expect(nodeIdCleaner()(document.children[0])).to.eql({
//       id: "000000000",
//       metadata: {},
//       label: "Test",
//       variant: {},
//       isComponentInstance: false,
//       isCreatedFromComponent: true,
//       isContentNode: true,
//       immutable: false,
//       source: {
//         nodeId: "000000001"
//       },
//       name: "body",
//       attributes: {},
//       style: {
//         a: "b"
//       },
//       children: [
//         {
//           id: "000000001",
//           metadata: {},
//           label: undefined,
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: false,
//           immutable: false,
//           source: {
//             nodeId: "000000002"
//           },
//           name: "div",
//           attributes: {
//             c: "d"
//           },
//           style: {
//             a: "b2"
//           },
//           children: []
//         }
//       ]
//     });
//   });

//   it("can evaluate an instance of a component", () => {
//     const cleanIds = nodeIdCleaner();

//     const component = cleanIds(
//       createPCComponent("Test", "body", { a: "b" }, { c: "a" }, [
//         createPCElement("div", { a: "b2" }, { c: "d" })
//       ])
//     );

//     const module = cleanIds(
//       createPCModule([
//         component,
//         createPCComponentInstance(component.id, null, { a: "b3" })
//       ])
//     );

//     const document = evaluatePCModule(module, createFakeGraph(module));

//     expect(document.children.length).to.eql(2);

//     expect(nodeIdCleaner()(document.children[1])).to.eql({
//       id: "000000000",
//       metadata: {},
//       variant: {},
//       isComponentInstance: true,
//       isCreatedFromComponent: true,
//       label: undefined,
//       isContentNode: true,
//       immutable: false,
//       source: {
//         nodeId: "000000003"
//       },
//       name: "body",
//       attributes: {
//         c: "a",
//         a: "b3"
//       },
//       style: {
//         a: "b"
//       },
//       children: [
//         {
//           id: "000000001",
//           metadata: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           label: undefined,
//           isContentNode: false,
//           immutable: true,
//           source: {
//             nodeId: "000000001"
//           },
//           name: "div",
//           attributes: {
//             c: "d"
//           },
//           style: {
//             a: "b2"
//           },
//           children: []
//         }
//       ]
//     });
//   });

//   it("components can extend existing components", () => {
//     const cleanIds = nodeIdCleaner();

//     const component1 = cleanIds(
//       createPCComponent("Test", "div", { a: "b" }, { c: "a" }, [
//         createPCElement("div", { a: "b2" }, { c: "d" })
//       ])
//     );

//     const component2 = cleanIds(
//       createPCComponent("Test", component1.id, { a: "b2" }, { c: "a2" }, [])
//     );

//     const module = cleanIds(createPCModule([component1, component2]));

//     const document = evaluatePCModule(module, createFakeGraph(module));

//     expect(clone(nodeIdCleaner()(document.children[1]))).to.eql({
//       id: "000000000",
//       metadata: {},
//       label: "Test",
//       variant: {},
//       isComponentInstance: false,
//       isCreatedFromComponent: true,
//       isContentNode: true,
//       immutable: false,
//       source: {
//         nodeId: "000000002"
//       },
//       name: "div",
//       attributes: {
//         c: "a2"
//       },
//       style: {
//         a: "b2"
//       },
//       children: [
//         {
//           id: "000000001",
//           metadata: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: false,
//           immutable: true,
//           source: {
//             nodeId: "000000001"
//           },
//           name: "div",
//           attributes: {
//             c: "d"
//           },
//           style: {
//             a: "b2"
//           },
//           children: []
//         }
//       ]
//     });

//     it("extended components can provide slots to parent components", () => {
//       const cleanIds = nodeIdCleaner();

//       const container = cleanIds(
//         createPCElement("div", { a: "b2" }, { c: "d" })
//       );

//       const component1 = cleanIds(
//         createPCComponent("Test", "div", { a: "b" }, { c: "a" }, [container])
//       );

//       const component2 = cleanIds(
//         createPCComponent("Test", component1.id, { a: "b2" }, { c: "a2" }, [
//           createPCOverride([container.id], PCOverridablePropertyName.CHILDREN, [
//             createPCElement("div", { a: "bb" }, { c: "dd" })
//           ])
//         ])
//       );

//       const module = cleanIds(createPCModule([component1, component2]));

//       const document = evaluatePCModule(module, createFakeGraph(module));

//       expect(document.children.length).to.eql(2);

//       expect(nodeIdCleaner()(document.children[1])).to.eql({
//         id: "000000000",
//         metadata: {},
//         variant: {},
//         isComponentInstance: true,
//         isCreatedFromComponent: true,
//         isContentNode: true,
//         immutable: false,
//         source: {
//           nodeId: "000000003"
//         },
//         name: "body",
//         attributes: {
//           c: "a",
//           a: "b3"
//         },
//         style: {
//           a: "b"
//         },
//         children: [
//           {
//             id: "000000001",
//             metadata: {},
//             isComponentInstance: false,
//             isCreatedFromComponent: true,
//             isContentNode: false,
//             immutable: true,
//             source: {
//               nodeId: "000000001"
//             },
//             name: "div",
//             attributes: {
//               c: "d"
//             },
//             style: {
//               a: "b2"
//             },
//             children: []
//           }
//         ]
//       });
//     });
//   });

//   it("can extend a component 4 levels up", () => {
//     const cleanIds = nodeIdCleaner();

//     const container1 = cleanIds(createPCElement("a", {}, {}));
//     const component1 = cleanIds(
//       createPCComponent("Test", "div", { color: "red" }, {}, [container1])
//     );

//     const container2 = cleanIds(createPCElement("b", {}, {}));
//     const component2 = cleanIds(
//       createPCComponent("Test", component1.id, { color: "green" }, {}, [
//         createPCOverride([container1.id], PCOverridablePropertyName.CHILDREN, [
//           container2,
//           createPCElement("b2", {}, {})
//         ])
//       ])
//     );

//     const container3 = cleanIds(createPCElement("c", {}, {}));
//     const component3 = cleanIds(
//       createPCComponent("Test", component2.id, { color: "blue" }, {}, [
//         createPCOverride([container2.id], PCOverridablePropertyName.CHILDREN, [
//           container3
//         ])
//       ])
//     );

//     const container4 = cleanIds(createPCElement("d", {}, {}));
//     const component4 = cleanIds(
//       createPCComponent("Test", component3.id, {}, {}, [
//         createPCOverride([container3.id], PCOverridablePropertyName.CHILDREN, [
//           container4
//         ])
//       ])
//     );

//     const module = cleanIds(
//       createPCModule([component1, component2, component3, component4])
//     );

//     const document = evaluatePCModule(module, createFakeGraph(module));

//     expect(document.children.length).to.eql(4);

//     expect(clone(nodeIdCleaner()(document.children[3]))).to.eql({
//       id: "000000000",
//       metadata: {},
//       label: "Test",
//       variant: {},
//       isComponentInstance: false,
//       isCreatedFromComponent: true,
//       isContentNode: true,
//       immutable: false,
//       source: {
//         nodeId: "0000000010"
//       },
//       name: "div",
//       attributes: {},
//       style: {
//         color: "blue"
//       },
//       children: [
//         {
//           id: "000000001",
//           metadata: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: false,
//           immutable: true,
//           source: {
//             nodeId: "000000000"
//           },
//           name: "a",
//           attributes: {},
//           style: {},
//           children: [
//             {
//               id: "000000002",
//               metadata: {},
//               isComponentInstance: false,
//               isCreatedFromComponent: true,
//               isContentNode: false,
//               immutable: true,
//               source: {
//                 nodeId: "000000002"
//               },
//               name: "b",
//               attributes: {},
//               style: {},
//               children: [
//                 {
//                   id: "000000003",
//                   metadata: {},
//                   isComponentInstance: false,
//                   isCreatedFromComponent: true,
//                   isContentNode: false,
//                   immutable: true,
//                   source: {
//                     nodeId: "000000006"
//                   },
//                   name: "c",
//                   attributes: {},
//                   style: {},
//                   children: [
//                     {
//                       id: "000000004",
//                       metadata: {},
//                       isComponentInstance: false,
//                       isCreatedFromComponent: true,
//                       isContentNode: false,
//                       immutable: false,
//                       source: {
//                         nodeId: "000000009"
//                       },
//                       name: "d",
//                       attributes: {},
//                       style: {},
//                       children: []
//                     }
//                   ]
//                 }
//               ]
//             },
//             {
//               id: "000000005",
//               metadata: {},
//               isComponentInstance: false,
//               isCreatedFromComponent: true,
//               isContentNode: false,
//               immutable: true,
//               source: {
//                 nodeId: "000000005"
//               },
//               name: "b2",
//               attributes: {},
//               style: {},
//               children: []
//             }
//           ]
//         }
//       ]
//     });
//   });

//   it("can override a nested node style in a component", () => {
//     const cleanIds = nodeIdCleaner();

//     const container1 = cleanIds(createPCElement("a", { color: "blue" }, {}));
//     const component1 = cleanIds(
//       createPCComponent("Test", "div", {}, {}, [container1])
//     );

//     const component2 = cleanIds(
//       createPCComponent("Test", component1.id, {}, {}, [
//         createPCOverride([container1.id], PCOverridablePropertyName.STYLE, {
//           color: "red"
//         })
//       ])
//     );

//     const module = cleanIds(createPCModule([component1, component2]));

//     const document = evaluatePCModule(module, createFakeGraph(module));

//     expect(document.children.length).to.eql(2);

//     expect(clone(nodeIdCleaner()(document.children[1]))).to.eql({
//       id: "000000000",
//       metadata: {},
//       label: "Test",
//       variant: {},
//       isComponentInstance: false,
//       isCreatedFromComponent: true,
//       isContentNode: true,
//       immutable: false,
//       source: {
//         nodeId: "000000002"
//       },
//       name: "div",
//       attributes: {},
//       style: {},
//       children: [
//         {
//           id: "000000001",
//           metadata: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: false,
//           immutable: true,
//           source: {
//             nodeId: "000000000"
//           },
//           name: "a",
//           attributes: {},
//           style: {
//             color: "red"
//           },
//           children: []
//         }
//       ]
//     });
//   });

//   it("can evaluate a component with a variant", () => {
//     const cleanIds = nodeIdCleaner();

//     const variant1 = cleanIds(createPCVariant("a"));
//     let container1 = cleanIds(
//       createPCElement("a", { color: "blue" }, {}, [
//         createPCOverride(
//           [],
//           PCOverridablePropertyName.STYLE,
//           { color: "red" },
//           variant1.id
//         )
//       ])
//     );

//     const component1 = cleanIds(
//       createPCComponent("Test", "div", {}, {}, [variant1, container1])
//     );

//     const module = cleanIds(
//       createPCModule([
//         component1,
//         createPCComponentInstance(component1.id, [variant1.id])
//       ])
//     );

//     const document = clone(
//       cleanIds(evaluatePCModule(module, createFakeGraph(module)))
//     );

//     expect(document).to.eql({
//       id: "000000006",
//       metadata: {},
//       source: {
//         nodeId: "000000004"
//       },
//       name: "document",
//       children: [
//         {
//           id: "000000007",
//           metadata: {},
//           label: "Test",
//           variant: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000003"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: [
//             {
//               id: "000000008",
//               metadata: {},
//               isComponentInstance: false,
//               isCreatedFromComponent: true,
//               isContentNode: false,
//               immutable: false,
//               source: {
//                 nodeId: "000000001"
//               },
//               name: "a",
//               attributes: {},
//               style: {
//                 color: "blue"
//               },
//               children: []
//             }
//           ]
//         },
//         {
//           id: "000000009",
//           metadata: {},
//           variant: {},
//           isComponentInstance: true,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000005"
//           },
//           name: "div",
//           attributes: {},
//           style: {
//             "0": "000000000"
//           },
//           children: [
//             {
//               id: "0000000010",
//               metadata: {},
//               isComponentInstance: false,
//               isCreatedFromComponent: true,
//               isContentNode: false,
//               immutable: true,
//               source: {
//                 nodeId: "000000001"
//               },
//               name: "a",
//               attributes: {},
//               style: {
//                 color: "blue"
//               },
//               children: []
//             }
//           ]
//         }
//       ]
//     });
//   });

//   it("can evaluate an overridden variant default that is also empty", () => {
//     const cleanIds = nodeIdCleaner();
//     const variant = cleanIds(createPCVariant(null, true));
//     const component = cleanIds(
//       createPCComponent(null, null, {}, {}, [variant])
//     );
//     const instance = cleanIds(
//       createPCComponentInstance(component.id, {}, {}, [
//         createPCOverride(
//           [variant.id],
//           PCOverridablePropertyName.VARIANT_IS_DEFAULT,
//           false
//         )
//       ])
//     );

//     const module = cleanIds(createPCModule([component, instance]));

//     const document = clone(
//       cleanIds(evaluatePCModule(module, createFakeGraph(module)))
//     );

//     expect(document).to.eql({
//       id: "000000005",
//       metadata: {},
//       source: {
//         nodeId: "000000004"
//       },
//       name: "document",
//       children: [
//         {
//           id: "000000006",
//           metadata: {},
//           label: null,
//           variant: {
//             "000000000": true
//           },
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000001"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: []
//         },
//         {
//           id: "000000007",
//           metadata: {},
//           variant: {
//             "000000000": false
//           },
//           isComponentInstance: true,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000002"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: []
//         }
//       ]
//     });
//   });

//   it("can evaluate a slot with default children", () => {
//     const cleanIds = nodeIdCleaner();

//     const component1 = cleanIds(
//       createPCComponent("Test", "div", {}, {}, [
//         createPCSlot([createPCTextNode("blarg")])
//       ])
//     );

//     const module = cleanIds(createPCModule([component1]));

//     const document = clone(
//       cleanIds(evaluatePCModule(module, createFakeGraph(module)))
//     );

//     expect(document).to.eql({
//       id: "000000004",
//       metadata: {},
//       source: {
//         nodeId: "000000003"
//       },
//       name: "document",
//       children: [
//         {
//           id: "000000005",
//           metadata: {},
//           label: "Test",
//           variant: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000000"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: [
//             {
//               label: "blarg",
//               id: "000000006",
//               metadata: {},
//               value: "blarg",
//               isContentNode: false,
//               isCreatedFromComponent: true,
//               immutable: false,
//               source: {
//                 nodeId: "000000002"
//               },
//               name: "text",
//               style: {},
//               children: []
//             }
//           ]
//         }
//       ]
//     });
//   });

//   it("can override slot children", () => {
//     const cleanIds = nodeIdCleaner();

//     const slot1 = cleanIds(createPCSlot([createPCTextNode("a")]));

//     const component1 = cleanIds(
//       createPCComponent("Test", "div", {}, {}, [slot1])
//     );

//     const instance1 = cleanIds(
//       createPCComponentInstance(component1.id, {}, {}, [
//         createPCPlug(slot1.id, [createPCTextNode("b")])
//       ])
//     );

//     const module = cleanIds(createPCModule([component1, instance1]));

//     const document = clone(
//       cleanIds(evaluatePCModule(module, createFakeGraph(module)))
//     );

//     expect(document).to.eql({
//       id: "000000007",
//       metadata: {},
//       source: {
//         nodeId: "000000006"
//       },
//       name: "document",
//       children: [
//         {
//           id: "000000008",
//           metadata: {},
//           label: "Test",
//           variant: {},
//           isComponentInstance: false,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000002"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: [
//             {
//               label: "a",
//               id: "000000009",
//               metadata: {},
//               value: "a",
//               isContentNode: false,
//               isCreatedFromComponent: true,
//               immutable: false,
//               source: {
//                 nodeId: "000000001"
//               },
//               name: "text",
//               style: {},
//               children: []
//             }
//           ]
//         },
//         {
//           id: "0000000010",
//           metadata: {},
//           variant: {},
//           isComponentInstance: true,
//           isCreatedFromComponent: true,
//           isContentNode: true,
//           immutable: false,
//           source: {
//             nodeId: "000000003"
//           },
//           name: "div",
//           attributes: {},
//           style: {},
//           children: [
//             {
//               label: "b",
//               id: "0000000011",
//               metadata: {},
//               value: "b",
//               isContentNode: false,
//               isCreatedFromComponent: true,
//               immutable: false,
//               source: {
//                 nodeId: "000000005"
//               },
//               name: "text",
//               style: {},
//               children: []
//             }
//           ]
//         }
//       ]
//     });
//   });
// });
