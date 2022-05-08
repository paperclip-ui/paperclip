import * as React from "react";
import cx from "classnames";
import { EMPTY_ARRAY } from "tandem-common";
import { ButtonBarItem as ButtonBarItemComponent } from "./item.pc";
export default (Base) => class ButtonBarController extends React.PureComponent {
    render() {
        const { options, value, onChangeComplete } = this.props;
        const items = (options || EMPTY_ARRAY).map((item, i) => {
            return (React.createElement(ButtonBarItemComponent, { key: i, children: item.icon, variant: cx({
                    selected: item.value === value,
                    last: i === options.length - 1,
                    first: i === 0
                }), onClick: onChangeComplete && (() => onChangeComplete(item.value)) }));
        });
        return React.createElement(Base, { items: items });
    }
};
//# sourceMappingURL=controller.js.map