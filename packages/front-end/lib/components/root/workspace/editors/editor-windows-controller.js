import * as React from "react";
import { Editor } from "./editor.pc";
export default (Base) => class EditorWindowsController extends React.PureComponent {
    render() {
        const { root, dispatch } = this.props;
        return (React.createElement(Base, null, root.editorWindows.map((editorWindow, i) => {
            return (React.createElement(Editor, { key: i, editorWindow: editorWindow, root: root, dispatch: dispatch }));
        })));
    }
};
//# sourceMappingURL=editor-windows-controller.js.map