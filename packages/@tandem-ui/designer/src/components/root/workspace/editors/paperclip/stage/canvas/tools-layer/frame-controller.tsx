import React, { memo } from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import {
  SyntheticVisibleNode,
  Frame,
  PCNode,
  isComponent,
  PCVisibleNode,
  DependencyGraph,
} from "@paperclip-lang/core";
import { getBoundsSize, Translate } from "tandem-common";
import {
  canvasToolDocumentTitleClicked,
  frameModeChangeComplete,
  canvasToolPreviewButtonClicked,
} from "@tandem-ui/designer/src/actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue,
} from "@tandem-ui/designer/src/components/inputs/dropdown/controller";
import { FrameMode } from "@tandem-ui/designer/src/state";
import { BaseFrameProps } from "./frames-view.pc";
import { useDispatch } from "react-redux";

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
  memo(({ frame, translate, sourceNode }: Props) => {
    const dispatch = useDispatch();
    const onTitleClick = (event: React.MouseEvent<any>) => {
      dispatch(canvasToolDocumentTitleClicked(frame, event));
    };
    const onPreviewButtonClick = (event: React.MouseEvent<any>) => {
      dispatch(canvasToolPreviewButtonClicked(frame, event));
    };

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
  });
