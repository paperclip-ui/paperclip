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
import { PCElementState, PCVariantTriggerSourceType } from "paperclip";
import { isEqual } from "lodash";
import cx from "classnames";
import { memoize } from "tandem-common";
import { variantTriggerSourceChanged, variantTriggerTargetChanged } from "../../../../../../actions";
const NO_OPTION = {
    label: "--",
    value: undefined
};
const BASE_SOURCE_OPTIONS = [
    PCElementState.HOVER,
    PCElementState.ACTIVE,
    PCElementState.FOCUS,
    PCElementState.VISITED,
    PCElementState.DISABLED
].map((state) => ({
    label: String(state),
    value: {
        type: PCVariantTriggerSourceType.STATE,
        state: state
    }
}));
export default (Base) => class TriggerItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onSourceChange = (value) => {
            this.props.dispatch(variantTriggerSourceChanged(this.props.trigger, value));
        };
        this.onTargetChange = (value) => {
            this.props.dispatch(variantTriggerTargetChanged(this.props.trigger, value));
        };
    }
    render() {
        const { onSourceChange, onTargetChange } = this;
        const _a = this.props, { onClick, selected, variants, trigger, globalQueries } = _a, rest = __rest(_a, ["onClick", "selected", "variants", "trigger", "globalQueries"]);
        const options = getSourceOptions(globalQueries);
        const valueOption = options.find(option => isEqual(option.value, trigger.source));
        return (React.createElement(Base, Object.assign({}, rest, { backgroundProps: { onClick }, variant: cx({ selected }), sourceInputProps: {
                value: valueOption && valueOption.value,
                options,
                onChangeComplete: onSourceChange
            }, targetInputProps: {
                value: variants.find(variant => variant.id === trigger.targetVariantId),
                options: getTargetOptions(variants),
                onChangeComplete: onTargetChange
            } })));
    }
};
export const getSourceOptions = memoize((queries) => {
    return [
        NO_OPTION,
        ...BASE_SOURCE_OPTIONS,
        ...queries.map(mediaQuery => ({
            label: mediaQuery.label,
            value: {
                type: PCVariantTriggerSourceType.QUERY,
                queryId: mediaQuery.id
            }
        }))
    ];
});
export const getTargetOptions = memoize((variants) => {
    return [
        NO_OPTION,
        ...variants.map(variant => ({
            label: variant.label,
            value: variant
        }))
    ];
});
//# sourceMappingURL=trigger-item-controller.js.map