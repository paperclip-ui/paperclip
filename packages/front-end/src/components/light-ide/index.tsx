/**
 * light IDE for text inputs - used particularly for editing raw CSS
 */

/*

TODOS:

- [ ] copy / paste
- [ ] left / right arrows
- [ ] ctrl+a
- [ ] backspace
- [ ] shift backspace
*/

import "./index.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { PreviewComponent } from "./preview";
import { calcCaretPosition } from "./utils";
import { LightIDETextToken } from "./state";
import { compose, pure, withHandlers } from "recompose";

export type LightIDEComponentOuterProps = {
  tokens: LightIDETextToken[];
};

export type LightIDEComponentInnerProps = {
  onMouseDown: () => any;
} & LightIDEComponentOuterProps;

const BaseLightIDEComponent = ({
  tokens,
  onMouseDown
}: LightIDEComponentInnerProps) => {
  return (
    <div className="m-light-text-editor" tabIndex={0} onMouseDown={onMouseDown}>
      <PreviewComponent tokens={tokens} />
      <div className="cursor" />
    </div>
  );
};

const enhance = compose<
  LightIDEComponentOuterProps,
  LightIDEComponentOuterProps
>(
  pure,
  withHandlers({
    onMouseDown: ({ tokens }) => (event: React.MouseEvent<any>) => {
      const pos = calcCaretPosition(
        ReactDOM.findDOMNode(this) as HTMLElement,
        tokens,
        event.nativeEvent
      );
    }
  })
);

export const LightIDEComponent = enhance(BaseLightIDEComponent);

export * from "./state";
