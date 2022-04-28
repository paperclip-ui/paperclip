import "./index.scss";
import * as React from "react";
import { compose, pure, withState, withHandlers } from "recompose";

type InputComponentProps = {
  value: any;
  onChange?: () => any;
};

type LabeledInputComponentProps = {
  label: string;
} & InputComponentProps;

export type RawColorInputOuterProps = {} & InputComponentProps;

export type RawColorInputInputProps = {
  currentInputIndex: number;
  onSwitcherClick: () => any;
} & RawColorInputOuterProps;

const InputComponent = ({
  value,
  label,
  onChange
}: LabeledInputComponentProps) => {
  return (
    <div className="field">
      {/* <TextInputComponent onChange={onChange} />
      <label>{label}</label> */}
    </div>
  );
};

const HexInputComponent = ({ value }: InputComponentProps) => {
  return (
    <div className="fields">
      <InputComponent label="hex" value={0} />
    </div>
  );
};

const RGBAInputComponent = ({ value }: InputComponentProps) => {
  return (
    <div className="fields">
      <InputComponent label="r" value={0} />
      <InputComponent label="g" value={0} />
      <InputComponent label="b" value={0} />
      <InputComponent label="a" value={0} />
    </div>
  );
};

const OPTIONS = [RGBAInputComponent, HexInputComponent];

const BaseRawColorInputComponent = ({
  value,
  onSwitcherClick
}: RawColorInputInputProps) => {
  return (
    <div className="m-raw-color-input">
      <RGBAInputComponent value={value} />
      <div className="switcher">
        <i className="ion-arrow-up-b" />
        <i className="ion-arrow-down-b" />
      </div>
    </div>
  );
};

const enhance = compose<RawColorInputOuterProps, RawColorInputOuterProps>(
  pure,
  withState("currentInputIndex", "setCurrentInputIndex", 0),
  withHandlers({
    onSwitcherClick: () => () => {}
  })
);

export const RawColorInputComponent = enhance(BaseRawColorInputComponent);
