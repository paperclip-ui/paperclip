var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import cx from "classnames";
import { ControllerItem } from "./controller-item.pc";
import { getSyntheticSourceNode, PCSourceTagNames } from "paperclip";
import { EMPTY_ARRAY, stripProtocol } from "tandem-common";
import { addComponentControllerButtonClicked, removeComponentControllerButtonClicked } from "../../../../../actions";
export default (Base) => {
    return class ComponentController extends React.PureComponent {
        constructor(props) {
            super(props);
            this.onItemClick = relativePath => {
                this.setState({
                    selectedControllerRelativePath: this.state.selectedControllerRelativePath === relativePath
                        ? null
                        : relativePath
                });
            };
            this.onRemoveControllerClick = () => {
                this.props.dispatch(removeComponentControllerButtonClicked(this.state.selectedControllerRelativePath));
            };
            this.onAddControllerClick = () => {
                this.props.dispatch(addComponentControllerButtonClicked(stripProtocol(this.props.sourceNodeUri)));
            };
            this.state = { selectedControllerRelativePath: null };
        }
        render() {
            const { onRemoveControllerClick, onAddControllerClick, onItemClick } = this;
            const { selectedControllerRelativePath } = this.state;
            const _a = this.props, { selectedNodes, graph, dispatch, sourceNodeUri } = _a, rest = __rest(_a, ["selectedNodes", "graph", "dispatch", "sourceNodeUri"]);
            if (!graph) {
                return null;
            }
            if (!selectedNodes.length) {
                return null;
            }
            const sourceNode = getSyntheticSourceNode(selectedNodes[0], graph);
            if (sourceNode.name !== PCSourceTagNames.COMPONENT) {
                return null;
            }
            const hasControllerSelected = (sourceNode.controllers || EMPTY_ARRAY).indexOf(selectedControllerRelativePath) !== -1;
            const controllers = (sourceNode.controllers || EMPTY_ARRAY).map((relativePath, i) => {
                return (React.createElement(ControllerItem, { onClick: onItemClick, key: relativePath, dispatch: dispatch, selected: selectedControllerRelativePath === relativePath, relativePath: relativePath }));
            });
            return (React.createElement(Base, Object.assign({}, rest, { variant: cx({ hasControllerSelected }), removeControllerButtonProps: { onClick: onRemoveControllerClick }, addControllerButtonProps: { onClick: onAddControllerClick }, content: controllers })));
        }
    };
};
//# sourceMappingURL=component-controller.js.map