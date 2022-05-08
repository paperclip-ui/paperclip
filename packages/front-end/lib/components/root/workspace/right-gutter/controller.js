var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { getPCNodeDependency, getGlobalVariables, getSyntheticNodeStyleColors, getInspectorSyntheticNode, InspectorTreeNodeName, getSyntheticDocumentByDependencyUri, getGlobalMediaQueries, getInspectorNodeSyntheticDocument } from "paperclip";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "tandem-common";
import { RightGutterTab } from "./tab.pc";
import cx from "classnames";
import { getGlobalFileUri, getProjectCWD } from "../../../../state";
const TAB_NAMES = ["style", "properties"];
const INSPECTOR_NODE_TAB_NAMES = ["properties"];
export default (Base) => class RightGutterController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            currentTab: TAB_NAMES[0]
        };
        this.setTab = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { currentTab: value }));
        };
    }
    render() {
        const _a = this.props, { root, dispatch } = _a, rest = __rest(_a, ["root", "dispatch"]);
        const globalFileUri = root.projectInfo && getGlobalFileUri(root.projectInfo);
        const { currentTab } = this.state;
        const { setTab } = this;
        const { fontFamilies, projectInfo, graph, sourceNodeInspector: rootInspectorNode, documents } = root;
        const cwd = getProjectCWD(root);
        const projectOptions = (projectInfo && projectInfo.config && projectInfo.config.options) ||
            EMPTY_OBJECT;
        const globalVariables = getGlobalVariables(graph);
        const globalQueries = getGlobalMediaQueries(graph);
        const selectedInspectorNodes = root.selectedInspectorNodes;
        const hasInspectorNodes = Boolean(selectedInspectorNodes.length);
        const availableTabs = hasInspectorNodes
            ? TAB_NAMES
            : INSPECTOR_NODE_TAB_NAMES;
        const availableCurrentTab = availableTabs.indexOf(currentTab) !== -1
            ? currentTab
            : availableTabs[0];
        const selectedSyntheticNodes = hasInspectorNodes
            ? selectedInspectorNodes
                .map(node => getInspectorSyntheticNode(node, documents))
                .filter(Boolean)
            : EMPTY_ARRAY;
        getSyntheticDocumentByDependencyUri;
        const syntheticDocument = selectedInspectorNodes.length
            ? getInspectorNodeSyntheticDocument(selectedInspectorNodes[0], rootInspectorNode, graph, documents)
            : null;
        const documentColors = (syntheticDocument && getSyntheticNodeStyleColors(syntheticDocument)) ||
            EMPTY_ARRAY;
        const tabs = availableTabs.map((tabName, i) => {
            return (React.createElement(RightGutterTab, { key: tabName, variant: cx({ selected: availableCurrentTab === tabName }), onClick: () => setTab(tabName), labelProps: { text: tabName } }));
        });
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                stylesTab: availableCurrentTab === TAB_NAMES[0],
                propertiesTab: availableCurrentTab === TAB_NAMES[1],
                globalsTab: selectedInspectorNodes.length === 0,
                unselectedNodes: selectedInspectorNodes.length === 0
            }), globalPropertiesProps: {
                dispatch,
                globalFileUri,
                globalVariables,
                fontFamilies,
                globalQueries
            }, stylesProps: {
                cwd,
                projectOptions,
                visible: availableCurrentTab === TAB_NAMES[0],
                documentColors,
                dispatch,
                fontFamilies,
                selectedInspectorNodes,
                rootInspectorNode,
                globalVariables,
                globalQueries,
                selectedVariant: root.selectedVariant,
                graph: graph
            }, tabsProps: {
                children: tabs
            }, propertiesProps: {
                rootInspectorNode,
                visible: availableCurrentTab === TAB_NAMES[1],
                sourceNodeUri: selectedInspectorNodes[0] &&
                    getPCNodeDependency(selectedInspectorNodes[0].name === InspectorTreeNodeName.CONTENT
                        ? selectedInspectorNodes[0]
                            .sourceSlotNodeId
                        : selectedInspectorNodes[0].sourceNodeId, graph).uri,
                dispatch,
                graph: graph,
                selectedNodes: selectedSyntheticNodes,
                selectedInspectorNodes
            } })));
    }
};
//# sourceMappingURL=controller.js.map