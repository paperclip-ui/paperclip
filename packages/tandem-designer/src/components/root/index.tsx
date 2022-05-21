import "./index.scss";
import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { Workspace } from "./workspace/view.pc";
import { Welcome } from "./welcome/view.pc";
import {
  RootState,
  isUnsaved,
  getBuildScriptProcess,
  RootReadyType,
} from "../../state";
import { Chrome } from "./chrome.pc";

export type RootOuterProps = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export class RootComponent extends React.PureComponent<RootOuterProps> {
  render() {
    const { root, dispatch } = this.props;
    // TODO - add loading state here
    if (root.readyType === RootReadyType.LOADING) {
      return null;
    }

    let content;
    const buildScriptProcess = getBuildScriptProcess(root);

    if (!root.projectInfo) {
      content = (
        <Welcome
          key="welcome"
          dispatch={dispatch}
          selectedDirectory={root.selectedDirectoryPath}
        />
      );
    } else {
      content = (
        <div key="workspace-root" className="m-root">
          <Workspace root={root} dispatch={dispatch} />
        </div>
      );
    }

    if (root.customChrome) {
      content = (
        <Chrome
          content={content}
          unsaved={isUnsaved(root)}
          projectInfo={root.projectInfo}
          dispatch={dispatch}
          buildButtonProps={{
            dispatch,
            buildScriptProcess,
            hasBuildScript: Boolean(
              root.projectInfo &&
                root.projectInfo.config.scripts &&
                root.projectInfo.config.scripts.build
            ),
            hasOpenScript: Boolean(
              root.projectInfo &&
                root.projectInfo.config.scripts &&
                root.projectInfo.config.scripts.openApp
            ),
          }}
        />
      );
    }

    return content;
  }
}
