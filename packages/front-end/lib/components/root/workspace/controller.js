import * as React from "react";
const { Modal: ComponentPickerModal } = require("../../component-picker/modal.pc");
const { Modal: QuickSearchModal } = require("../../quick-search/view.pc");
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { WorkspacePrompt } from "./view.pc";
import { mapStateToProps as mapStatetoPromptControllerProps } from "./prompt-controller";
import { ConfigureBuildModal } from "../../configure-build/view.pc";
const WORKSPACE_STYLE = {
    width: "100%",
    height: "100%"
};
export default (Base) => DragDropContext(HTML5Backend)(class WorkspaceController extends React.PureComponent {
    render() {
        const { root, dispatch } = this.props;
        const { graph, activeEditorFilePath: activeEditorUri, selectedInspectorNodes, hoveringInspectorNodes, addNewFileInfo, selectedFileNodeIds, projectInfo, showConfigureBuildModal, sourceNodeInspector, documents, projectDirectory, renameInspectorNodeId } = root;
        const workspaceProps = mapStatetoPromptControllerProps(root);
        return (React.createElement("div", { style: WORKSPACE_STYLE },
            React.createElement(Base, { leftGutterProps: {
                    newFSItemInfo: addNewFileInfo,
                    activeEditorUri,
                    renameInspectorNodeId,
                    editingFileNameUri: root.editingBasenameUri,
                    show: root.showSidebar,
                    selectedFileNodeIds,
                    graph,
                    hoveringInspectorNodes,
                    selectedInspectorNodes,
                    sourceNodeInspector,
                    documents,
                    dispatch,
                    rootDirectory: projectDirectory
                }, bottomGutterProps: {
                    show: root.showBottomGutter,
                    scriptProcesses: root.scriptProcesses,
                    dispatch
                }, editorWindowsProps: {
                    root,
                    dispatch
                }, rightGutterProps: {
                    root,
                    dispatch
                } }),
            React.createElement(QuickSearchModal, { root: root, dispatch: dispatch }),
            React.createElement(ComponentPickerModal, { root: root, dispatch: dispatch }),
            showConfigureBuildModal ? (React.createElement(ConfigureBuildModal, { dispatch: dispatch, projectInfo: projectInfo })) : null,
            workspaceProps && (React.createElement(WorkspacePrompt, Object.assign({}, workspaceProps, { dispatch: dispatch })))));
    }
});
//# sourceMappingURL=controller.js.map