import * as React from "react";

export type Props = {
  value: boolean;
  onChange?: (value: boolean) => any;
  onChangeComplete?: (value: boolean) => any;
};

export default (Base: React.ComponentClass<any>) => {
  return class CheckboxController extends React.PureComponent<Props> {
    onClick = event => {
      const { value, onChange, onChangeComplete } = this.props;

      event.stopPropagation();
      if (onChange) {
        onChange(value);
      }
      if (onChangeComplete) {
        onChangeComplete(!value);
      }
    };

    render() {
      return <Base onClick={this.onClick} {...this.props} />;
    }
  };
};
