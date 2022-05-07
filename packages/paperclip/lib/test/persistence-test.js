// import { expect } from "chai";
// import {
//   // evaluateDependency,
//   PCEditorState,
//   createPCDependency,
//   PCModule,
//   createPCModule,
//   createPCComponent,
//   persistInsertNode,
//   createPCElement,
//   createPCComponentInstance,
//   persistRawCSSText,
//   persistInspectorNodeStyle,
//   SyntheticVisibleNode,
//   createPCTextNode,
//   persistMoveSyntheticVisibleNode,
//   SyntheticTextNode
// } from "..";
// import { TreeMoveOffset } from "tandem-common";
// import { evaluateEditedStateSync, persistToggleInstanceVariant } from "../edit";
// import {
//   createPCVariant,
//   createPCOverride,
//   PCOverridablePropertyName,
//   getPCNode,
//   PCComponent,
//   getOverrides,
//   PCStyleOverride,
//   PCComponentInstanceElement,
//   PCVariantOverride
// } from "../dsl";
// import { SyntheticInstanceElement, getSyntheticSourceNode } from "../synthetic";
// const clone = v => JSON.parse(JSON.stringify(v));
// describe(__filename + "#", () => {
//   const createEditorState = (module: PCModule) => {
//     const graph = {
//       "0": createPCDependency("0", module)
//     };
//     let state: PCEditorState = {
//       sourceNodeInspector: null,
//       graph,
//       documents: [],
//       frames: [],
//       fileCache: {}
//     };
//     // state = evaluateDependency("0", state);
//     return state;
//   };
//   it("can insert an element into the root document", () => {
//     let state = createEditorState(createPCModule());
//     state = evaluateEditedStateSync(state);
//     const [document] = state.documents;
//     state = persistInsertNode(
//       createPCElement("div"),
//       getSyntheticSourceNode(document, state.graph),
//       TreeMoveOffset.APPEND,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children.length).to.eql(1);
//     expect(newDocument.children[0].name).to.eql("div");
//   });
//   it("can move a content node into another content node", () => {
//     const contentNode1Source = createPCElement("div");
//     const contentNode2Source = createPCTextNode("some text");
//     let state = createEditorState(
//       createPCModule([contentNode1Source, contentNode2Source])
//     );
//     state = evaluateEditedStateSync(state);
//     const [document] = state.documents;
//     expect(document.children.length).to.eql(2);
//     state = persistMoveSyntheticVisibleNode(
//       getSyntheticSourceNode(document.children[1], state.graph),
//       getSyntheticSourceNode(document.children[0], state.graph),
//       TreeMoveOffset.APPEND,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children.length).to.eql(1);
//     expect(newDocument.children[0].name).to.eql("div");
//     expect(newDocument.children[0].children.length).to.eql(1);
//     expect(newDocument.children[0].children[0].name).to.eql("text");
//   });
//   it("can move a content node before another node", () => {
//     const contentNode1Source = createPCElement("div");
//     const contentNode2Source = createPCTextNode("some text");
//     let state = createEditorState(
//       createPCModule([contentNode1Source, contentNode2Source])
//     );
//     state = evaluateEditedStateSync(state);
//     const [document] = state.documents;
//     expect(document.children.length).to.eql(2);
//     state = persistMoveSyntheticVisibleNode(
//       getSyntheticSourceNode(document.children[1], state.graph),
//       getSyntheticSourceNode(document.children[0], state.graph),
//       TreeMoveOffset.BEFORE,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children.length).to.eql(2);
//     expect(newDocument.children[0].name).to.eql("text");
//   });
//   it("can move a content node after another node", () => {
//     const contentNode1Source = createPCElement("div");
//     const contentNode2Source = createPCTextNode("some text");
//     let state = createEditorState(
//       createPCModule([contentNode1Source, contentNode2Source])
//     );
//     state = evaluateEditedStateSync(state);
//     const [document] = state.documents;
//     expect(document.children.length).to.eql(2);
//     state = persistMoveSyntheticVisibleNode(
//       getSyntheticSourceNode(document.children[1], state.graph),
//       getSyntheticSourceNode(document.children[0], state.graph),
//       TreeMoveOffset.AFTER,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children.length).to.eql(2);
//     expect(newDocument.children[0].name).to.eql("div");
//   });
//   return;
//   it("immediate child can be overridden", () => {
//     const child = createPCElement("h1");
//     const component1 = createPCComponent("A", "div", null, null, [child]);
//     const instance = createPCComponentInstance(component1.id);
//     let state = createEditorState(createPCModule([component1, instance]));
//     state = evaluateEditedStateSync(state);
//     expect(state.documents[0].children.length).to.eql(2);
//     const instanceChild = state.documents[0].children[1]
//       .children[0] as SyntheticVisibleNode;
//     expect(instanceChild.name).to.eql("h1");
//     state = persistInspectorNodeStyle(
//       {
//         color: "red"
//       },
//       instanceChild,
//       null,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     const componentChild = newDocument.children[0]
//       .children[0] as SyntheticVisibleNode;
//     expect(componentChild.style).to.eql({});
//     const newInstanceChild = newDocument.children[1]
//       .children[0] as SyntheticVisibleNode;
//     expect(newInstanceChild.style).to.eql({
//       color: "red"
//     });
//   });
//   it("host can be overridden", () => {
//     const child = createPCElement("h1");
//     const component1 = createPCComponent("A", "div", null, null, [child]);
//     const instanceSource = createPCComponentInstance(component1.id);
//     let state = createEditorState(createPCModule([component1, instanceSource]));
//     state = evaluateEditedStateSync(state);
//     expect(state.documents[0].children.length).to.eql(2);
//     const instance = state.documents[0].children[1] as SyntheticVisibleNode;
//     expect(instance.name).to.eql("div");
//     state = persistInspectorNodeStyle(
//       {
//         color: "red"
//       },
//       instance,
//       null,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     const componentChild = newDocument.children[0] as SyntheticVisibleNode;
//     expect(componentChild.style).to.eql({});
//     const newInstanceChild = newDocument.children[1] as SyntheticVisibleNode;
//     expect(newInstanceChild.style).to.eql({
//       color: "red"
//     });
//   });
//   xit("can move a node into nested child", () => {
//     const elementSource = createPCElement("div", {}, {}, [
//       createPCTextNode("some text")
//     ]);
//     const componentSource = createPCComponent("a", null, null, null, [
//       elementSource
//     ]);
//     const instanceSource = createPCComponentInstance(componentSource.id);
//     const childSource = createPCTextNode("some other text");
//     let state = createEditorState(
//       createPCModule([componentSource, instanceSource, childSource])
//     );
//     state = evaluateEditedStateSync(state);
//     expect(state.documents[0].children.length).to.eql(3);
//     const child = state.documents[0].children[2];
//     expect(child.name).to.eql("text");
//     expect(
//       (state.documents[0].children[0].children[0]
//         .children[0] as SyntheticTextNode).value
//     ).to.eql("some text");
//     expect(state.documents[0].children[0].children[0].children.length).to.eql(
//       1
//     );
//     const instance = state.documents[0].children[1];
//     state = persistMoveSyntheticVisibleNode(
//       getSyntheticSourceNode(child, state.graph),
//       getSyntheticSourceNode(
//         instance.children[0] as SyntheticVisibleNode,
//         state.graph
//       ),
//       TreeMoveOffset.APPEND,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children[0].children[0].name).to.eql("div");
//     expect(newDocument.children[0].children[0].children[0].name).to.eql("text");
//     expect(newDocument.children[0].children[0].children.length).to.eql(1);
//     expect(
//       (newDocument.children[0].children[0].children[0] as SyntheticTextNode)
//         .value
//     ).to.eql("some text");
//     expect(
//       (newDocument.children[1].children[0].children[0] as SyntheticTextNode)
//         .value
//     ).to.eql("some other text");
//   });
//   it("can move a node into an instance root", () => {
//     const elementSource = createPCElement("div", {}, {}, [
//       createPCTextNode("some text")
//     ]);
//     const componentSource = createPCComponent("a", null, null, null, [
//       elementSource
//     ]);
//     const instanceSource = createPCComponentInstance(componentSource.id);
//     const childSource = createPCTextNode("some other text");
//     let state = createEditorState(
//       createPCModule([componentSource, instanceSource, childSource])
//     );
//     state = evaluateEditedStateSync(state);
//     expect(state.documents[0].children.length).to.eql(3);
//     const child = state.documents[0].children[2];
//     expect(child.name).to.eql("text");
//     expect(
//       (state.documents[0].children[0].children[0]
//         .children[0] as SyntheticTextNode).value
//     ).to.eql("some text");
//     expect(state.documents[0].children[0].children[0].children.length).to.eql(
//       1
//     );
//     const instance = state.documents[0].children[1];
//     state = persistMoveSyntheticVisibleNode(
//       child,
//       getSyntheticSourceNode(instance as SyntheticVisibleNode, state.graph),
//       TreeMoveOffset.APPEND,
//       state
//     );
//     state = evaluateEditedStateSync(state);
//     const [newDocument] = state.documents;
//     expect(newDocument.children[1].children[0].name).to.eql("text");
//   });
//   it("can define a variant style on a component", () => {
//     const variant = createPCVariant();
//     let component = createPCComponent(null, null, {}, {}, [variant]);
//     let state = createEditorState(createPCModule([component]));
//     state = evaluateEditedStateSync(state);
//     const instance = state.documents[0].children[0];
//     state = persistInspectorNodeStyle(
//       { color: "red" },
//       instance,
//       variant,
//       state
//     );
//     component = getPCNode(component.id, state.graph) as PCComponent;
//     const overrides = getOverrides(component);
//     expect(overrides.length).to.eql(1);
//     const [override] = overrides;
//     expect(override.propertyName).to.eql(PCOverridablePropertyName.STYLE);
//     expect((override as PCStyleOverride).value).to.eql({ color: "red" });
//     expect(override.targetIdPath).to.eql([]);
//   });
//   // it("can override a variant default of a content instance", () => {
//   //   const variant = createPCVariant();
//   //   let component = createPCComponent(null, null, {}, {}, [
//   //     variant,
//   //     createPCOverride(
//   //       [],
//   //       PCOverridablePropertyName.STYLE,
//   //       { color: "red" },
//   //       variant.id
//   //     )
//   //   ]);
//   //   let instance = createPCComponentInstance(component.id);
//   //   let state = createEditorState(createPCModule([component, instance]));
//   //   state = evaluateEditedStateSync(state);
//   //   let sInstance = state.documents[0].children[1] as SyntheticInstanceElement;
//   //   state = persistToggleInstanceVariant(sInstance, variant.id, null, state);
//   //   instance = getPCNode(
//   //     instance.id,
//   //     state.graph
//   //   ) as PCComponentInstanceElement;
//   //   const [override] = getOverrides(instance);
//   //   expect(override.propertyName).to.eql(
//   //     PCOverridablePropertyName.VARIANT_IS_DEFAULT
//   //   );
//   //   expect((override as PCVariantOverride).value).to.eql(true);
//   //   expect(override.targetIdPath).to.eql([variant.id]);
//   //   state = evaluateEditedStateSync(state);
//   //   sInstance = state.documents[0].children[1] as SyntheticInstanceElement;
//   //   expect(sInstance.style).to.eql({ color: "red" });
//   // });
//   // it("can override a variant default of a nested instance", () => {
//   //   const variant = createPCVariant();
//   //   let component = createPCComponent(null, null, {}, {}, [
//   //     variant,
//   //     createPCOverride(
//   //       [],
//   //       PCOverridablePropertyName.STYLE,
//   //       { color: "red" },
//   //       variant.id
//   //     )
//   //   ]);
//   //   let instance = createPCComponentInstance(component.id);
//   //   const div = createPCElement("div", {}, {}, [instance]);
//   //   let state = createEditorState(createPCModule([component, div]));
//   //   state = evaluateEditedStateSync(state);
//   //   let sInstance = state.documents[0].children[1]
//   //     .children[0] as SyntheticInstanceElement;
//   //   state = persistToggleInstanceVariant(sInstance, variant.id, null, state);
//   //   instance = getPCNode(
//   //     instance.id,
//   //     state.graph
//   //   ) as PCComponentInstanceElement;
//   //   const [override] = getOverrides(instance);
//   //   expect(override.propertyName).to.eql(
//   //     PCOverridablePropertyName.VARIANT_IS_DEFAULT
//   //   );
//   //   expect((override as PCVariantOverride).value).to.eql(true);
//   //   expect(override.targetIdPath).to.eql([variant.id]);
//   //   state = evaluateEditedStateSync(state);
//   //   sInstance = state.documents[0].children[1]
//   //     .children[0] as SyntheticInstanceElement;
//   //   expect(sInstance.style).to.eql({ color: "red" });
//   // });
//   describe("clipboard", () => {});
//   describe("variants", () => {});
// });
//# sourceMappingURL=persistence-test.js.map