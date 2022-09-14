import * as React from "react";
import { Dispatch } from "redux";
import { InspectorNode, DependencyGraph } from "@paperclip-lang/core";
import { BaseEditorFooterProps, ElementProps } from "./view.pc";
import { Canvas } from "../../../../../state";

export type Props = {
  canvas?: Canvas;
  graph: DependencyGraph;
  rootInspectorNode: InspectorNode;
  selectedInspectorNode: InspectorNode;
  dispatch: Dispatch<any>;
} & ElementProps;

export default (Base: React.ComponentClass<BaseEditorFooterProps>) =>
  class FooterController extends React.PureComponent<Props> {
    render() {
      const {
        canvas,
        graph,
        rootInspectorNode,
        selectedInspectorNode,
        dispatch,
        ...rest
      } = this.props;
      return (
        <Base
          {...rest}
          zoomPercentageProps={{
            text:
              canvas && `${String(Math.round(canvas.translate.zoom * 100))}%`,
          }}
          breadcrumbs1Props={{
            dispatch,
            graph,
            rootInspectorNode,
            selectedInspectorNode,
          }}
        />
      );
    }
  };
