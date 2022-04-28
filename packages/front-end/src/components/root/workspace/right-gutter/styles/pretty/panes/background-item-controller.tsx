import * as React from "react";
import { BaseBackgroundItemProps } from "./backgrounds.pc";
import { PCVariable } from "paperclip";
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";
import {
  CSSBackground,
  stringifyCSSBackground
} from "./inputs/background/state";

export type Props = {
  cwd: string;
  value: CSSBackground;
  onRemove: any;
  onChange: any;
  documentColors: string[];
  globalVariables: PCVariable[];
  onChangeComplete: (value: CSSBackground) => any;
};

export default (Base: React.ComponentClass<BaseBackgroundItemProps>) =>
  class BackgroundItemController extends React.PureComponent<Props> {
    onRemoveButtonClick = () => {
      this.props.onRemove();
    };
    render() {
      const { onRemoveButtonClick } = this;
      const {
        cwd,
        documentColors,
        value,
        onChange,
        onChangeComplete,
        globalVariables
      } = this.props;

      return (
        <Base
          backgroundInputProps={{
            cwd,
            swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(
              documentColors,
              globalVariables
            ),
            value,
            onChange,
            onChangeComplete
          }}
          labelProps={{
            text: stringifyCSSBackground(value)
          }}
          removeButtonProps={{
            onClick: onRemoveButtonClick
          }}
        />
      );
    }
  };
