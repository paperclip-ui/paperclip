import * as React from "react";
import * as cx from "classnames";
import { BaseTblrInputProps } from "./view.pc";
import { ButtonBarOption } from "../../../../../../../inputs/button-bar/controller";
import {
  EmptySquareIcon,
  BordersIcon3
} from "../../../../../../../../icons/view.pc";
import { memoize } from "tandem-common";

export type Props = {
  connected?: boolean;
  selectedId: string;
  connectedIcon?: any;
  disconnectedIcon?: any;
};

type State = {
  connected: boolean;
  selectedId: string;
};

export default (Base: React.ComponentClass<BaseTblrInputProps>) =>
  class TBLRController extends React.PureComponent<Props, State> {
    state = {
      connected: this.props.connected,
      selectedId: this.props.selectedId
    };
    static getDerivedStateFromProps(props: Props, state: State) {
      if (props.selectedId !== state.selectedId) {
        return {
          ...state,
          connected: props.connected,
          selectedId: props.selectedId
        };
      }
      return null;
    }
    onToggleOptionChange = (connected: boolean) => {
      this.setState({ connected });
    };
    render() {
      const { onToggleOptionChange } = this;
      const { connected } = this.state;
      const { connectedIcon, disconnectedIcon, ...rest } = this.props;
      return (
        <Base
          {...rest}
          variant={cx({
            connected,
            disconnected: !connected
          })}
          primaryInputProps={null}
          firstInputProps={null}
          secondInputProps={null}
          thirdInputProps={null}
          fourthInputProps={null}
          togglerProps={{
            value: connected,
            options: getButtonBarOptions(connectedIcon, disconnectedIcon),
            onChangeComplete: onToggleOptionChange
          }}
        />
      );
    }
  };

const getButtonBarOptions = memoize(
  (connectedIcon: any, disconnectedIcon: any): ButtonBarOption[] => [
    {
      icon: connectedIcon || (
        <EmptySquareIcon style={{ height: "9px", width: "9px" }} />
      ),
      value: true
    },
    {
      icon: disconnectedIcon || (
        <BordersIcon3 style={{ height: "9px", width: "9px" }} />
      ),
      value: false
    }
  ]
);
