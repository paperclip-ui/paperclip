import * as React from "react";
import * as path from "path";
import * as cx from "classnames";
import {
  toolbarToolClicked,
  editorTabClicked,
  editorTabCloseButtonClicked,
  editorTabRightClicked
} from "../../../../../actions";
import { ToolType, EditorWindow } from "../../../../../state";
import { Dispatch } from "redux";
import { BaseToolbarProps } from "./view.pc";
import { EditorTab } from "./tab.pc";
import { DependencyGraph } from "paperclip";

export type Props = {
  editorWindow: EditorWindow;
  dispatch: Dispatch<any>;
  selectedComponentId: string;
  selectedTool: ToolType;
  active: boolean;
  graph: DependencyGraph;
};

export default (Base: React.ComponentClass<BaseToolbarProps>) =>
  class ToolbarController extends React.PureComponent<Props> {
    onTabClick = (event, uri) => {
      this.props.dispatch(editorTabClicked(event, uri));
    };
    onTabCloseButtonClick = (uri, event) => {
      this.props.dispatch(editorTabCloseButtonClicked(event, uri));
      event.stopPropagation();
    };
    onPointerClick = () => {
      this.props.dispatch(toolbarToolClicked(ToolType.POINTER));
    };
    onTextClick = () => {
      this.props.dispatch(toolbarToolClicked(ToolType.TEXT));
    };
    onComponentClick = () => {
      this.props.dispatch(toolbarToolClicked(ToolType.COMPONENT));
    };
    onElementClick = () => {
      this.props.dispatch(toolbarToolClicked(ToolType.ELEMENT));
    };

    onRightClickEditorTab = (event, uri) => {
      this.props.dispatch(editorTabRightClicked(event, uri));
    };

    onComponentPopdownClose = () => {
      // HACK to change tool type
      this.props.dispatch(toolbarToolClicked(ToolType.POINTER));
    };

    render() {
      const {
        dispatch,
        graph,
        editorWindow,
        selectedTool,
        active,
        selectedComponentId
      } = this.props;
      const {
        onTabCloseButtonClick,
        onTabClick,
        onPointerClick,
        onTextClick,
        onComponentPopdownClose,
        onComponentClick,
        onElementClick,
        onRightClickEditorTab
      } = this;

      const tabs = editorWindow.tabUris.map(uri => {
        return (
          <EditorTab
            variant={cx({ selected: editorWindow.activeFilePath === uri })}
            xButtonProps={{
              onClick: event => onTabCloseButtonClick(uri, event)
            }}
            labelProps={{
              text: path.basename(uri)
            }}
            key={uri}
            onClick={event => onTabClick(event, uri)}
            onContextMenu={event => onRightClickEditorTab(event, uri)}
          />
        );
      });

      return (
        <Base
          className="m-toolbar"
          variant={cx({
            active
          })}
          pointerProps={{
            onClick: onPointerClick,
            variant: cx({
              selected:
                selectedTool === ToolType.POINTER || selectedTool == null
            })
          }}
          textProps={{
            onClick: onTextClick,
            variant: cx({
              selected: selectedTool === ToolType.TEXT
            })
          }}
          componentProps={{
            centered: true,
            open:
              selectedTool === ToolType.COMPONENT &&
              !selectedComponentId &&
              active,
            onShouldClose: onComponentPopdownClose
          }}
          componentIconProps={{
            onClick: onComponentClick,
            variant: cx({
              selected: selectedTool === ToolType.COMPONENT
            })
          }}
          componentPopdownPickerProps={{
            graph,
            dispatch
          }}
          elementProps={{
            onClick: onElementClick,
            variant: cx({
              selected: selectedTool === ToolType.ELEMENT
            })
          }}
          tabsProps={{
            children: tabs
          }}
        />
      );
    }
  };
