import * as React from "react";
import { BaseEditorWindowsProps } from "./editor-windows.pc";
import { RootState } from "../../../../state";
import { Dispatch } from "redux";
import { Editor } from "./editor.pc";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseEditorWindowsProps>) =>
  class EditorWindowsController extends React.PureComponent<Props> {
    render() {
      const { root, dispatch } = this.props;
      return (
        <Base>
          {root.editorWindows.map((editorWindow, i) => {
            return (
              <Editor
                key={i}
                editorWindow={editorWindow}
                root={root}
                dispatch={dispatch}
              />
            );
          })}
        </Base>
      );
    }
  };
