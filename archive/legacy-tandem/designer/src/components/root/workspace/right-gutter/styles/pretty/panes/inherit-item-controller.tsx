import * as React from "react";
import cx from "classnames";
import { PCComponent, PCStyleMixin } from "@paperclip-lang/core";
import { DropdownMenuOption } from "../../../../../../inputs/dropdown/controller";
import { memoize } from "tandem-common";
import { inheritItemComponentTypeChangeComplete } from "../../../../../../../actions";
import { Dispatch } from "redux";
import { BaseInheritItemProps } from "./inherit-item.pc";

export type Props = BaseInheritItemProps & {
  onClick: any;
  alt?: boolean;
  dispatch: Dispatch<any>;
  styleMixinId: string;
  styleMixin: PCStyleMixin;
  selected?: boolean;
  allStyleMixins: PCStyleMixin[];
};

export default (Base: React.ComponentClass<BaseInheritItemProps>) =>
  class InheritItemController extends React.PureComponent<Props> {
    onChangeComplete = (value) => {
      this.props.dispatch(
        inheritItemComponentTypeChangeComplete(
          this.props.styleMixinId,
          value.id
        )
      );
    };
    onClick = () => {
      this.props.onClick(this.props.styleMixinId);
    };
    render() {
      const { selected, styleMixin, allStyleMixins, alt, ...rest } = this.props;
      const { onClick, onChangeComplete } = this;

      return (
        <Base
          {...rest}
          onClick={onClick}
          variant={cx({ selected, alt })}
          dropdownProps={{
            onClick: (event) => event.stopPropagation(),
            filterable: true,
            value: styleMixin,
            options: getStyleMixinOptions(allStyleMixins),
            onChangeComplete: onChangeComplete,
          }}
        />
      );
    }
  };

const getStyleMixinOptions = memoize(
  (styleMixins: PCStyleMixin[]): DropdownMenuOption[] => {
    return styleMixins
      .map((styleMixin) => {
        return {
          label: styleMixin.label,
          value: styleMixin,
        };
      })
      .sort((a, b) => (a.label > b.label ? -1 : 1));
  }
);
