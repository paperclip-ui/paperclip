import * as React from "react";
import { BaseEditTextProps } from "./edit-text.pc";
import {
  InspectorNode,
  DependencyGraph,
  getInspectorSourceNode,
  PCSourceTagNames,
  getInspectorSyntheticNode,
  SyntheticDocument,
  PCTextLikeNode,
  isTextLikePCNode,
  getSyntheticVisibleNodeRelativeBounds,
  Frame,
  SyntheticTextNode
} from "paperclip";
import { Dispatch } from "redux";
import { FocusComponent } from "../../../../../../../focus";
import { canvasTextEditChangeComplete } from "../../../../../../../../actions";

export type Props = {
  rootInspectorNode: InspectorNode;
  selectedInspectorNode: InspectorNode;
  selectedSyntheticNode: SyntheticTextNode;
  graph: DependencyGraph;
  frames: Frame[];
  documents: SyntheticDocument[];
  dispatch: Dispatch<any>;
} & BaseEditTextProps;

export default (Base: React.ComponentClass<BaseEditTextProps>) =>
  class EditTextController extends React.PureComponent<Props> {
    onChangeComplete = (value: string) => {
      this.props.dispatch(canvasTextEditChangeComplete(value));
    };
    render() {
      const {
        selectedInspectorNode,
        selectedSyntheticNode,
        frames,
        rootInspectorNode,
        graph,
        documents,
        ...rest
      } = this.props;
      const { onChangeComplete } = this;

      const sourceNode = getInspectorSourceNode(
        selectedInspectorNode,
        rootInspectorNode,
        graph
      ) as PCTextLikeNode;

      if (!sourceNode || !isTextLikePCNode(sourceNode)) {
        return null;
      }
      const syntheticNode = getInspectorSyntheticNode(
        selectedInspectorNode,
        documents
      );

      if (!syntheticNode) {
        return null;
      }
      const bounds = getSyntheticVisibleNodeRelativeBounds(
        syntheticNode,
        frames,
        graph
      );

      const style = {
        left: bounds.left,
        top: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top
      };

      return (
        <FocusComponent>
          <Base
            {...rest}
            style={style}
            value={selectedSyntheticNode.value}
            onChangeComplete={onChangeComplete}
          />
        </FocusComponent>
      );
    }
  };
