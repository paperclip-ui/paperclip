import * as React from "react";

type BaseProps = {
  value?: string;
  onChange?: any;
  onChangeComplete?: any;
};

export type Props = BaseProps;

export default <TProps extends BaseProps>(
  Base: React.ComponentClass<BaseProps>
) => {
  return class StyleValueController extends React.PureComponent<Props> {
    onChange = value => {
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    };
    onChangeComplete = value => {
      if (this.props.onChangeComplete) {
        this.props.onChangeComplete(value);
      }
    };
    render() {
      const { value, ...rest } = this.props;
      const { onChange, onChangeComplete } = this;

      let inputValue: string = value;

      // "unset" may be defined if the user clears an overridden field. "Unset" is used to clear
      // overrides since that's also the native CSS behavior. However, we want to hide that from the user since a cleared field
      // should communicate "unset" just fine (definitely more intuitive).
      if (value === "unset") {
        inputValue = null;
      }

      return (
        <Base
          {...rest}
          value={inputValue}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
        />
      );
    }
  };
};
