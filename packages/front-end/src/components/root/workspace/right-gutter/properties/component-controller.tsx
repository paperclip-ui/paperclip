import * as React from "react";
import cx from "classnames";
import { ControllerItem } from "./controller-item.pc";
import {
  PCComponent,
  getSyntheticSourceNode,
  PCSourceTagNames,
  SyntheticElement,
  DependencyGraph
} from "paperclip";
import { EMPTY_ARRAY, stripProtocol } from "tandem-common";
import {
  addComponentControllerButtonClicked,
  removeComponentControllerButtonClicked
} from "../../../../../actions";
import {
  BaseComponentPropertiesProps,
  BaseControllersPaneProps
} from "./view.pc";
import { Dispatch } from "redux";

export type Props = {
  selectedNodes: SyntheticElement[];
  graph: DependencyGraph;
  dispatch: Dispatch;
  sourceNodeUri: string;
} & BaseComponentPropertiesProps;

type State = {
  selectedControllerRelativePath: string;
};

export default (Base: React.ComponentClass<BaseControllersPaneProps>) => {
  return class ComponentController extends React.PureComponent<Props, State> {
    constructor(props) {
      super(props);
      this.state = { selectedControllerRelativePath: null };
    }
    onItemClick = relativePath => {
      this.setState({
        selectedControllerRelativePath:
          this.state.selectedControllerRelativePath === relativePath
            ? null
            : relativePath
      });
    };
    onRemoveControllerClick = () => {
      this.props.dispatch(
        removeComponentControllerButtonClicked(
          this.state.selectedControllerRelativePath
        )
      );
    };
    onAddControllerClick = () => {
      this.props.dispatch(
        addComponentControllerButtonClicked(
          stripProtocol(this.props.sourceNodeUri)
        )
      );
    };
    render() {
      const {
        onRemoveControllerClick,
        onAddControllerClick,
        onItemClick
      } = this;
      const { selectedControllerRelativePath } = this.state;
      const {
        selectedNodes,
        graph,
        dispatch,
        sourceNodeUri,
        ...rest
      } = this.props;

      if (!graph) {
        return null;
      }
      if (!selectedNodes.length) {
        return null;
      }

      const sourceNode = getSyntheticSourceNode(
        selectedNodes[0],
        graph
      ) as PCComponent;

      if (sourceNode.name !== PCSourceTagNames.COMPONENT) {
        return null;
      }

      const hasControllerSelected =
        (sourceNode.controllers || EMPTY_ARRAY).indexOf(
          selectedControllerRelativePath
        ) !== -1;

      const controllers = (sourceNode.controllers || EMPTY_ARRAY).map(
        (relativePath, i) => {
          return (
            <ControllerItem
              onClick={onItemClick}
              key={relativePath}
              dispatch={dispatch}
              selected={selectedControllerRelativePath === relativePath}
              relativePath={relativePath}
            />
          );
        }
      );
      return (
        <Base
          {...rest}
          variant={cx({ hasControllerSelected })}
          removeControllerButtonProps={{ onClick: onRemoveControllerClick }}
          addControllerButtonProps={{ onClick: onAddControllerClick }}
          content={controllers}
        />
      );
    }
  };
};
