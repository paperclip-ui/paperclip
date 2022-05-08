import * as React from "react";
import { PaneComponent } from "../../../../pane";
// import { Item: BaseItem } from "./view.pc";
import { REGISTERED_COMPONENT } from "../../../../../state";
import { createTreeNode } from "tandem-common";
import { compose, pure } from "recompose";
import { DragSource } from "react-dnd";
const NATIVE_ELEMENTS = [
    { tagName: "div", label: "Div", template: createTreeNode("template") },
    {
        tagName: "text",
        label: "Text",
        template: createTreeNode("edit me")
    }
];
const BaseNativeElementComponent = ({ item, connectDragSource }) => {
    return connectDragSource(React.createElement("div", null));
};
const NativeElementComponent = compose(pure, DragSource(REGISTERED_COMPONENT, {
    beginDrag({ item }) {
        return item;
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
})))(BaseNativeElementComponent);
export class ComponentsPaneComponent extends React.PureComponent {
    render() {
        return (React.createElement(PaneComponent, { header: "Native Elements" }, NATIVE_ELEMENTS.map((item, i) => {
            return React.createElement(NativeElementComponent, { key: i, item: item });
        })));
    }
}
//# sourceMappingURL=index.js.map