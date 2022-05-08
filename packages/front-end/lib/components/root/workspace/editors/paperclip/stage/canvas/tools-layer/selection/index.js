import "./index.scss";
import * as React from "react";
import { Resizer } from "./resizer";
import { getBoundedSelection, getSelectionBounds } from "../../../../../../../../../state";
const SelectionBounds = ({ zoom, selectedInspectorNodes, graph, frames, documents }) => {
    const entireBounds = getSelectionBounds(selectedInspectorNodes, documents, frames, graph);
    const borderWidth = 1 / zoom;
    const boundsStyle = {
        position: "absolute",
        top: entireBounds.top,
        left: entireBounds.left,
        // round bounds so that they match up with the NWSE resizer
        width: entireBounds.right - entireBounds.left,
        height: entireBounds.bottom - entireBounds.top,
        boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`
    };
    return React.createElement("div", { style: boundsStyle });
};
export class SelectionCanvasTool extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onDoubleClick = (event) => {
            const { dispatch, selectedInspectorNodes, documents, frames, graph } = this.props;
            const selection = getBoundedSelection(selectedInspectorNodes, documents, frames, graph);
            if (selection.length === 1) {
                // dispatch(selectorDoubleClicked(selection[0], event));
            }
        };
    }
    render() {
        const { canvas, editorWindow, selectedInspectorNodes, documents, frames, graph, rootInspectorNode, dispatch, document, zoom } = this.props;
        const { onDoubleClick } = this;
        const selection = getBoundedSelection(selectedInspectorNodes, documents, frames, graph);
        if (!selection.length || editorWindow.secondarySelection)
            return null;
        return (React.createElement("div", { className: "m-stage-selection-tool", onDoubleClick: onDoubleClick },
            React.createElement(SelectionBounds, { frames: frames, documents: documents, selectedInspectorNodes: selectedInspectorNodes, graph: graph, zoom: zoom, document: document }),
            React.createElement(Resizer, { frames: frames, documents: documents, graph: graph, rootInspectorNode: rootInspectorNode, selectedInspectorNodes: selectedInspectorNodes, editorWindow: editorWindow, canvas: canvas, dispatch: dispatch, zoom: zoom })));
    }
}
export * from "./resizer";
//# sourceMappingURL=index.js.map