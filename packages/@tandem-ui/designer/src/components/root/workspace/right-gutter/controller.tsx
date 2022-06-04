import * as React from "react";

import {
  getPCNodeDependency,
  getGlobalVariables,
  getSyntheticNodeStyleColors,
  getInspectorSyntheticNode,
  InspectorTreeNodeName,
  getSyntheticDocumentByDependencyUri,
  InspectorContent,
  getGlobalMediaQueries,
  getInspectorNodeSyntheticDocument,
} from "paperclip";
import { EMPTY_ARRAY, EMPTY_OBJECT, stripProtocol } from "tandem-common";
import { RightGutterTab } from "./tab.pc";
import cx from "classnames";
import { BaseRightGutterProps, ElementProps } from "./view.pc";
import { RootState, getGlobalFileUri, getProjectCWD } from "../../../../state";
import { Dispatch } from "redux";

const TAB_NAMES = ["style", "properties"];
const INSPECTOR_NODE_TAB_NAMES = ["properties"];

export type Props = {
  root: RootState;
  dispatch: Dispatch;
} & ElementProps;

type State = {
  currentTab: string;
};

export default (Base: React.ComponentClass<BaseRightGutterProps>) =>
  class RightGutterController extends React.PureComponent<Props, State> {
    state = {
      currentTab: TAB_NAMES[0],
    };
    setTab = (value: string) => {
      this.setState({ ...this.state, currentTab: value });
    };
    render() {
      const { root, dispatch, ...rest } = this.props;
      const globalFileUri =
        root.projectInfo && getGlobalFileUri(root.projectInfo);
      const { currentTab } = this.state;
      const { setTab } = this;

      const {
        fontFamilies,
        projectInfo,
        graph,
        sourceNodeInspector: rootInspectorNode,
        documents,
      } = root;
      const cwd = getProjectCWD(root);
      const projectOptions =
        (projectInfo && projectInfo.config && projectInfo.config.options) ||
        EMPTY_OBJECT;

      const globalVariables = getGlobalVariables(graph);
      const globalQueries = getGlobalMediaQueries(graph);

      const selectedInspectorNodes = root.selectedInspectorNodes;
      const hasInspectorNodes = Boolean(selectedInspectorNodes.length);
      const availableTabs = hasInspectorNodes
        ? TAB_NAMES
        : INSPECTOR_NODE_TAB_NAMES;
      const availableCurrentTab =
        availableTabs.indexOf(currentTab) !== -1
          ? currentTab
          : availableTabs[0];

      const selectedSyntheticNodes = hasInspectorNodes
        ? selectedInspectorNodes
            .map((node) => getInspectorSyntheticNode(node, documents))
            .filter(Boolean)
        : EMPTY_ARRAY;

      getSyntheticDocumentByDependencyUri;

      const syntheticDocument = selectedInspectorNodes.length
        ? getInspectorNodeSyntheticDocument(
            selectedInspectorNodes[0],
            rootInspectorNode,
            graph,
            documents
          )
        : null;
      const documentColors =
        (syntheticDocument && getSyntheticNodeStyleColors(syntheticDocument)) ||
        EMPTY_ARRAY;

      const tabs = availableTabs.map((tabName, i) => {
        return (
          <RightGutterTab
            key={tabName}
            variant={cx({ selected: availableCurrentTab === tabName })}
            onClick={() => setTab(tabName)}
            labelProps={{ text: tabName }}
          />
        );
      });

      return (
        <Base
          {...rest}
          variant={cx({
            stylesTab: availableCurrentTab === TAB_NAMES[0],
            propertiesTab: availableCurrentTab === TAB_NAMES[1],
            globalsTab: selectedInspectorNodes.length === 0,
            unselectedNodes: selectedInspectorNodes.length === 0,
          })}
          globalPropertiesProps={{
            dispatch,
            globalFileUri,
            globalVariables,
            fontFamilies,
            globalQueries,
          }}
          stylesProps={{
            cwd,
            projectOptions,
            visible: availableCurrentTab === TAB_NAMES[0],
            documentColors,
            dispatch,
            fontFamilies,
            selectedInspectorNodes,
            rootInspectorNode,
            globalVariables,
            globalQueries,
            selectedVariant: root.selectedVariant,
            graph: graph,
          }}
          tabsProps={{
            children: tabs,
          }}
          propertiesProps={{
            rootInspectorNode,
            visible: availableCurrentTab === TAB_NAMES[1],
            sourceNodeUri:
              selectedInspectorNodes[0] &&
              getPCNodeDependency(
                selectedInspectorNodes[0].name === InspectorTreeNodeName.CONTENT
                  ? (selectedInspectorNodes[0] as InspectorContent)
                      .sourceSlotNodeId
                  : selectedInspectorNodes[0].sourceNodeId,
                graph
              ).uri,
            dispatch,
            graph: graph,
            selectedNodes: selectedSyntheticNodes,
            selectedInspectorNodes,
          }}
        />
      );
    }
  };
