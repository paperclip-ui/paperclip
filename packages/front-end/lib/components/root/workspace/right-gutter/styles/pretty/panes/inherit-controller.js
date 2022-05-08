import * as React from "react";
import cx from "classnames";
import { EMPTY_OBJECT } from "tandem-common";
import { InheritItem } from "./inherit-item.pc";
import { getPCNode, getAllStyleMixins, PCSourceTagNames, isElementLikePCNode, getNativeComponentName } from "paperclip";
import { inheritPaneAddButtonClick, inheritPaneRemoveButtonClick } from "../../../../../../../actions";
export default (Base) => {
    return class InheritController extends React.PureComponent {
        constructor(props) {
            super(props);
            this.onAddButtonClick = () => {
                this.props.dispatch(inheritPaneAddButtonClick());
            };
            this.onRemoveButtonClick = () => {
                this.props.dispatch(inheritPaneRemoveButtonClick(this.state.selectedStyleMixinId));
                this.setState({ selectedStyleMixinId: null });
            };
            this.onInheritItemClick = (styleMixinId) => {
                this.setState({
                    selectedStyleMixinId: this.state.selectedStyleMixinId === styleMixinId ? null : styleMixinId
                });
            };
            this.state = {
                selectedStyleMixinId: null,
                selectedInspectorNodes: props.selectedInspectorNodes
            };
        }
        static getDerivedStateFromProps(props, state) {
            if (props.selectedInspectorNodes !== state.selectedInspectorNodes) {
                return {
                    selectedStyleMixinId: null,
                    selectedInspectorNodes: props.selectedInspectorNodes
                };
            }
            return null;
        }
        render() {
            const { onAddButtonClick, onRemoveButtonClick, onInheritItemClick } = this;
            const { selectedStyleMixinId, selectedInspectorNodes } = this.state;
            const { dispatch, graph, projectOptions } = this.props;
            const node = selectedInspectorNodes[0];
            const sourceNode = getPCNode(node.sourceNodeId, graph);
            const hasItemSelected = Boolean(selectedStyleMixinId);
            const allStyleMixins = getAllStyleMixins(graph, projectOptions.allowCascadeFonts === false
                ? isElementLikePCNode(sourceNode)
                    ? getNativeComponentName(sourceNode, graph) === "input"
                        ? null
                        : PCSourceTagNames.ELEMENT
                    : PCSourceTagNames.TEXT
                : null);
            const items = Object.keys(sourceNode.styleMixins || EMPTY_OBJECT)
                .filter(k => Boolean(sourceNode.styleMixins[k]))
                .sort((a, b) => {
                return sourceNode.styleMixins[a].priority >
                    sourceNode.styleMixins[b].priority
                    ? -1
                    : 1;
            })
                .map((styleMixinId, i) => {
                return (React.createElement(InheritItem, { dropdownProps: null, alt: Boolean(i % 2), key: styleMixinId, onClick: onInheritItemClick, selected: selectedStyleMixinId === styleMixinId, styleMixinId: styleMixinId, styleMixin: getPCNode(styleMixinId, graph), allStyleMixins: allStyleMixins, dispatch: dispatch }));
            });
            return (React.createElement(Base, { variant: cx({ hasItemSelected }), addButtonProps: { onClick: onAddButtonClick }, removeButtonProps: { onClick: onRemoveButtonClick }, items: items }));
        }
    };
};
//# sourceMappingURL=inherit-controller.js.map