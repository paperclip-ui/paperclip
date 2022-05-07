import * as React from "react";
import cx from "classnames";
import { BaseStylesProps, ElementProps } from "./view.pc";
import { Dispatch } from "redux";
import {
  getPCNode,
  PCVariant,
  DependencyGraph,
  PCSourceTagNames,
  InspectorNode,
  PCVariable,
  computeStyleInfo,
  PCQuery,
  getComponentVariantTriggers,
  getInspectorContentNode,
  isComponent,
  getComponentVariants
} from "paperclip";
import { EMPTY_ARRAY } from "tandem-common";
import { FontFamily, ProjectOptions } from "../../../../../state";

export type Props = {
  cwd: string;
  visible: boolean;
  documentColors: string[];
  projectOptions: ProjectOptions;
  dispatch: Dispatch<any>;
  rootInspectorNode: InspectorNode;
  selectedInspectorNodes: InspectorNode[];
  selectedVariant: PCVariant;
  fontFamilies: FontFamily[];
  globalVariables: PCVariable[];
  globalQueries: PCQuery[];
  graph: DependencyGraph;
} & ElementProps;

enum Tab {
  PROPERTIES,
  TRIGGERS
}

export type State = {
  tab: Tab;
};

export default (Base: React.ComponentClass<BaseStylesProps>) =>
  class RightGutterController extends React.PureComponent<Props, State> {
    state = {
      tab: Tab.PROPERTIES
    };
    onTriggersTabClick = () => {
      this.setState({
        tab: Tab.TRIGGERS
      });
    };
    onPropertiesTabClick = () => {
      this.setState({
        tab: Tab.PROPERTIES
      });
    };
    render() {
      const {
        cwd,
        visible,
        globalVariables,
        dispatch,
        selectedVariant,
        fontFamilies,
        graph,
        projectOptions,
        globalQueries,
        selectedInspectorNodes,
        rootInspectorNode,
        documentColors,
        ...rest
      } = this.props;
      const { onTriggersTabClick, onPropertiesTabClick } = this;
      const { tab } = this.state;
      if (!selectedInspectorNodes.length || !visible) {
        return null;
      }

      const sourceNode = getPCNode(
        selectedInspectorNodes[0].sourceNodeId,
        graph
      );

      if (!sourceNode || sourceNode.name === PCSourceTagNames.MODULE) {
        return null;
      }

      const computedStyleInfo = computeStyleInfo(
        selectedInspectorNodes[0],
        rootInspectorNode,
        selectedVariant,
        graph
      );

      const contentNode = getInspectorContentNode(
        selectedInspectorNodes[0],
        rootInspectorNode
      );

      const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
      const variantTriggers =
        contentSourceNode.name === PCSourceTagNames.COMPONENT
          ? getComponentVariantTriggers(contentSourceNode)
          : EMPTY_ARRAY;
      const variants =
        contentSourceNode.name === PCSourceTagNames.COMPONENT
          ? getComponentVariants(contentSourceNode)
          : EMPTY_ARRAY;

      const showPropertiesTab = Boolean(
        contentSourceNode && isComponent(contentSourceNode)
      );

      return (
        <Base
          {...rest}
          variant={cx({
            propertiesTab: tab === Tab.PROPERTIES || !showPropertiesTab,
            triggersTab: tab === Tab.TRIGGERS && showPropertiesTab,
            showPropertiesTab
          })}
          behaviorProps={{
            dispatch,
            variants,
            variantTriggers,
            globalQueries
          }}
          propertiesTabButtonProps={{
            onClick: onPropertiesTabClick,
            title: "Styles"
          }}
          triggersTabButtonProps={{
            onClick: onTriggersTabClick,
            title: "Triggers"
          }}
          propertiesProps={{
            cwd,
            projectOptions,
            globalVariables,
            selectedVariant,
            dispatch,
            documentColors,
            computedStyleInfo,
            selectedInspectorNodes,
            rootInspectorNode,
            graph,
            fontFamilies
          }}
          styleSwitcherProps={{
            dispatch,
            rootInspectorNode,
            selectedInspectorNodes,
            graph,
            selectedVariant
          }}
        />
      );
    }
  };
