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
import { isVariantTriggered, getVariantTriggers } from "paperclip";
import cx from "classnames";
import { variantDefaultSwitchClicked, variantLabelChanged } from "../../../../../../actions";
import { FocusComponent } from "../../../../../focus";
const { TextInput } = require("../../../../../inputs/text/view.pc");
export default (Base) => class OptionsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            editingLabel: false
        };
        this.setEditingLabel = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { editingLabel: value }));
        };
        this.onSwitchChange = () => {
            const { onToggle, dispatch, item } = this.props;
            if (onToggle) {
                onToggle(item, event);
            }
            else {
                dispatch(variantDefaultSwitchClicked(item));
            }
        };
        this.onInputClick = event => {
            const { editingLabel } = this.state;
            if (editingLabel !== false) {
                this.setEditingLabel(true);
                event.stopPropagation();
            }
        };
        this.onLabelChange = (value) => {
            const { item, dispatch } = this.props;
            this.setEditingLabel(false);
            dispatch(variantLabelChanged(item, value));
        };
    }
    render() {
        const { onSwitchChange, onInputClick, onLabelChange } = this;
        const { editingLabel } = this.state;
        const _a = this.props, { item, graph, onReset, component, instance, alt, enabled } = _a, rest = __rest(_a, ["item", "graph", "onReset", "component", "instance", "alt", "enabled"]);
        if (!item) {
            return null;
        }
        const triggered = isVariantTriggered(instance, item, graph);
        const hasTrigger = Boolean(getVariantTriggers(item, component).length) && !triggered;
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({ alt, triggered, hasTrigger }), switchProps: {
                value: enabled,
                onChangeComplete: onSwitchChange
            }, resetButtonProps: {
                onClick: onReset && (() => onReset(item)),
                style: {
                    display: onReset ? "block" : "none"
                }
            }, input: editingLabel ? (React.createElement(FocusComponent, null, React.createElement(TextInput, { value: item.label, onChangeComplete: onLabelChange }))) : (item.label || "Click to edit"), inputProps: {
                onClick: onInputClick
            } })));
    }
};
//# sourceMappingURL=option-controller.js.map