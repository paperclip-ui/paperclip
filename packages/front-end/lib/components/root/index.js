import "./index.scss";
import * as React from "react";
import { Workspace } from "./workspace/view.pc";
import { Welcome } from "./welcome/view.pc";
import { isUnsaved, getBuildScriptProcess, RootReadyType } from "../../state";
import { Chrome } from "./chrome.pc";
export class RootComponent extends React.PureComponent {
    render() {
        const { root, dispatch } = this.props;
        // TODO - add loading state here
        if (root.readyType === RootReadyType.LOADING) {
            return null;
        }
        let content;
        const buildScriptProcess = getBuildScriptProcess(root);
        if (!root.projectInfo) {
            content = (React.createElement(Welcome, { key: "welcome", dispatch: dispatch, selectedDirectory: root.selectedDirectoryPath }));
        }
        else {
            content = (React.createElement("div", { key: "workspace-root", className: "m-root" },
                React.createElement(Workspace, { root: root, dispatch: dispatch })));
        }
        if (root.customChrome) {
            content = (React.createElement(Chrome, { content: content, unsaved: isUnsaved(root), projectInfo: root.projectInfo, dispatch: dispatch, buildButtonProps: {
                    dispatch,
                    buildScriptProcess,
                    hasBuildScript: Boolean(root.projectInfo &&
                        root.projectInfo.config.scripts &&
                        root.projectInfo.config.scripts.build),
                    hasOpenScript: Boolean(root.projectInfo &&
                        root.projectInfo.config.scripts &&
                        root.projectInfo.config.scripts.openApp)
                } }));
        }
        return content;
    }
}
//# sourceMappingURL=index.js.map