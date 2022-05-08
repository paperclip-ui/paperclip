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
import { startDOMDrag } from "tandem-common";
const MIN_WIDTH = 200;
export default (Base) => class LeftGutterController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            width: 250
        };
        this.setDragger = (dragger) => {
            this._dragger = dragger;
        };
        this.onDraggerMouseDown = (event) => {
            const initialWidth = this.state.width;
            startDOMDrag(event, () => { }, (event, data) => {
                this.setState({ width: Math.max(MIN_WIDTH, event.clientX) });
            });
        };
    }
    render() {
        const _a = this.props, { graph, newFSItemInfo, activeEditorUri, selectedInspectorNodes, hoveringInspectorNodes, selectedFileNodeIds, sourceNodeInspector, renameInspectorNodeId, dispatch, documents, editingFileNameUri, rootDirectory, show } = _a, rest = __rest(_a, ["graph", "newFSItemInfo", "activeEditorUri", "selectedInspectorNodes", "hoveringInspectorNodes", "selectedFileNodeIds", "sourceNodeInspector", "renameInspectorNodeId", "dispatch", "documents", "editingFileNameUri", "rootDirectory", "show"]);
        const { setDragger, onDraggerMouseDown } = this;
        if (show === false) {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { style: {
                width: this.state.width
            }, openModulesPaneProps: {
                graph,
                selectedInspectorNodes,
                hoveringInspectorNodes,
                renameInspectorNodeId,
                sourceNodeInspector,
                dispatch,
                documents
            }, fileNavigatorPaneProps: {
                newFSItemInfo,
                editingFileNameUri,
                activeEditorUri,
                rootDirectory,
                dispatch,
                selectedFileNodeIds
            }, draggerProps: {
                ref: setDragger,
                onMouseDown: onDraggerMouseDown
            } })));
    }
};
//# sourceMappingURL=controller.js.map