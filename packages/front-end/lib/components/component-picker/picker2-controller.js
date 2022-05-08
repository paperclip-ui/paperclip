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
import * as ReactDOM from "react-dom";
import cx from "classnames";
import { ComponentPickerPopdownItem as BaseComponentPickerPopdownItem } from "./picker.pc";
import { getAllPCComponents } from "paperclip";
import { componentPickerItemClick } from "../../actions";
import scrollIntoView from "scroll-into-view-if-needed";
class ComponentPickerPopdownItem extends React.PureComponent {
    componentDidUpdate(prevProps) {
        if (this.props.preselected && !prevProps.preselected) {
            scrollIntoView(ReactDOM.findDOMNode(this), {
                scrollMode: "if-needed"
            });
        }
    }
    render() {
        const _a = this.props, { preselected } = _a, rest = __rest(_a, ["preselected"]);
        return (React.createElement(BaseComponentPickerPopdownItem, Object.assign({ variant: cx({ preselected }) }, rest)));
    }
}
export default (Base) => class Picker2Controller extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            filter: [],
            preselectIndex: 0
        };
        this.onFilterChange = value => {
            this.setState(Object.assign(Object.assign({}, this.state), { preselectIndex: 0, filter: String(value || "")
                    .toLowerCase()
                    .trim()
                    .split(/\s+/g) }));
        };
        this.onClickComponent = component => {
            this.props.dispatch(componentPickerItemClick(component));
        };
        this.onFilterKeyDown = (event) => {
            let preselectIndex = this.state.preselectIndex;
            const filteredComponents = this.getFilteredComponents();
            if (event.key === "ArrowDown") {
                preselectIndex++;
            }
            else if (event.key === "ArrowUp") {
                preselectIndex--;
            }
            else if (event.key === "Enter") {
                this.props.dispatch(componentPickerItemClick(filteredComponents[preselectIndex]));
            }
            this.setState(Object.assign(Object.assign({}, this.state), { preselectIndex: Math.max(0, Math.min(preselectIndex, filteredComponents.length - 1)) }));
        };
    }
    getFilteredComponents() {
        const { graph } = this.props;
        const { filter } = this.state;
        const components = getAllPCComponents(graph);
        return components.filter(component => {
            const label = (component.label || "").toLowerCase();
            for (const part of filter) {
                if (label.indexOf(part) === -1) {
                    return false;
                }
            }
            return true;
        });
    }
    render() {
        const { onClickComponent, onFilterChange, onFilterKeyDown } = this;
        const { preselectIndex } = this.state;
        const items = this.getFilteredComponents().map((component, i) => {
            return (React.createElement(ComponentPickerPopdownItem, { key: component.id, onClick: () => onClickComponent(component), componentNameProps: { text: component.label }, preselected: i === preselectIndex }));
        });
        return (React.createElement(Base, Object.assign({}, this.props, { variant: cx({
                noComponents: items.length === 0
            }), filterProps: {
                focus: true,
                onChange: onFilterChange,
                onKeyDown: onFilterKeyDown
            }, items: items })));
    }
};
//# sourceMappingURL=picker2-controller.js.map