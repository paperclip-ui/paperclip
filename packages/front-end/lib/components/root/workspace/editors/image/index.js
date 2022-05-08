import "./index.scss";
import * as React from "react";
import { getFileCacheItemDataUrl } from "fsbox";
export class ImageEditorWindowComponent extends React.PureComponent {
    render() {
        const { fileCacheItem } = this.props;
        return (React.createElement("div", { className: "m-image-editor" },
            React.createElement("img", { src: getFileCacheItemDataUrl(fileCacheItem) })));
    }
}
//# sourceMappingURL=index.js.map