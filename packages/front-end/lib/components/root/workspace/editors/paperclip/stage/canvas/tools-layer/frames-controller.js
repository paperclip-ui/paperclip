import * as React from "react";
import { wrapEventToDispatch } from "../../../../../../../../utils";
import { getFramesByDependencyUri, getSyntheticNodeById, getSyntheticSourceNode } from "paperclip";
import { Frame as FrameComponent } from "./frames-view.pc";
import { canvasToolWindowBackgroundClicked } from "../../../../../../../../actions";
export default (Base) => class FramesController extends React.PureComponent {
    render() {
        const { translate, editorWindow, frames, graph, documents, dispatch } = this.props;
        const backgroundStyle = {
            transform: `translate(${-translate.left /
                translate.zoom}px, ${-translate.top / translate.zoom}px) scale(${1 /
                translate.zoom}) translateZ(0)`,
            transformOrigin: "top left"
        };
        const activeFrames = getFramesByDependencyUri(editorWindow.activeFilePath, frames, documents, graph);
        const frameComponents = activeFrames.map((frame, i) => {
            const contentNode = getSyntheticNodeById(frame.syntheticContentNodeId, documents);
            const sourceNode = getSyntheticSourceNode(contentNode, graph);
            return (React.createElement(FrameComponent, { graph: graph, key: frame.syntheticContentNodeId, sourceNode: sourceNode, frame: frame, contentNode: contentNode, dispatch: dispatch, translate: translate }));
        });
        return (React.createElement(Base, { backgroundProps: {
                style: backgroundStyle,
                onClick: wrapEventToDispatch(dispatch, canvasToolWindowBackgroundClicked)
            }, contentProps: { children: frameComponents } }));
    }
};
//# sourceMappingURL=frames-controller.js.map