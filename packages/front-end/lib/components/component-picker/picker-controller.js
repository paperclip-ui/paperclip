import * as React from "react";
import { ComponentOption } from "./cell.pc";
import { getAllPCComponents } from "paperclip";
import { componentPickerItemClick } from "../../actions";
export default (Base) => {
    return class PickerController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.state = {
                filter: []
            };
            this.onFilterChange = value => {
                this.setState(Object.assign(Object.assign({}, this.state), { filter: String(value || "")
                        .toLowerCase()
                        .trim()
                        .split(/\s+/g) }));
            };
            this.onClickComponent = component => {
                this.props.dispatch(componentPickerItemClick(component));
            };
        }
        render() {
            const { onFilterChange, onClickComponent } = this;
            const { filter } = this.state;
            const { root } = this.props;
            const componentNodes = getAllPCComponents(root.graph);
            // TODO - filter private
            const options = componentNodes
                .filter(component => {
                const label = (component.label || "").toLowerCase();
                for (const part of filter) {
                    if (label.indexOf(part) === -1) {
                        return false;
                    }
                }
                return true;
            })
                .map(component => {
                return (React.createElement(ComponentOption, { key: component.id, onClick: () => onClickComponent(component), centerProps: { children: component.label } }));
            });
            return (React.createElement(Base, { filterInputProps: {
                    onChange: onFilterChange
                }, optionsProps: { children: options } }));
        }
    };
};
//# sourceMappingURL=picker-controller.js.map