import "./index.scss";
import * as React from "react";
import { TextPreview } from "./view.pc";
import { openTextEditorButtonClicked } from "../../../../../actions";
export class TextEditorWindow extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onOpenTextEditorButtonClick = () => {
            this.props.dispatch(openTextEditorButtonClicked(this.props.fileCacheItem.uri));
        };
    }
    render() {
        const { fileCacheItem } = this.props;
        const { onOpenTextEditorButtonClick } = this;
        const content = (React.createElement("div", { dangerouslySetInnerHTML: {
                __html: fileCacheItem && formatText(fileCacheItem.content.toString("utf8"))
            } }));
        return (React.createElement(TextPreview, { className: "m-text-editor", openTextEditorButtonProps: {
                onClick: onOpenTextEditorButtonClick
            }, innerProps: {
                children: content
            } }));
    }
}
const formatText = (text) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, `<br>`)
        .replace(/\s/g, `&nbsp;&nbsp;`)
        .replace(/\t/g, `&nbsp;&nbsp;&nbsp;&nbsp;`)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
//# sourceMappingURL=index.js.map