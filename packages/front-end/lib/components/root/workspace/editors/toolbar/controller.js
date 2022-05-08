import * as React from "react";
import * as path from "path";
import cx from "classnames";
import { toolbarToolClicked, editorTabClicked, editorTabCloseButtonClicked, editorTabRightClicked } from "../../../../../actions";
import { ToolType } from "../../../../../state";
import { EditorTab } from "./tab.pc";
export default (Base) => class ToolbarController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onTabClick = (event, uri) => {
            this.props.dispatch(editorTabClicked(event, uri));
        };
        this.onTabCloseButtonClick = (uri, event) => {
            this.props.dispatch(editorTabCloseButtonClicked(event, uri));
            event.stopPropagation();
        };
        this.onPointerClick = () => {
            this.props.dispatch(toolbarToolClicked(ToolType.POINTER));
        };
        this.onTextClick = () => {
            this.props.dispatch(toolbarToolClicked(ToolType.TEXT));
        };
        this.onComponentClick = () => {
            this.props.dispatch(toolbarToolClicked(ToolType.COMPONENT));
        };
        this.onElementClick = () => {
            this.props.dispatch(toolbarToolClicked(ToolType.ELEMENT));
        };
        this.onRightClickEditorTab = (event, uri) => {
            this.props.dispatch(editorTabRightClicked(event, uri));
        };
        this.onComponentPopdownClose = () => {
            // HACK to change tool type
            this.props.dispatch(toolbarToolClicked(ToolType.POINTER));
        };
    }
    render() {
        const { dispatch, graph, editorWindow, selectedTool, active, selectedComponentId } = this.props;
        const { onTabCloseButtonClick, onTabClick, onPointerClick, onTextClick, onComponentPopdownClose, onComponentClick, onElementClick, onRightClickEditorTab } = this;
        const tabs = editorWindow.tabUris.map(uri => {
            return (React.createElement(EditorTab, { variant: cx({ selected: editorWindow.activeFilePath === uri }), xButtonProps: {
                    onClick: event => onTabCloseButtonClick(uri, event)
                }, labelProps: {
                    text: path.basename(uri)
                }, key: uri, onClick: event => onTabClick(event, uri), onContextMenu: event => onRightClickEditorTab(event, uri) }));
        });
        return (React.createElement(Base, { className: "m-toolbar", variant: cx({
                active
            }), pointerProps: {
                onClick: onPointerClick,
                variant: cx({
                    selected: selectedTool === ToolType.POINTER || selectedTool == null
                })
            }, textProps: {
                onClick: onTextClick,
                variant: cx({
                    selected: selectedTool === ToolType.TEXT
                })
            }, componentProps: {
                centered: true,
                open: selectedTool === ToolType.COMPONENT &&
                    !selectedComponentId &&
                    active,
                onShouldClose: onComponentPopdownClose
            }, componentIconProps: {
                onClick: onComponentClick,
                variant: cx({
                    selected: selectedTool === ToolType.COMPONENT
                })
            }, componentPopdownPickerProps: {
                graph,
                dispatch
            }, elementProps: {
                onClick: onElementClick,
                variant: cx({
                    selected: selectedTool === ToolType.ELEMENT
                })
            }, tabsProps: {
                children: tabs
            } }));
    }
};
//# sourceMappingURL=controller.js.map