import "./index.scss";
import * as React from "react";
import { Dispatch } from "redux";
import { FileCacheItem, getFileCacheItemDataUrl } from "fsbox";
import { TextPreview } from "./view.pc";
import { openTextEditorButtonClicked } from "../../../../../actions";

export type TextEditorProps = {
  fileCacheItem: FileCacheItem;
  dispatch: Dispatch<any>;
};

export class TextEditorWindow extends React.PureComponent<TextEditorProps> {
  onOpenTextEditorButtonClick = () => {
    this.props.dispatch(
      openTextEditorButtonClicked(this.props.fileCacheItem.uri)
    );
  };
  render() {
    const { fileCacheItem } = this.props;
    const { onOpenTextEditorButtonClick } = this;
    const content = (
      <div
        dangerouslySetInnerHTML={{
          __html:
            fileCacheItem &&
            formatText(new TextDecoder("utf-8").decode(fileCacheItem.content)),
        }}
      />
    );

    return (
      <TextPreview
        className="m-text-editor"
        openTextEditorButtonProps={{
          onClick: onOpenTextEditorButtonClick,
        }}
        innerProps={{
          children: content,
        }}
      />
    );
  }
}

const formatText = (text: string) => {
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
