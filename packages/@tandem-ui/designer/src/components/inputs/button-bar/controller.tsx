import * as React from "react";
import cx from "classnames";
import { EMPTY_ARRAY } from "tandem-common";
import { BaseButtonBarProps } from "./view.pc";
import { ButtonBarItem as ButtonBarItemComponent } from "./item.pc";

export type ButtonBarOption = {
  icon: any;
  value: any;
};

export type Props = {
  options: ButtonBarOption[];
  value: any;
  onChangeComplete: any;
};

export default (Base: React.ComponentClass<BaseButtonBarProps>) =>
  class ButtonBarController extends React.PureComponent<Props> {
    render() {
      const { options, value, onChangeComplete } = this.props;
      const items = (options || EMPTY_ARRAY).map((item, i) => {
        return (
          <ButtonBarItemComponent
            key={i}
            children={item.icon}
            variant={cx({
              selected: item.value === value,
              last: i === options.length - 1,
              first: i === 0,
            })}
            onClick={onChangeComplete && (() => onChangeComplete(item.value))}
          />
        );
      });

      return <Base items={items} />;
    }
  };
