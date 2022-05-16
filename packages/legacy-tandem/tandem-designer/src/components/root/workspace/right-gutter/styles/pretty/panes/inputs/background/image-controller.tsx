import * as React from "react";
import { BaseBackgroundImagePickerProps } from "./view.pc";
import { memoize } from "tandem-common";
import { CSSBackgroundType, CSSImageBackground } from "./state";

export type Props = {
  cwd: string;
  value: CSSImageBackground;
  onChange?: any;
  onChangeComplete?: any;
};

export default (Base: React.ComponentClass<BaseBackgroundImagePickerProps>) =>
  class BackgroundImagePickerController extends React.PureComponent<Props> {
    render() {
      const { cwd, value, onChange, onChangeComplete, ...rest } = this.props;
      return (
        <Base
          {...rest}
          fileUriPickerProps={{
            cwd,
            value: value.uri,
            onChangeComplete: getChangeHandler(value, "uri", onChangeComplete),
          }}
          repeatInputProps={{
            value: value.repeat,
            onChangeComplete: getChangeHandler(
              value,
              "repeat",
              onChangeComplete
            ),
          }}
          positionInputProps={{
            value: value.position,
            onChangeComplete: getChangeHandler(
              value,
              "position",
              onChangeComplete
            ),
          }}
          sizeInputProps={{
            value: value.size,
            onChangeComplete: getChangeHandler(value, "size", onChangeComplete),
          }}
        />
      );
    }
  };

const getChangeHandler = memoize(
  (image: any, property: string, callback: any) => (value) => {
    callback({
      ...image,
      type: CSSBackgroundType.IMAGE,
      [property]: value,
    });
  }
);
