var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as path from "path";
import cx from "classnames";
import { compose } from "recompose";
import { NewFileInput, FileNavigatorLayerContainer } from "./view.pc";
import scrollIntoView from "scroll-into-view-if-needed";
import { FSItemTagNames, TreeMoveOffset } from "tandem-common";
import { fileNavigatorItemClicked, fileNavigatorToggleDirectoryClicked, fileNavigatorBasenameChanged, fileNavigatorDroppedItem, fileItemRightClicked, fileNavigatorItemDoubleClicked, fileNavigatorItemBlurred } from "../../../../../actions";
import { withFileNavigatorContext } from "./contexts";
import { DragSource, DropTarget } from "react-dnd";
import { FocusComponent } from "../../../../focus";
const LAYER_PADDING = 16;
const ROOT_STYLE = {
    display: "inline-block",
    minWidth: "100%"
};
export default (Base) => {
    const FileNavigatorLayer = compose(withFileNavigatorContext((props, { selectedFileNodeIds, dispatch, newFileInfo, onNewFileChangeComplete, onNewFileInputChange, onNewFileEscape, activeEditorUri, editingFileNameUri }) => {
        return {
            selected: selectedFileNodeIds.indexOf(props.item.id) !== -1,
            dispatch,
            newFileInfo,
            active: activeEditorUri === props.item.uri,
            editingBasename: editingFileNameUri === props.item.uri,
            onNewFileChangeComplete,
            onNewFileInputChange,
            onNewFileEscape: onNewFileEscape
        };
    }), DragSource("FILE", {
        beginDrag({ item }) {
            return item;
        },
        canDrag() {
            return true;
        }
    }, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })), DropTarget("FILE", {
        canDrop: ({ item }, monitor) => {
            return (item.name === FSItemTagNames.DIRECTORY &&
                monitor.isOver({ shallow: true }));
        },
        drop: ({ dispatch, item: directory }, monitor) => {
            const droppedItem = monitor.getItem();
            dispatch(fileNavigatorDroppedItem(droppedItem, directory, TreeMoveOffset.PREPEND));
        }
    }, (connect, monitor) => {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop()
        };
    }), (Base) => {
        return class FileNavigatorLayerController extends React.PureComponent {
            constructor() {
                super(...arguments);
                this.onClick = (event) => {
                    this.props.dispatch(fileNavigatorItemClicked(this.props.item));
                };
                this.onContextMenu = (event) => {
                    this.props.dispatch(fileItemRightClicked(this.props.item, event));
                };
                this.onDoubleClick = () => {
                    this.props.dispatch(fileNavigatorItemDoubleClicked(this.props.item));
                };
                this.onArrowClick = (event) => {
                    this.props.dispatch(fileNavigatorToggleDirectoryClicked(this.props.item));
                    event.stopPropagation();
                };
                this.onBasenameInputKeyDown = (event) => {
                    if (event.key === "Enter") {
                        this.props.dispatch(fileNavigatorBasenameChanged(event.target.value, this.props.item));
                    }
                };
                this.onBasenameInputBlur = (eent) => {
                    this.props.dispatch(fileNavigatorItemBlurred(this.props.item));
                };
            }
            componentDidUpdate(prevProps) {
                this.makeVisible(this.props.active && !prevProps.active);
            }
            componentDidMount() {
                this.makeVisible(this.props.active);
            }
            makeVisible(active) {
                if (active) {
                    const self = ReactDOM.findDOMNode(this);
                    setTimeout(() => {
                        const label = self.children[0].children[0].children[0].children[1]
                            .children[0];
                        // icky, but we're picking the label here
                        scrollIntoView(label, {
                            scrollMode: "if-needed"
                        });
                    }, 10);
                }
            }
            render() {
                let _a = this.props, { item, depth = 1, dispatch, selected, isDragging, isOver, connectDragSource, connectDropTarget, canDrop, active, newFileInfo, onNewFileInputChange, onNewFileChangeComplete, editingBasename, draggingOver, onNewFileEscape } = _a, rest = __rest(_a, ["item", "depth", "dispatch", "selected", "isDragging", "isOver", "connectDragSource", "connectDropTarget", "canDrop", "active", "newFileInfo", "onNewFileInputChange", "onNewFileChangeComplete", "editingBasename", "draggingOver", "onNewFileEscape"]);
                const { onClick, onContextMenu, onArrowClick, onBasenameInputKeyDown, onBasenameInputBlur, onDoubleClick } = this;
                const { expanded } = item;
                let children;
                draggingOver = draggingOver || (isOver && canDrop);
                if (expanded) {
                    children = item.children.map(child => {
                        return (React.createElement(FileNavigatorLayer, { key: child.id, item: child, depth: depth + 1, draggingOver: draggingOver }));
                    });
                }
                let newFileInput;
                if (newFileInfo && item.uri == newFileInfo.directory.uri) {
                    newFileInput = (React.createElement(NewFileInput, { onChangeComplete: onNewFileChangeComplete, onChange: onNewFileInputChange, onEscape: onNewFileEscape }));
                }
                const basename = path.basename(item.uri);
                let div = (React.createElement("div", { style: ROOT_STYLE },
                    React.createElement(FileNavigatorLayerContainer, { variant: cx({
                            hovering: draggingOver
                        }) },
                        React.createElement(FocusComponent, { focus: editingBasename }, connectDragSource(React.createElement("div", null,
                            React.createElement(Base, Object.assign({}, rest, { style: {
                                    paddingLeft: LAYER_PADDING * depth
                                }, onDoubleClick: onDoubleClick, onClick: onClick, onContextMenu: onContextMenu, labelInputProps: {
                                    defaultValue: basename,
                                    onKeyDown: onBasenameInputKeyDown,
                                    onBlur: onBasenameInputBlur
                                }, arrowProps: { onClick: onArrowClick }, variant: cx({
                                    active: active && !selected,
                                    folder: item.name === FSItemTagNames.DIRECTORY,
                                    file: item.name === FSItemTagNames.FILE,
                                    alt: item.alt && !draggingOver && !selected,
                                    editing: editingBasename,
                                    expanded,
                                    selected: selected && !draggingOver,
                                    blur: Boolean(newFileInfo && newFileInfo.directory)
                                }), label: editingBasename ? "" : basename }))))),
                        newFileInput,
                        children)));
                if (item.name === FSItemTagNames.DIRECTORY) {
                    div = connectDropTarget(div);
                }
                return div;
            }
        };
    })(Base);
    return FileNavigatorLayer;
};
//# sourceMappingURL=layer-controller.js.map