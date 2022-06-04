import * as React from "react";
import { BaseExportsPaneProps } from "./view.pc";
import {
  InspectorNode,
  inspectorNodeInShadow,
  getInspectorContentNode,
  InspectorTreeNodeName,
} from "paperclip";
import { Dispatch } from "redux";
import { exportNameChanged } from "../../../../../actions";

export type Props = {
  selectedInspectorNode: InspectorNode;
  rootInspectorNode: InspectorNode;
  dispatch: Dispatch<any>;
};

// ^[a-zA-Z_$][\w_$]*$

export default (Base: React.ComponentClass<BaseExportsPaneProps>) =>
  class ExportsController extends React.PureComponent<Props> {
    onNameChangeComplete = (value) => {
      this.props.dispatch(exportNameChanged(value));
    };

    render() {
      const { selectedInspectorNode, rootInspectorNode, ...rest } = this.props;
      const { onNameChangeComplete } = this;
      const contentInspectorNode =
        getInspectorContentNode(selectedInspectorNode, rootInspectorNode) ||
        selectedInspectorNode;

      if (
        inspectorNodeInShadow(selectedInspectorNode, contentInspectorNode) ||
        selectedInspectorNode.name === InspectorTreeNodeName.SHADOW
      ) {
        return null;
      }

      return (
        <Base
          {...rest}
          exportsNameInputProps={{
            value: null,
            onChangeComplete: onNameChangeComplete,

            // this is technically valid, but hard to communicate to user
            // validRegexp: /^[a-zA-Z_$][\w_$]*$/,
            validRegexp: /^[a-zA-Z_]+$/,

            // simplified messaging
            errorMessage: "Name must contain only letters or _",
          }}
        />
      );
    }
  };
