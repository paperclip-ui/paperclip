import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { EMPTY_OBJECT } from "tandem-common";
import { InheritItem } from "./inherit-item.pc";
import {
  getSyntheticSourceNode,
  DependencyGraph,
  getPCNode,
  SyntheticElement,
  PCVisibleNode,
  getAllStyleMixins,
  PCSourceTagNames,
  PCComponent,
  PCStyleMixin,
  isElementLikePCNode,
  getNativeComponentName,
  InspectorNode,
} from "@paperclip-lang/core";
import {
  inheritPaneAddButtonClick,
  inheritPaneRemoveButtonClick,
} from "../../../../../../../actions";
import { BaseInheritProps } from "./inherit.pc";
import { ProjectOptions } from "../../../../../../../state";

export type Props = {
  dispatch: Dispatch<any>;
  selectedInspectorNodes: InspectorNode[];
  graph: DependencyGraph;
  projectOptions: ProjectOptions;
};

type State = {
  selectedStyleMixinId: string;
  selectedInspectorNodes: InspectorNode[];
};

export default (Base: React.ComponentClass<BaseInheritProps>) => {
  return class InheritController extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = {
        selectedStyleMixinId: null,
        selectedInspectorNodes: props.selectedInspectorNodes,
      };
    }
    static getDerivedStateFromProps(props: Props, state: State) {
      if (props.selectedInspectorNodes !== state.selectedInspectorNodes) {
        return {
          selectedStyleMixinId: null,
          selectedInspectorNodes: props.selectedInspectorNodes,
        };
      }

      return null;
    }
    onAddButtonClick = () => {
      this.props.dispatch(inheritPaneAddButtonClick());
    };
    onRemoveButtonClick = () => {
      this.props.dispatch(
        inheritPaneRemoveButtonClick(this.state.selectedStyleMixinId)
      );
      this.setState({ selectedStyleMixinId: null });
    };
    onInheritItemClick = (styleMixinId: string) => {
      this.setState({
        selectedStyleMixinId:
          this.state.selectedStyleMixinId === styleMixinId
            ? null
            : styleMixinId,
      });
    };
    render() {
      const { onAddButtonClick, onRemoveButtonClick, onInheritItemClick } =
        this;
      const { selectedStyleMixinId, selectedInspectorNodes } = this.state;
      const { dispatch, graph, projectOptions } = this.props;
      const node = selectedInspectorNodes[0];
      const sourceNode = getPCNode(node.sourceNodeId, graph) as
        | PCVisibleNode
        | PCComponent
        | PCStyleMixin;

      const hasItemSelected = Boolean(selectedStyleMixinId);

      const allStyleMixins = getAllStyleMixins(
        graph,
        projectOptions.allowCascadeFonts === false
          ? isElementLikePCNode(sourceNode)
            ? getNativeComponentName(sourceNode, graph) === "input"
              ? null
              : PCSourceTagNames.ELEMENT
            : PCSourceTagNames.TEXT
          : null
      );

      const items = Object.keys(sourceNode.styleMixins || EMPTY_OBJECT)
        .filter((k) => Boolean(sourceNode.styleMixins[k]))
        .sort((a, b) => {
          return sourceNode.styleMixins[a].priority >
            sourceNode.styleMixins[b].priority
            ? -1
            : 1;
        })
        .map((styleMixinId, i) => {
          return (
            <InheritItem
              dropdownProps={null}
              alt={Boolean(i % 2)}
              key={styleMixinId}
              onClick={onInheritItemClick as any}
              selected={selectedStyleMixinId === styleMixinId}
              styleMixinId={styleMixinId}
              styleMixin={getPCNode(styleMixinId, graph) as PCStyleMixin}
              allStyleMixins={allStyleMixins}
              dispatch={dispatch}
            />
          );
        });

      return (
        <Base
          variant={cx({ hasItemSelected })}
          addButtonProps={{ onClick: onAddButtonClick }}
          removeButtonProps={{ onClick: onRemoveButtonClick }}
          items={items}
        />
      );
    }
  };
};
