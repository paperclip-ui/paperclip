import "./index.scss";
import * as React from "react";
import { Dispatch } from "redux";
import { FileCacheItem, getFileCacheItemDataUrl } from "fsbox";

export type ImageEditorWindowOuterProps = {
  fileCacheItem: FileCacheItem;
  dispatch: Dispatch<any>;
};

export class ImageEditorWindowComponent extends React.PureComponent<
  ImageEditorWindowOuterProps
> {
  render() {
    const { fileCacheItem } = this.props;
    return (
      <div className="m-image-editor">
        <img src={getFileCacheItemDataUrl(fileCacheItem)} />
      </div>
    );
  }
}
