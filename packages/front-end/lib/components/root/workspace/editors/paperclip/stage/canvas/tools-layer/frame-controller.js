import * as React from "react";
import cx from "classnames";
import { isComponent } from "paperclip";
import { getBoundsSize } from "tandem-common";
import { canvasToolDocumentTitleClicked, frameModeChangeComplete, canvasToolPreviewButtonClicked } from "../../../../../../../../actions";
import { dropdownMenuOptionFromValue } from "../../../../../../../inputs/dropdown/controller";
import { FrameMode } from "../../../../../../../../state";
const MODE_TOGGLE_OPTIONS = [
    FrameMode.PREVIEW,
    FrameMode.DESIGN
].map(dropdownMenuOptionFromValue);
export default (Base) => class FrameController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onTitleClick = (event) => {
            this.props.dispatch(canvasToolDocumentTitleClicked(this.props.frame, event));
        };
        this.onPreviewButtonClick = (event) => {
            this.props.dispatch(canvasToolPreviewButtonClicked(this.props.frame, event));
        };
        this.onModeChangeComplete = (mode) => {
            this.props.dispatch(frameModeChangeComplete(this.props.frame, mode));
        };
    }
    render() {
        const { frame, translate, sourceNode } = this.props;
        const { onTitleClick, onPreviewButtonClick } = this;
        const { width, height } = getBoundsSize(frame.bounds);
        const style = {
            width,
            height,
            left: frame.bounds.left,
            top: frame.bounds.top,
            background: "transparent"
        };
        const hasController = sourceNode &&
            isComponent(sourceNode) &&
            sourceNode.controllers &&
            Boolean(sourceNode.controllers.length);
        const titleScale = Math.max(1 / translate.zoom, 0.03);
        const titleStyle = {
            transform: `translateY(-${22 * titleScale}px) scale(${titleScale})`,
            transformOrigin: "top left",
            whiteSpace: "nowrap",
            // some random height to prevent text from getting cut off
            // when zooming.
            height: 30,
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: width * translate.zoom
        };
        return (React.createElement(Base, { className: "m-frame", variant: cx({ hasController }), style: style, topBarProps: {
                style: titleStyle
            }, titleProps: {
                text: (sourceNode && sourceNode.label) || "Untitled",
                onClick: onTitleClick
            }, controlsProps: {
                className: "controls"
            }, previewButtonProps: {
                onClick: onPreviewButtonClick
            } }));
    }
};
//# sourceMappingURL=frame-controller.js.map