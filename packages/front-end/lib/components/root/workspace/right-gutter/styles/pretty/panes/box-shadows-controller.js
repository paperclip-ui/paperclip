import * as React from "react";
import cx from "classnames";
import { BoxShadowItem } from "./box-shadow.pc";
import { memoize, EMPTY_ARRAY, arraySplice } from "tandem-common";
import { cssPropertyChangeCompleted, cssPropertyChanged } from "../../../../../../../actions";
import { isTextLikePCNode } from "paperclip";
export default (Base) => class BoxShadowsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            selectedBoxShadowIndex: null
        };
        this.setSelectedBoxShadowIndex = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { selectedBoxShadowIndex: value }));
        };
        this.onChange = (item, index) => {
            const { computedStyleInfo, dispatch } = this.props;
            const info = arraySplice(parseBoxShadows(computedStyleInfo.style["box-shadow"]), index, 1, item);
            dispatch(cssPropertyChanged("box-shadow", stringifyBoxShadowInfo(info)));
        };
        this.onChangeComplete = (item, index) => {
            const { computedStyleInfo, dispatch } = this.props;
            const info = arraySplice(parseBoxShadows(computedStyleInfo.style["box-shadow"]), index, 1, item);
            dispatch(cssPropertyChangeCompleted("box-shadow", stringifyBoxShadowInfo(info)));
        };
        this.onAddButtonClick = () => {
            const { computedStyleInfo, dispatch, inset } = this.props;
            const info = [
                ...parseBoxShadows(computedStyleInfo.style["box-shadow"]),
                {
                    inset: Boolean(inset),
                    color: "rgba(0,0,0,1)",
                    x: "0px",
                    y: "0px",
                    blur: "10px",
                    spread: "0px"
                }
            ];
            dispatch(cssPropertyChangeCompleted("box-shadow", stringifyBoxShadowInfo(info)));
        };
        this.onRemoveButtonClick = () => {
            const { computedStyleInfo, dispatch } = this.props;
            const { selectedBoxShadowIndex } = this.state;
            const { setSelectedBoxShadowIndex } = this;
            const info = arraySplice(parseBoxShadows(computedStyleInfo.style["box-shadow"]), selectedBoxShadowIndex, 1);
            dispatch(cssPropertyChangeCompleted("box-shadow", stringifyBoxShadowInfo(info)));
            setSelectedBoxShadowIndex(null);
        };
        this.onItemRemove = index => {
            const { dispatch, computedStyleInfo } = this.props;
            const info = arraySplice(parseBoxShadows(computedStyleInfo.style["box-shadow"]), index, 1);
            dispatch(cssPropertyChanged("box-shadow", stringifyBoxShadowInfo(info)));
        };
        this.onItemClick = index => {
            const { selectedBoxShadowIndex } = this.state;
            const { setSelectedBoxShadowIndex } = this;
            setSelectedBoxShadowIndex(index === selectedBoxShadowIndex ? null : index);
        };
    }
    render() {
        const { documentColors, computedStyleInfo, globalVariables, inset } = this.props;
        const { selectedBoxShadowIndex } = this.state;
        const { onChange, onItemClick, onItemRemove, onChangeComplete, onAddButtonClick, onRemoveButtonClick } = this;
        const { sourceNode } = computedStyleInfo;
        if (isTextLikePCNode(sourceNode)) {
            return null;
        }
        if (!computedStyleInfo) {
            return null;
        }
        const boxShadowInfo = parseBoxShadows(computedStyleInfo.style["box-shadow"]);
        const hasSelectedShadow = selectedBoxShadowIndex != null;
        const items = boxShadowInfo
            .map((info, index) => {
            return info.inset === Boolean(inset) ? (React.createElement(BoxShadowItem, { onRemove: () => onItemRemove(index), globalVariables: globalVariables, selected: index === selectedBoxShadowIndex, key: index, value: info, onBackgroundClick: () => onItemClick(index), onChange: value => onChange(value, index), onChangeComplete: value => onChangeComplete(value, index), documentColors: documentColors })) : null;
        })
            .filter(Boolean);
        const hasItems = Boolean(items.length);
        return (React.createElement(Base, { variant: cx({ hasItems, hasSelectedShadow }), addButtonProps: { onClick: onAddButtonClick }, removeButtonProps: { onClick: onRemoveButtonClick }, itemsProps: { children: items } }));
    }
};
const stringifyBoxShadowInfo = (value) => value
    .map(({ inset, color, x, y, blur, spread }) => {
    return `${inset ? "inset " : ""} ${x || 0} ${y || 0} ${blur ||
        0} ${spread || 0} ${color}`;
})
    .join(", ");
const parseBoxShadows = memoize((value = "") => {
    return (value.match(/(inset\s+)?((-?\d*\w*)\s+)*(\w+\(.*?\)|#[\d\w]+)/g) ||
        EMPTY_ARRAY)
        .map(shadow => {
        const inset = String(shadow).indexOf("inset") !== -1;
        const [, , x, y, blur, spread, color] = String(shadow + "").match(/(inset\s)?([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s(.*)/) || EMPTY_ARRAY;
        return {
            inset: Boolean(inset),
            x,
            y,
            blur,
            spread,
            color
        };
    })
        .filter(Boolean);
});
//# sourceMappingURL=box-shadows-controller.js.map