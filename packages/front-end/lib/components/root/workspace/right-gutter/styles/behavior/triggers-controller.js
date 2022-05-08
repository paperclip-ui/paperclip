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
import { TriggerItem } from "./triggers.pc";
import { addVariantTriggerButtonClicked, removeVariantTriggerButtonClicked } from "../../../../../../actions";
export default (Base) => class TriggersPaneController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            variantTriggers: this.props.variantTriggers,
            selectedVariantTrigger: null
        };
        this.onAddTriggerClick = () => {
            this.props.dispatch(addVariantTriggerButtonClicked());
        };
        this.onRemoveTriggerClick = () => {
            this.props.dispatch(removeVariantTriggerButtonClicked(this.state.selectedVariantTrigger));
            this.setState(Object.assign(Object.assign({}, this.state), { selectedVariantTrigger: null }));
        };
        this.onTriggerClick = (trigger) => {
            this.setState(Object.assign(Object.assign({}, this.state), { selectedVariantTrigger: !this.state.selectedVariantTrigger ||
                    this.state.selectedVariantTrigger.id !== trigger.id
                    ? trigger
                    : null }));
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.variantTriggers !== state.variantTriggers) {
            return Object.assign(Object.assign({}, state), { variantTriggers: props.variantTriggers, selectedVariantTrigger: null });
        }
        return null;
    }
    render() {
        const { onAddTriggerClick, onRemoveTriggerClick, onTriggerClick } = this;
        const { selectedVariantTrigger } = this.state;
        const _a = this.props, { variantTriggers, variants, globalQueries, dispatch } = _a, rest = __rest(_a, ["variantTriggers", "variants", "globalQueries", "dispatch"]);
        const items = variantTriggers.map(trigger => (React.createElement(TriggerItem, { selected: selectedVariantTrigger && selectedVariantTrigger.id === trigger.id, globalQueries: globalQueries, onClick: () => onTriggerClick(trigger), dispatch: dispatch, trigger: trigger, variants: variants })));
        return (React.createElement(Base, Object.assign({}, rest, { itemProps: null, itemProps1: null, itemProps2: null, items: items, removeTriggerButtonProps: {
                onClick: onRemoveTriggerClick
            }, variant: cx({
                hasTriggers: Boolean(items.length),
                hasItemSelected: Boolean(selectedVariantTrigger)
            }), addTriggerButtonProps: {
                onClick: onAddTriggerClick
            } })));
    }
};
//# sourceMappingURL=triggers-controller.js.map