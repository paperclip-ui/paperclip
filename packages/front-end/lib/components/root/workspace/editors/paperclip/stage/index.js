import "./index.scss";
import * as React from "react";
import { CanvasComponent } from "./canvas";
export class StageComponent extends React.PureComponent {
    render() {
        const { toolType, openFiles, editorWindow, dependency, dispatch, frames, editMode, sourceNodeInspector, selectedInspectorNodes, hoveringInspectorNodes, activeFilePath, selectedComponentId, graph, documents } = this.props;
        return (React.createElement("div", { className: "m-stage" },
            React.createElement(CanvasComponent, { activeFilePath: activeFilePath, selectedComponentId: selectedComponentId, frames: frames, editMode: editMode, toolType: toolType, openFiles: openFiles, sourceNodeInspector: sourceNodeInspector, hoveringInspectorNodes: hoveringInspectorNodes, selectedInspectorNodes: selectedInspectorNodes, graph: graph, documents: documents, dependency: dependency, dispatch: dispatch, editorWindow: editorWindow })));
    }
}
//# sourceMappingURL=index.js.map