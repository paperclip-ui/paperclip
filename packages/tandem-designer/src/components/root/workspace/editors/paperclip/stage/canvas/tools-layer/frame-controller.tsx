import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import {
  SyntheticVisibleNode,
  Frame,
  PCNode,
  isComponent,
  PCComponent,
  PCVisibleNode,
  DependencyGraph,
} from "paperclip";
import { getBoundsSize, Translate } from "tandem-common";
import {
  canvasToolDocumentTitleClicked,
  frameModeChangeComplete,
  canvasToolPreviewButtonClicked,
} from "../../../../../../../../actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue,
} from "../../../../../../../inputs/dropdown/controller";
import { FrameMode } from "../../../../../../../../state";
import { BaseFrameProps } from "./frames-view.pc";

const MODE_TOGGLE_OPTIONS: DropdownMenuOption[] = [
  FrameMode.PREVIEW,
  FrameMode.DESIGN,
].map(dropdownMenuOptionFromValue);

export type Props = {
  dispatch: Dispatch;
  frame: Frame;
  sourceNode: PCNode;
  contentNode: SyntheticVisibleNode;
  translate: Translate;
  graph: DependencyGraph;
};

export default (Base: React.ComponentClass<BaseFrameProps>) =>
  class FrameController extends React.PureComponent<Props> {
    onTitleClick = (event: React.MouseEvent<any>) => {
      this.props.dispatch(
        canvasToolDocumentTitleClicked(this.props.frame, event)
      );
    };
    onPreviewButtonClick = (event: React.MouseEvent<any>) => {
      this.props.dispatch(
        canvasToolPreviewButtonClicked(this.props.frame, event)
      );
    };
    onModeChangeComplete = (mode: FrameMode) => {
      this.props.dispatch(frameModeChangeComplete(this.props.frame, mode));
    };
    render() {
      const { frame, translate, sourceNode } = this.props;

      const { onTitleClick, onPreviewButtonClick } = this;

      const { width, height } = getBoundsSize(frame.bounds);

      const style = {
        width,
        height,
        left: frame.bounds.left,
        top: frame.bounds.top,
        background: "transparent",
      };

      const hasController =
        sourceNode &&
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
        width: width * translate.zoom,
      };

      return (
        <Base
          className="m-frame"
          variant={cx({ hasController })}
          style={style}
          topBarProps={{
            style: titleStyle as any,
          }}
          titleProps={{
            text:
              (sourceNode && (sourceNode as PCVisibleNode).label) || "Untitled",
            onClick: onTitleClick,
          }}
          controlsProps={{
            className: "controls",
          }}
          previewButtonProps={{
            onClick: onPreviewButtonClick,
          }}
          // modeToggleInputProps={{
          //   options: MODE_TOGGLE_OPTIONS,
          //   value: contentNode.metadata.mode || FrameMode.DESIGN,
          //   onChangeComplete: onModeChangeComplete
          // }}
        />
      );
    }
  };
