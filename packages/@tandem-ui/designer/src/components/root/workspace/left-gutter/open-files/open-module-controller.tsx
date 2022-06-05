import * as React from "react";
import { InspectorNode } from "@paperclip-lang/core";
import { BaseOpenModuleProps } from "./open-module.pc";
import { NodeLayer } from "./layer.pc";

export type Props = {
  inspectorNode: InspectorNode;
};

export default (Base: React.ComponentClass<BaseOpenModuleProps>) =>
  class OpenModuleController extends React.PureComponent<Props> {
    render() {
      const { inspectorNode, ...rest } = this.props;
      return (
        <Base {...rest}>
          <NodeLayer depth={1} inspectorNode={inspectorNode} />
        </Base>
      );
    }
  };
