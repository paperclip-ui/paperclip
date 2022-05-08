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
import { FileNavigatorLayer, NewFileInput } from "./view.pc";
import { memoize, FSItemTagNames, EMPTY_ARRAY } from "tandem-common";
import { FileNavigatorContext } from "./contexts";
import { fileNavigatorNewFileEntered, fileNavigatorNewFileClicked } from "../../../../../actions";
import { AddFileType } from "../../../../../state";
const generateFileNavigatorContext = memoize((newFileInfo, selectedFileNodeIds, onNewFileChangeComplete, onNewFileInputChange, onNewFileEscape, activeEditorUri, editingFileNameUri, dispatch) => ({
    newFileInfo,
    selectedFileNodeIds,
    onNewFileChangeComplete,
    onNewFileInputChange,
    onNewFileEscape,
    dispatch,
    activeEditorUri,
    editingFileNameUri
}));
const ADD_FILE_OPTIONS = [
    {
        label: "Directory",
        value: AddFileType.DIRECTORY
    },
    {
        label: "Blank file",
        value: AddFileType.BLANK
    },
    {
        label: "Component file",
        value: AddFileType.COMPONENT
    }
];
export default (Base) => class FileNavigatorController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onAddFolderButtonClick = () => {
            this.props.dispatch(fileNavigatorNewFileClicked(AddFileType.DIRECTORY));
        };
        this.onFileDropdownComplete = (value) => {
            this.props.dispatch(fileNavigatorNewFileClicked(value));
        };
        this.onNewFileInputChange = (value) => { };
        this.onNewFileChangeComplete = (name) => {
            if (!name) {
                return this.onNewFileEscape();
            }
            const { newFSItemInfo } = this.props;
            if (newFSItemInfo.fileType === AddFileType.COMPONENT &&
                !/\.pc$/.test(name)) {
                name += ".pc";
            }
            this.props.dispatch(fileNavigatorNewFileEntered(name, newFSItemInfo.fileType === AddFileType.DIRECTORY
                ? FSItemTagNames.DIRECTORY
                : FSItemTagNames.FILE, newFSItemInfo.directory.id));
        };
        this.onNewFileEscape = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { newFSItemInfo: null }));
        };
    }
    render() {
        const _a = this.props, { dispatch, newFSItemInfo, rootDirectory, selectedFileNodeIds, activeEditorUri, editingFileNameUri } = _a, rest = __rest(_a, ["dispatch", "newFSItemInfo", "rootDirectory", "selectedFileNodeIds", "activeEditorUri", "editingFileNameUri"]);
        if (!rootDirectory) {
            return React.createElement(Base, { content: EMPTY_ARRAY, addFileDropdownProps: null });
        }
        const { onNewFileChangeComplete, onFileDropdownComplete, onNewFileInputChange, onNewFileEscape } = this;
        const content = rootDirectory.children.map(child => {
            return React.createElement(FileNavigatorLayer, { key: child.id, item: child });
        });
        if (newFSItemInfo && rootDirectory.uri === newFSItemInfo.directory.uri) {
            content.unshift(React.createElement(NewFileInput, { key: "new-file-input", onChangeComplete: onNewFileChangeComplete, onChange: onNewFileInputChange, onEscape: onNewFileEscape }));
        }
        return (React.createElement(FileNavigatorContext.Provider, { value: generateFileNavigatorContext(newFSItemInfo, selectedFileNodeIds, onNewFileChangeComplete, onNewFileInputChange, onNewFileEscape, activeEditorUri, editingFileNameUri, dispatch) },
            React.createElement(Base, Object.assign({}, rest, { content: content, addFileDropdownProps: {
                    onChangeComplete: onFileDropdownComplete,
                    options: ADD_FILE_OPTIONS
                } }))));
    }
};
//# sourceMappingURL=controller.js.map