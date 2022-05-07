import * as React from "react";
import { BaseSidePanelButtonProps, SidePanel } from "./view.pc";
import { Bounds, moveBounds, Point } from "tandem-common";
import cx from "classnames";

export type Props = {
  content?: any;
  left?: boolean;
  right?: boolean;
};

type State = {
  open: boolean;
};

const SIDEBAR_WIDTH = 250;

export default (Base: React.ComponentClass<BaseSidePanelButtonProps>) =>
  class SidePanelButtonController extends React.PureComponent<Props, State> {
    state = {
      open: false
    };
    onShouldClose = () => {
      this.close();
    };
    onButtonClick = () => {
      this.setState({
        ...this.state,
        open: !this.state.open
      });
    };
    updatePopoverPosition = (point: Point, popoverRect: Bounds) => {
      if (this.props.left) {
        // TODO - this needs to be pulled from state
        point = {
          left: SIDEBAR_WIDTH,
          top: point.top
        };
      } else if (this.props.right) {
        point = {
          left:
            window.innerWidth -
            (SIDEBAR_WIDTH + (popoverRect.right - popoverRect.left)),
          top: point.top
        };
      }

      return point;
    };
    onCloseButtonClick = () => {
      this.close();
    };
    onKeyUp = (event: React.KeyboardEvent<any>) => {
      if (event.key === "Enter") {
        this.close();
      }
    };
    close = () => {
      this.setState({
        ...this.state,
        open: false
      });
    };
    render() {
      const {
        onKeyUp,
        onButtonClick,
        onCloseButtonClick,
        onShouldClose,
        updatePopoverPosition
      } = this;
      const { content, left, right, ...rest } = this.props;
      const { open } = this.state;

      return (
        <Base
          {...rest}
          buttonOuterProps={{
            onClick: onButtonClick
          }}
          popoverProps={{
            open: open,
            onShouldClose: onShouldClose,
            updateContentPosition: updatePopoverPosition
          }}
          content={
            <SidePanel
              variant={cx({
                left,
                right
              })}
              content={<div onKeyUp={onKeyUp}>{content}</div>}
              closeButtonProps={{
                onClick: onCloseButtonClick
              }}
            />
          }
        />
      );
    }
  };
